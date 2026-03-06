import { jobService } from "./JobService";

export class JobRunner {
  static async execute(
    jobId: string,
    task: (onUpdate: (msg: string | Buffer) => void) => Promise<void>,
  ) {
    const onUpdate = (msg: string | Buffer) => {
      const rawMsg = msg.toString();
      const lines = rawMsg
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) return;

      const currentJob = jobService.getJob(jobId);
      const updatedLogs = [...(currentJob?.logs || []), ...lines];

      jobService.updateJob(jobId, {
        message: lines[lines.length - 1],
        logs: updatedLogs,
      });
    };

    jobService.updateJob(jobId, {
      status: "running",
      message: "Starting task...",
      progress: 0,
      logs: ["Starting task..."],
    });

    try {
      await task(onUpdate);

      jobService.updateJob(jobId, {
        status: "completed",
        message: "Task finished!",
        progress: 100,
      });
    } catch (error: any) {
      jobService.updateJob(jobId, {
        status: "failed",
        message: `Task failed: ${error.message}`,
        error: error.message,
      });
      throw error;
    }
  }
}
