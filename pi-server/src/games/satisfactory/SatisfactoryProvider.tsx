import Docker from "dockerode";
import type { GameProvider } from "@/types/GameProvider";
import fs from "fs/promises";
import path from "path";
import { BaseProvider } from "../BaseProvider";
import { GAME_TYPE } from "@/types/GameTypes";
import { exec } from "child_process";
import { promisify } from "util";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const execAsync = promisify(exec);

export class SatisfactoryProvider implements GameProvider {
  static readonly DEFAULT_STATS: Record<string, any> = {};

  // Satisfactory servers are not built for raspberry pi's, so we need to clone a repo that uses an emulator to run the server on ARM64 architecture.
  public async createServer(
    name: string,
    ram: number,
    gameRequirements: Record<string, string>,
    serverPath: string,
    _dataPath: string,
  ): Promise<void> {
    if (await fs.stat(serverPath).catch(() => null)) {
      await fs.rm(serverPath, { recursive: true, force: true });
    }

    const repoUrl =
      "https://github.com/sa-shiro/Satisfactory-Dedicated-Server-ARM64-Docker.git";
    await execAsync(`git clone ${repoUrl} "${serverPath}"`);

    const composeContent = await BaseProvider.generateFromTemplate(
      GAME_TYPE.SATISFACTORY,
      {
        CONTAINER_NAME: name,
        RAM: ram,
      },
    );

    const outputPath = path.join(serverPath, "docker-compose.yml");
    await fs.writeFile(outputPath, composeContent);

    const gameDataPath = path.join(serverPath, "satisfactory");
    const configPath = path.join(serverPath, "config");
    await fs.mkdir(gameDataPath, { recursive: true });
    await fs.mkdir(configPath, { recursive: true });

    await execAsync(
      `sudo chown -R 1000:1000 "${gameDataPath}" "${configPath}"`,
    );

    await execAsync(`chmod +x build.sh init-server.sh run.sh`, {
      cwd: serverPath,
    });

    await execAsync(`sh build.sh`, { cwd: serverPath });
    await execAsync(`docker compose up -d`, { cwd: serverPath });
  }

  public async ping(_host: string, port: number): Promise<boolean> {
    try {
      const containers = await docker.listContainers();
      const targetContainerInfo = containers.find((c) =>
        c.Ports.some((p) => p.PublicPort === port),
      );

      if (!targetContainerInfo) return false;

      const container = docker.getContainer(targetContainerInfo.Id);
      const exec = await container.exec({
        Cmd: ["pgrep", "-f", "FactoryServer"],
        AttachStdout: true,
      });

      const stream = await exec.start({});
      return await new Promise<boolean>((resolve) => {
        let output = "";
        stream.on("data", (chunk) => {
          output += chunk.toString();
        });

        stream.on("end", () => {
          resolve(output.trim().length > 0);
        });

        stream.on("error", () => {
          resolve(false);
        });

        setTimeout(() => {
          stream.destroy();
          resolve(false);
        }, 2000);
      });
    } catch (error) {
      return false;
    }
  }

  // Since Satisfactory literally only provides 2 commands (for servers): quit and save, we need to monitor the logs in order to get player count.
  public async getPlayerCount(
    containerName: string,
  ): Promise<{ playerCount: number; playerCountMax: number }> {
    try {
      const container = docker.getContainer(containerName);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 1000,
        follow: false,
      });

      const logString = logs.toString("utf8");
      const joins = (logString.match(/LogNet: Join succeeded:/g) || []).length;
      const leaves = (logString.match(/LogNet: UNetConnection::Close/g) || [])
        .length;

      let currentPlayers = joins - leaves;
      if (currentPlayers < 0) currentPlayers = 0;

      return {
        playerCount: currentPlayers,
        playerCountMax: 4, //Satisfactory's official supported max player count is 4
      };
    } catch (error) {
      return { playerCount: 0, playerCountMax: 4 };
    }
  }

  public async getVersion(containerName: string): Promise<string> {
    return "Latest Version";
  }

  async getAllStats(containerName: string): Promise<Record<string, any>> {
    try {
      return {
        ...SatisfactoryProvider.DEFAULT_STATS,
      };
    } catch {
      return SatisfactoryProvider.DEFAULT_STATS;
    }
  }
}
