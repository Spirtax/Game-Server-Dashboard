import { exec } from "child_process";
import { promisify } from "util";
import { BaseProvider } from "../../games/BaseProvider";
import { type GameType } from "@/types/GameTypes";
import path from "path";
import { ConfigService } from "../data/Config";
import { ServerListService } from "./ServerList";

const execPromise = promisify(exec);

export class ServerActionsService {
  private static readonly SERVERS_ROOT =
    process.env.SERVERS_PATH || path.resolve(process.cwd(), "../servers");

  /**
   * Toggles server state (start/stop/restart) via shell script.
   */
  public static async manageContainer(name: string, action: string) {
    try {
      const { stdout } = await execPromise(
        `../scripts/container-control.sh ${name} ${action}`,
        {
          env: {
            ...process.env,
            SERVERS_PATH: this.SERVERS_ROOT,
          },
        },
      );
      return { success: true, output: stdout.trim() };
    } catch (err: any) {
      const errorMsg = err.stderr || err.message;
      console.error(`[Shell Error]: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Creates a server using the given game type and parameters
   */
  public static async createServer(
    name: string,
    ram: string,
    gameType: GameType,
    gameRequirements: Record<string, string>,
  ) {
    const provider = BaseProvider.getProvider(gameType);
    if (!provider) {
      console.error(`Provider for game type "${gameType}" does not exist.`);
      return {
        success: false,
        error: `Provider for game type "${gameType}" does not exist.`,
      };
    }

    try {
      const ramMB = parseInt(ram, 10);

      if (isNaN(ramMB)) {
        throw new Error("Invalid RAM allocation provided.");
      }

      // Create the servers config
      ConfigService.updateServer(name, { gameType: gameType });

      // Create the servers folder
      await BaseProvider.createServer(gameType, name, ramMB, gameRequirements);

      // Initialize the docker container so it displays on the dashboard
      const dockerResult = await this.manageContainer(name, "create");
      if (!dockerResult.success) {
        throw new Error(
          dockerResult.error || "Failed to initialize Docker container.",
        );
      }

      // Force reload server list
      await ServerListService.listServers();

      return {
        success: true,
        message: `${gameType} server "${name}" created.`,
      };
    } catch (error: any) {
      console.error(
        `[ServerService] Error creating ${gameType} server:`,
        error,
      );

      return {
        success: false,
        error: error.message || "Internal creation error",
      };
    }
  }

  /**
   * Deletes a server instance from Docker and removes its configuration entry.
   */
  public static async deleteServer(name: string) {
    try {
      const dockerResult = await this.manageContainer(name, "delete");
      if (!dockerResult.success) {
        throw new Error(
          `Failed to remove Docker resources: ${dockerResult.error}`,
        );
      }

      await ConfigService.deleteServer(name);
      return {
        success: true,
        message: `Server "${name}" and its configuration have been deleted.`,
      };
    } catch (error: any) {
      console.error(`[ServerService] Error during deletion of ${name}:`, error);
      return {
        success: false,
        error: error.message || "Internal deletion error",
      };
    }
  }
}
