import type { GameType } from "@/types/GameTypes";
import { BaseProvider } from "@/games/BaseProvider";

export class ServerGameStatsService {
  public static async getGameSpecificStats(
    containerName: string,
    gameType: GameType,
  ) {
    try {
      const provider = BaseProvider.getProvider(gameType);
      if (provider) {
        return await provider.getAllStats(containerName);
      }

      return {};
    } catch (error) {
      console.error(
        `Error getting game-specific stats for ${containerName}:`,
        error,
      );
      return {};
    }
  }
}
