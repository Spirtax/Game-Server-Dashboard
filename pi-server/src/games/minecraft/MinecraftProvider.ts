import Docker from "dockerode";
import type { GameProvider } from "@/types/GameProvider";
import * as mc from "minecraft-server-util";
import fs from "fs/promises";
import yaml from "yaml";
import { getComposePath } from "@/utils/pathUtils";
import path from "path";
import { BaseProvider } from "../BaseProvider";
import { GAME_TYPE } from "@/types/GameTypes";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export class MinecraftProvider implements GameProvider {
  static readonly DEFAULT_STATS: Record<string, any> = {
    tps: "0.0",
    players: {
      online: 0,
      max: 0,
      list: [],
    },
    entityCount: 0,
  };

  public async createServer(
    name: string,
    ram: number,
    gameRequirements: Record<string, string>,
    serverPath: string,
    _dataPath: string,
  ): Promise<void> {
    const composeContent = await BaseProvider.generateFromTemplate(
      GAME_TYPE.MINECRAFT,
      {
        CONTAINER_NAME: name,
        RAM: ram,
        TYPE: gameRequirements.type || "PAPER",
        VERSION: gameRequirements.version || "1.21.9",
      },
    );

    const outputPath = path.join(serverPath, "docker-compose.yml");
    await fs.writeFile(outputPath, composeContent);
  }

  public async ping(host: string, port: number): Promise<boolean> {
    try {
      const response = await mc.status(host, port, { timeout: 1000 });
      return response !== null;
    } catch (error) {
      return false;
    }
  }

  // Used to execute RCON commands inside the Minecraft console to fetch stats
  private static async executeRcon(
    containerName: string,
    cmd: string[],
  ): Promise<string> {
    try {
      const container = docker.getContainer(containerName);
      const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({});
      return await new Promise<string>((resolve, reject) => {
        let result = "";
        stream.on("data", (chunk) => {
          result += chunk
            .toString("utf8")
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();
        });
        stream.on("end", () => resolve(result));
        stream.on("error", reject);
      });
    } catch {
      return "";
    }
  }

  /*
   * Gets the player count and max player count in the format { playerCount: number, playerCountMax: number }
   */
  public async getPlayerCount(
    containerName: string,
  ): Promise<{ playerCount: number; playerCountMax: number }> {
    const output = await MinecraftProvider.executeRcon(containerName, [
      "rcon-cli",
      "list",
    ]);

    const fallback = { playerCount: 0, playerCountMax: 0 };
    if (!output) return fallback;

    const cleanOutput = output.replace(/§[0-9a-fk-or]/gi, "");
    const marker = "online:";
    const parts = cleanOutput.split(new RegExp(marker, "i"));

    if (parts.length < 2) return fallback;

    const summary = parts[0];
    const countMatch = summary.match(/(\d+)\s+(?:of|out of)\s+.*?(\d+)/i);

    if (countMatch) {
      return {
        playerCount: parseInt(countMatch[1], 10),
        playerCountMax: parseInt(countMatch[2], 10),
      };
    }

    return fallback;
  }

  /**
   * Extracts the Server Type and Version from docker-compose file.
   * Formats output based on TYPE (e.g., "Paper 1.21.9" or "Modded 1.19.2").
   */
  public async getVersion(containerName: string): Promise<string> {
    const composePath = getComposePath(containerName);

    try {
      await fs.access(composePath);
      const fileContent = await fs.readFile(composePath, "utf8");
      const { services } = yaml.parse(fileContent);

      const env = services?.[containerName]?.environment;
      if (!env) return "Version: Unknown";

      const getEnv = (key: string): string | undefined => {
        const val = Array.isArray(env)
          ? env
              .find((v) => typeof v === "string" && v.startsWith(`${key}=`))
              ?.split("=")[1]
          : env[key];
        return val?.toString().replace(/['"]/g, "").trim();
      };

      const type = getEnv("TYPE");
      const version = getEnv("VERSION");

      if (!version) return "Version: Unknown";

      const typeMap: Record<string, string> = {
        PAPER: `Paper ${version}`,
        AUTO_CURSEFORGE: `Modded ${version}`,
      };

      return typeMap[type || ""] || `Version: ${version}`;
    } catch (error) {
      return "Version: Unknown";
    }
  }

  async getAllStats(containerName: string): Promise<Record<string, any>> {
    try {
      const [tps, players, entityCount] = await Promise.all([
        MinecraftProvider.getTPS(containerName),
        MinecraftProvider.getPlayers(containerName),
        MinecraftProvider.getEntityCount(containerName),
      ]);

      return {
        ...MinecraftProvider.DEFAULT_STATS,
        tps,
        players,
        entityCount,
      };
    } catch {
      return MinecraftProvider.DEFAULT_STATS;
    }
  }

  /*
   * A optimized way to do this would be to run each command at once instead of a separate exec for each
   * However, this is all only called in the modal and thats it, so I am using this method
   */
  private static async getTPS(containerName: string): Promise<number> {
    const output = await MinecraftProvider.executeRcon(containerName, [
      "rcon-cli",
      "tps",
    ]);
    if (!output) return 20.0;

    const match = output.match(/(\d{1,2}\.\d{1,2})/);
    if (match) {
      const tps = parseFloat(match[1]);
      return tps > 20 ? 20.0 : tps;
    }
    return 20.0;
  }

  /*
   * Below function grabs the full player list. This is useful for displaying names of people on the server in the dashboard
   */
  private static async getPlayers(containerName: string): Promise<string[]> {
    const output = await MinecraftProvider.executeRcon(containerName, [
      "rcon-cli",
      "list",
    ]);

    if (!output) return [];

    const cleanOutput = output.replace(/§[0-9a-fk-or]/gi, "");
    const marker = "online:";
    const parts = cleanOutput.split(new RegExp(marker, "i"));

    if (parts.length < 2) {
      return [];
    }

    const playerString = parts[1].trim();

    return playerString
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  // Only valid for version 1.13+ with the "execute if entity" command
  // If needed, use /testfor @e for versions 1.8-1.12 (TODO, will implement this later)
  // If you need older, you'll have to find that out yourself
  private static async getEntityCount(containerName: string) {
    const output = await MinecraftProvider.executeRcon(containerName, [
      "rcon-cli",
      "execute if entity @e",
    ]);

    if (!output) return 0;

    const match = output.match(/[Cc]ount:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
