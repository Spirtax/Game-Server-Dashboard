import Docker from "dockerode";
import * as CONSTANTS from "../ServiceConstants";
import fs from "fs";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export interface HistoryItem {
  key: Date;
  data: number;
}

export interface ContainerHistory {
  cpu: HistoryItem[];
  ram: HistoryItem[];
  netIn: HistoryItem[];
  netOut: HistoryItem[];
  diskUsage: string;
}

class ContainerStatsService {
  private statsCache: Record<string, ContainerHistory> = {};
  private lastTotalBytes: Record<string, { rx: number; tx: number }> = {};
  private rollingBuffer: Record<string, { rx: number[]; tx: number[] }> = {};
  private diskUsageCache: Record<string, string> = {};

  constructor() {
    this.startPolling();
    this.startDiskPolling();
  }

  /*
   * Retrieves cached history for a container or initializes a new entry
   */
  public getHistory(containerName: string): ContainerHistory {
    if (!this.statsCache[containerName]) {
      this.statsCache[containerName] = {
        cpu: [],
        ram: [],
        netIn: [],
        netOut: [],
        diskUsage: "Calculating...",
      };

      this.fetchDiskUsage(containerName).then((size) => {
        this.diskUsageCache[containerName] = size;
      });
    }

    return {
      ...this.statsCache[containerName],
      diskUsage: this.diskUsageCache[containerName] || "Calculating...",
    };
  }

  /*
   * Starts high-frequency interval to fetch and process real-time Docker stats
   */
  private startPolling() {
    setInterval(async () => {
      const activeContainers = Object.keys(this.statsCache);
      for (const name of activeContainers) {
        const stats = await this.fetchRawDockerStats(name);
        if (stats) this.processAndCache(name, stats);
      }
    }, 1000);
  }

  /*
   * Starts low-frequency interval to update disk usage cache for active containers
   */
  private startDiskPolling() {
    setInterval(async () => {
      const activeContainers = Object.keys(this.statsCache);
      for (const name of activeContainers) {
        this.diskUsageCache[name] = await this.fetchDiskUsage(name);
      }
    }, 60000);
  }

  /*
   * Locates container data mount on host and calculates its storage size
   */
  private async fetchDiskUsage(serverName: string): Promise<string> {
    try {
      const path = await import("path");
      const baseServersPath = process.env.SERVERS_PATH;
      const serverPath = path.resolve(
        baseServersPath || path.join(process.cwd(), "../servers"),
        serverName,
      );

      const { execSync } = await import("child_process");
      const output = execSync(`sudo du -sb "${serverPath}"`, {
        encoding: "utf8",
      });

      const bytes = parseInt(output.split(/\s+/)[0], 10);
      if (!bytes || isNaN(bytes)) return "0 B";

      const units = ["B", "KB", "MB", "GB", "TB"];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(2)} ${units[unitIndex]}`;
    } catch (err) {
      console.error(`Disk usage failed for ${serverName}:`, err);
      return "0 B";
    }
  }

  /*
   * Fetches raw resource metrics directly from the Docker engine API
   */
  private async fetchRawDockerStats(containerName: string) {
    try {
      const container = docker.getContainer(containerName);
      const stats = await container.stats({ stream: false });

      const cpuDelta =
        stats.cpu_stats.cpu_usage.total_usage -
        stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta =
        stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      let cpu =
        systemDelta > 0 && cpuDelta > 0
          ? (cpuDelta / systemDelta) * CONSTANTS.CPU_CORES * 100
          : 0;

      const memStats = stats.memory_stats;
      const cache = memStats.stats?.inactive_file || memStats.stats?.cache || 0;
      const ramPercent =
        memStats.limit > 0
          ? ((memStats.usage - cache) / memStats.limit) * 100
          : 0;

      let rxBytes = 0;
      let txBytes = 0;
      Object.values(stats.networks || {}).forEach((net: any) => {
        rxBytes += net.rx_bytes;
        txBytes += net.tx_bytes;
      });

      return {
        cpu: cpu / CONSTANTS.CPU_CORES,
        ram: ramPercent,
        rxBytes,
        txBytes,
        time: new Date(),
      };
    } catch {
      return null;
    }
  }

  /*
   * Calculates deltas, smooths network data, and updates the history cache
   */
  private processAndCache(name: string, stats: any) {
    if (!this.lastTotalBytes[name])
      this.lastTotalBytes[name] = { rx: stats.rxBytes, tx: stats.txBytes };
    if (!this.rollingBuffer[name])
      this.rollingBuffer[name] = { rx: [], tx: [] };

    const currentDeltaIn =
      (stats.rxBytes - this.lastTotalBytes[name].rx) / 1024 / 1024;
    const currentDeltaOut =
      (stats.txBytes - this.lastTotalBytes[name].tx) / 1024 / 1024;

    this.lastTotalBytes[name] = { rx: stats.rxBytes, tx: stats.txBytes };

    const buffer = this.rollingBuffer[name];
    buffer.rx.push(currentDeltaIn > 0 ? currentDeltaIn : 0);
    buffer.tx.push(currentDeltaOut > 0 ? currentDeltaOut : 0);
    if (buffer.rx.length > 3) buffer.rx.shift();
    if (buffer.tx.length > 3) buffer.tx.shift();

    const avgIn = buffer.rx.reduce((a, b) => a + b, 0) / buffer.rx.length;
    const avgOut = buffer.tx.reduce((a, b) => a + b, 0) / buffer.tx.length;

    const history = this.statsCache[name];
    const update = (list: HistoryItem[], value: number) => {
      list.push({ key: stats.time, data: value });
      if (list.length > CONSTANTS.MAX_HISTORY_IN_SECONDS) list.shift();
    };

    update(history.cpu, stats.cpu);
    update(history.ram, stats.ram);
    update(history.netIn, avgIn);
    update(history.netOut, avgOut);
  }
}

export const containerStatsService = new ContainerStatsService();
