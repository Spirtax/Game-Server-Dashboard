export interface GameProvider {
  /**
   * GameStatsProvider is responsible for fetching game-specific stats, such as player count, server performance, and ping results.
   * It provides methods to retrieve these stats for a given game server or container.
   *
   * They should populate the following classes PROVIDER objects:
   * Ping.ts class' PING_PROVIDERS object with the appropriate provider for their game
   * GameStats.ts class' GAME_PROVIDERS object with the appropriate provider for their game
   *
   */

  // The createServer method is used to create a game server of the given type. The requirements
  // should follow what is written in the games GameComponent class. All servers are created using a docker file, and call the BaseProvider to instantiate the folder
  createServer(
    name: string,
    ram: number,
    requirements: Record<string, string>,
    serverPath: string,
    dataPath: string,
    onUpdate?: (msg: string | Buffer) => void,
  ): Promise<void>;

  // The ping method is used to check if the server is online. If we get a ping back from the server, return true else false.
  ping(host: string, port: number): Promise<boolean>;

  // The getAllStats method is used to fetch all relevant stats for the server, such as TPS, player list, entity count, etc. (Called in the ServerGameStatsService)
  // It returns an object containing these stats, or null if the server is offline or if fetching stats fails.
  // Make sure all stats are added to StatType.ts
  getAllStats(containerName: string): Promise<Record<string, any>>;

  // getVersion and getPlayercount are for displaying the server's version and player count on the server card.
  // This should grab either the version the game is running or the map the game is running.
  getVersion(containerName: string): Promise<string>;

  // Get the player count of the server. Format is "current/max" (e.g. "5/20"). If the player count cannot be determined, return "0/?".
  getPlayerCount(containerName: string): Promise<{
    playerCount: number;
    playerCountMax: number;
  }>;
}
