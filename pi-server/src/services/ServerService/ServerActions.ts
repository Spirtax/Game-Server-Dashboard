import { exec } from "child_process";
import { promisify } from "util";
import { BaseProvider } from "../../games/BaseProvider";
import { type GameType } from "@/types/GameTypes";
import path from "path";
import fs from "fs/promises";
import { ConfigService } from "../data/Config";
import { ServerListService } from "./ServerList";
import { jobService } from "../jobs/JobService";

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
   * Creates a server using the given game type and parameters.
   * Includes fallback cleanup if creation fails.
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

      // 1. Create the servers config first
      await ConfigService.updateServer(name, { gameType: gameType });

      // 2. Trigger the provider creation (which handles folder prep and build jobs)
      try {
        await BaseProvider.createServer(
          gameType,
          name,
          ramMB,
          gameRequirements,
        );
      } catch (creationError: any) {
        console.warn(`[Fallback] Creation failed for ${name}. Cleaning up...`);
        await this.performCleanup(name);
        throw creationError;
      }

      // 3. Force reload server list
      await ServerListService.listServers();

      return {
        success: true,
        message: `${gameType} server "${name}" initialization started.`,
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
   * Internal helper to clean up resources during a failed creation
   */
  private static async performCleanup(name: string) {
    try {
      await ConfigService.deleteServer(name);

      const folderPath = path.join(this.SERVERS_ROOT, name);
      await fs.rm(folderPath, { recursive: true, force: true });

      console.log(`[Cleanup] Successfully removed resources for ${name}`);
    } catch (cleanupError) {
      console.error(
        `[Cleanup Error] Failed to clean up ${name}:`,
        cleanupError,
      );
    }
  }

  /**
   * Deletes a server instance from Docker and removes its configuration entry.
   */
  public static async deleteServer(name: string) {
    const jobId = `delete-${name}`;

    try {
      jobService.updateJob(jobId, {
        status: "running",
        progress: 20,
        message: "Removing Docker containers...",
      });

      let containerExists = false;
      try {
        await execPromise(`docker inspect ${name}`);
        containerExists = true;
      } catch (err) {
        console.log(
          `[Delete] Container ${name} not found, skipping Docker removal.`,
        );
      }

      if (containerExists) {
        jobService.updateJob(jobId, {
          status: "running",
          progress: 30,
          message: "Removing Docker container...",
        });

        const dockerResult = await this.manageContainer(name, "delete");
        if (!dockerResult.success) {
          throw new Error(`Docker Error: ${dockerResult.error}`);
        }
      }

      jobService.updateJob(jobId, {
        status: "running",
        progress: 60,
        message: "Cleaning up files...",
      });

      await this.performCleanup(name);

      jobService.updateJob(jobId, {
        status: "completed",
        progress: 100,
        message: `Server "${name}" fully deleted.`,
      });

      return { success: true };
    } catch (error: any) {
      jobService.updateJob(jobId, {
        status: "failed",
        message: error.message,
      });

      console.error(`[ServerService] Error during deletion of ${name}:`, error);
      return { success: false, error: error.message };
    }
  }
}
