import Docker from "dockerode";
import fs from "fs/promises";
import path from "path";
import { ConfigService } from "../data/Config";
import { BaseProvider } from "@/games/BaseProvider";
import { type GameType, GAME_TYPE } from "@/types/GameTypes";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export class ServerListService {
  private static readonly SERVERS_ROOT =
    process.env.SERVERS_PATH || path.resolve(process.cwd(), "../servers");

  public static async listServers() {
    const folders = await fs.readdir(this.SERVERS_ROOT);
    const containers = await docker.listContainers({ all: true });
    const persistentData = ConfigService.getFullConfig();

    const serverStats = await Promise.all(
      folders.map(async (folderName) => {
        const serverPath = path.join(this.SERVERS_ROOT, folderName);
        const stats = await fs.stat(serverPath);

        if (!stats.isDirectory()) return null;

        const serverConfig = persistentData[folderName] || {};
        const gameType: GameType = serverConfig.gameType as GameType;

        const info = containers.find((c) =>
          c.Names.some((n) => n.replace("/", "") === folderName),
        );

        let containerStatus = "offline";
        let containerId = null;
        let inspect = null;

        if (info) {
          containerId = info.Id;
          const container = docker.getContainer(info.Id);
          inspect = await container.inspect();
          containerStatus = inspect.State.Status.toLowerCase();
        }

        const provider = gameType
          ? BaseProvider.getProvider(gameType)
          : undefined;
        let version = serverConfig.version || "Unknown Version";
        let startTime = serverConfig.startTime || null;
        let displayPlayerCount = `0/${serverConfig.maxPlayerCount || 0}`;
        let hostPort = null;
        let status = this.mapStatus(containerStatus);

        if (inspect) {
          const portKey =
            gameType === GAME_TYPE.SATISFACTORY ? "7777/udp" : "25565/tcp";
          const portBindings =
            inspect.NetworkSettings.Ports[portKey] ||
            Object.values(inspect.NetworkSettings.Ports)[0];
          hostPort = portBindings?.[0]?.HostPort
            ? parseInt(portBindings[0].HostPort)
            : null;
        }

        if (containerStatus === "running" && hostPort && provider) {
          status = "starting";
          const isPingable = await BaseProvider.ping(gameType, hostPort);

          if (isPingable) {
            status = "online";
            const p = await provider.getPlayerCount(folderName);
            displayPlayerCount = `${p.playerCount}/${p.playerCountMax}`;
            version = (await provider.getVersion(folderName)) || version;

            if (!startTime) startTime = Date.now().toString();

            ConfigService.updateServer(folderName, {
              version: version,
              maxPlayerCount: p.playerCountMax.toString(),
              startTime: startTime,
            });
          } else {
            this.resetServerUptime(folderName);
            startTime = null;
          }
        } else {
          this.resetServerUptime(folderName);
          startTime = null;
        }

        return {
          id: containerId,
          name: folderName,
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

    return serverStats.filter(Boolean);
  }

  private static resetServerUptime(containerName: string) {
    ConfigService.updateServer(containerName, { startTime: null });
  }

  private static mapStatus(dockerStatus: string): string {
    if (dockerStatus === "running") return "starting";
    return "offline";
  }
}
