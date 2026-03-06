import type { GameProvider } from "@/types/GameProvider";

export class ArkProvider implements GameProvider {
  static readonly DEFAULT_STATS: Record<string, any> = {};

  public async createServer(
    name: string,
    ram: number,
    gameRequirements: Record<string, string>,
    serverPath: string,
    _dataPath: string,
  ): Promise<void> {}

  public async ping(_host: string, port: number): Promise<boolean> {
    return true;
  }

  public async getPlayerCount(
    containerName: string,
  ): Promise<{ playerCount: number; playerCountMax: number }> {
    return { playerCount: 0, playerCountMax: 0 };
  }

  public async getVersion(containerName: string): Promise<string> {
    return "Latest Verison";
  }

  async getAllStats(containerName: string): Promise<Record<string, any>> {
    try {
      return {
        ...ArkProvider.DEFAULT_STATS,
      };
    } catch {
      return ArkProvider.DEFAULT_STATS;
    }
  }
}
