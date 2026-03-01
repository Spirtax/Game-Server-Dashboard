import { ProviderRegistry } from "@/games/ProviderRegistry";
import { type GameType } from "@/types/GameTypes";

import path from "path";
import fs from "fs/promises";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class BaseProvider {
  private static readonly SERVERS_ROOT =
    process.env.SERVERS_PATH || path.resolve(process.cwd(), "../servers");

  /**
   * Returns the data provider for a specific game type from the central registry.
   */
  public static getProvider(gameType: GameType) {
    const TargetClass = ProviderRegistry[gameType];
    return TargetClass ? new TargetClass() : undefined;
  }

  /*
   * Creates a server of the given game type
   */
  public static async createServer(
    gameType: GameType,
    name: string,
    ram: number,
    gameRequirements: Record<string, string>,
  ): Promise<void> {
    const provider = this.getProvider(gameType);
    if (!provider) {
      throw new Error(
        `Execution failed: No provider found for game type "${gameType}".`,
      );
    }

    const { serverPath, dataPath } = await this.prepareServerFolder(name);
    return await provider.createServer(
      name,
      ram,
      gameRequirements,
      serverPath,
      dataPath,
    );
  }

  /*
   * Using the game type, we fetch the appropriate docker template for the server
   */
  public static async generateFromTemplate(
    templateName: string,
    data: Record<string, string | number>,
  ): Promise<string> {
    const templatePath = path.resolve(
      __dirname,
      "../templates",
      `${templateName}.yml`,
    );

    try {
      let content = await fs.readFile(templatePath, "utf-8");

      for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        content = content.replace(placeholder, String(value));
      }

      return content;
    } catch (error) {
      console.error(`Error reading template ${templateName}:`, error);
      throw new Error(`Failed to load template for ${templateName}`);
    }
  }

  /*
   * Responsible for creating the server folder for each server
   */
  protected static async prepareServerFolder(name: string) {
    const serverPath = path.join(this.SERVERS_ROOT, name);
    const dataPath = path.join(serverPath, "data");

    await fs.mkdir(dataPath, { recursive: true });

    return { serverPath, dataPath };
  }

  /*
   * Grabs the given game types provider and calls its ping function
   */
  public static async ping(gameType: GameType, port: number) {
    const provider = this.getProvider(gameType);
    if (!provider) {
      console.error(`Provider for game type "${gameType}" does not exist.`);
      return {
        success: false,
        error: `Provider for game type "${gameType}" does not exist.`,
      };
    }

    try {
      return await provider.ping("127.0.0.1", port);
    } catch (error: any) {
      const errorCode = error.code || "";
      const errorMessage = error.message || "";

      const isExpectedError =
        ["EPIPE", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET"].includes(
          errorCode,
        ) ||
        errorMessage.includes("Socket closed unexpectedly") ||
        errorMessage.includes("Server is offline or unreachable");

      if (isExpectedError) return null;

      console.error(`Ping failed for ${gameType}:`, error);
      return null;
    }
  }
}
