import os from "os";

export class SystemStatusService {
  /**
   * Checks the health of the entire system.
   * Returns true if the OS provides valid uptime and load data.
   */
  public getSystemStatus(): boolean {
    try {
      const uptime = os.uptime();
      const load = os.loadavg();

      return uptime > 0 && load.length > 0;
    } catch (error) {
      console.error("Internal System Check Error:", error);
      return false;
    }
  }
}

export const systemStatusService = new SystemStatusService();
