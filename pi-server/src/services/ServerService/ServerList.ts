import Docker from "dockerode";
import { ConfigService } from "../data/Config";
import { BaseProvider } from "@/games/BaseProvider";
import { type GameType, GAME_TYPE } from "@/types/GameTypes";

const docker = new Docker();

export class ServerListService {
  public static async listServers() {
    const containers = await docker.listContainers({ all: true });
    const persistentData = ConfigService.getFullConfig();

    const serverStats = await Promise.all(
      containers.map(async (info) => {
        const container = docker.getContainer(info.Id);
        const inspect = await container.inspect();
        const containerName = info.Names[0].replace("/", "");
        const containerStatus = inspect.State.Status.toLowerCase();

        const serverConfig = persistentData[containerName] || {};
        const gameType: GameType = serverConfig.gameType as GameType;
        const provider = gameType
          ? BaseProvider.getProvider(gameType)
          : undefined;

        let version = "Unknown Version";
        if (provider) {
          version =
            (await provider.getVersion(containerName)) || "Unknown Version";
        }

        let startTime = serverConfig.startTime || null;
        let displayPlayerCount = `0/${serverConfig.maxPlayerCount || 0}`;

        const portKey =
          gameType === GAME_TYPE.SATISFACTORY ? "7777/udp" : "25565/tcp";
        const portBindings =
          inspect.NetworkSettings.Ports[portKey] ||
          Object.values(inspect.NetworkSettings.Ports)[0];
        const hostPort = portBindings?.[0]?.HostPort
          ? parseInt(portBindings[0].HostPort)
          : null;

        let status = this.mapStatus(containerStatus);

        if (containerStatus === "running" && hostPort && provider) {
          status = "starting";

          const isPingable = await BaseProvider.ping(gameType, hostPort);
          if (isPingable) {
            status = "online";

            const p = await provider.getPlayerCount(containerName);
            displayPlayerCount = `${p.playerCount}/${p.playerCountMax}`;

            if (!startTime) {
              startTime = Date.now().toString();
            }

            const shouldUpdateVersion =
              !serverConfig.version ||
              serverConfig.version === "Unknown Version";
            const shouldUpdateMaxPlayers =
              !serverConfig.maxPlayerCount ||
              serverConfig.maxPlayerCount === "0";
            const isNewStartTime = startTime !== serverConfig.startTime;

            if (
              shouldUpdateVersion ||
              shouldUpdateMaxPlayers ||
              isNewStartTime
            ) {
              ConfigService.updateServer(containerName, {
                version: version,
                maxPlayerCount: p.playerCountMax.toString(),
                startTime: startTime,
              });
            }
          } else {
            this.resetServerUptime(containerName);
            startTime = null;
          }
        } else if (containerStatus !== "running") {
          this.resetServerUptime(containerName);
          startTime = null;
        }

        return {
          id: info.Id,
          name: containerName,
          status,
          port: hostPort,
          startTime,
          version,
          playerCount: displayPlayerCount,
          layout: serverConfig.layout,
          gameType: gameType || GAME_TYPE.DEFAULT,
        };
      }),
    );

    return serverStats;
  }

  private static resetServerUptime(containerName: string) {
    ConfigService.updateServer(containerName, { startTime: null });
  }

  private static mapStatus(dockerStatus: string): string {
    if (dockerStatus === "running") return "starting";
    if (["exiting", "stopping", "exited"].includes(dockerStatus))
      return "offline";
    return "offline";
  }
}
