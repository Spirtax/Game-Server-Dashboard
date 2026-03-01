import os from "os";

// This service is used for calculating the system running the server cluster
export class SystemStatsService {
  private static readonly MAX_HISTORY = 60;
  private static cpuHistory: { key: Date; data: number }[] = [];
  private static ramHistory: { key: Date; data: number }[] = [];

  public static init() {
    setInterval(async () => {
      const cpu = await this.calculateCPUUsage(200);
      const usedMemPercent =
        ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
      const now = new Date();

      this.cpuHistory.push({ key: now, data: cpu });
      this.ramHistory.push({ key: now, data: usedMemPercent });

      if (this.cpuHistory.length > this.MAX_HISTORY) this.cpuHistory.shift();
      if (this.ramHistory.length > this.MAX_HISTORY) this.ramHistory.shift();
    }, 1000);
  }

  public static getHistory() {
    const formatData = (history: { key: Date; data: number }[]) => {
      return history.map((item, index) => ({
        id: index,
        key: item.key,
        data: parseFloat(item.data.toFixed(2)),
      }));
    };

    return {
      cpu: formatData(this.cpuHistory),
      ram: formatData(this.ramHistory),
    };
  }

  private static async calculateCPUUsage(intervalMs: number): Promise<number> {
    const start = os.cpus().map((cpu) => ({ ...cpu.times }));
    await new Promise((r) => setTimeout(r, intervalMs));
    const end = os.cpus().map((cpu) => ({ ...cpu.times }));

    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < start.length; i++) {
      const s = start[i];
      const e = end[i];
      const idle = e.idle - s.idle;
      const total =
        e.user -
        s.user +
        e.nice -
        s.nice +
        e.sys -
        s.sys +
        e.irq -
        s.irq +
        idle;
      idleDiff += idle;
      totalDiff += total;
    }
    return totalDiff === 0 ? 0 : (1 - idleDiff / totalDiff) * 100;
  }
}
