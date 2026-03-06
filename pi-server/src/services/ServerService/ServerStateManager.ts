import Docker from "dockerode";
import { ConfigService } from "../data/Config";
import { ServerActionsService } from "./ServerActions";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export class ServerStateManagerService {
  private static readonly PENDING_TIMEOUT = 5000;

  public static async performAction(name: string, action: string) {
    const containers = await docker.listContainers({ all: true });
    const info = containers.find((c) =>
      c.Names.some((n) => n.replace("/", "") === name),
    );

    if (action === "start") {
      if (!info) {
        const dockerResult = await ServerActionsService.manageContainer(
          name,
          "create",
        );
        if (!dockerResult.success) {
          throw new Error(
            dockerResult.error || "Failed to initialize Docker container.",
          );
        }
      }

      const updatedContainers = await docker.listContainers({ all: true });
      const newInfo = updatedContainers.find((c) =>
        c.Names.some((n) => n.replace("/", "") === name),
      );

      if (!newInfo) throw new Error("Server not found after initialization");

      const container = docker.getContainer(newInfo.Id);
      try {
        await container.start();
        return { success: true };
      } catch (err: any) {
        if (err.statusCode === 304) return { success: true };
        throw err;
      }
    }

    if (!info) throw new Error("Server not found");
    const container = docker.getContainer(info.Id);

    try {
      if (action === "stop") await container.stop();
      else if (action === "restart") await container.restart();
      return { success: true };
    } catch (err: any) {
      if (err.statusCode === 304) return { success: true };
      throw err;
    }
  }

  public static async setPendingState(name: string, action: string) {
    const stateMap: Record<string, string> = {
      start: "starting",
      stop: "stopping",
      restart: "restarting",
    };

    ConfigService.updateServer(name, {
      pendingStatus: stateMap[action] || "starting",
      lastActionTime: Date.now(),
    });
  }

  public static async getServerState(name: string) {
    const containers = await docker.listContainers({ all: true });
    const info = containers.find((c) =>
      c.Names.some((n) => n.replace("/", "") === name),
    );

    if (!info) return null;

    const details = await docker.getContainer(info.Id).inspect();
    const serverEntry = ConfigService.getServerConfig(name) || ({} as any);
    const containerStatus = details.State.Status.toLowerCase();
    const timeSinceAction = Date.now() - (serverEntry.lastActionTime || 0);

    let status = "offline";

    if (serverEntry.pendingStatus && timeSinceAction < this.PENDING_TIMEOUT) {
      status = serverEntry.pendingStatus;
    } else if (containerStatus === "running") {
      status = "online";
      if (serverEntry.pendingStatus) {
        ConfigService.updateServer(name, { pendingStatus: null });
      }
    } else {
      status = "offline";
      if (serverEntry.pendingStatus) {
        ConfigService.updateServer(name, { pendingStatus: null });
      }
    }

    return {
      id: info.Id,
      name,
      status,
    };
  }
}
