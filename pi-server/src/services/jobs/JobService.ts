export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  message: string;
  logs: string[];
  progress: number;
  error?: string;
}

class JobService {
  private jobs: Map<string, Job> = new Map();

  updateJob(id: string, updates: Partial<Job>) {
    const existing = this.jobs.get(id) || {
      id,
      status: "pending" as JobStatus,
      message: "",
      logs: [],
      progress: 0,
    };
    this.jobs.set(id, { ...existing, ...updates });
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  deleteJob(id: string): boolean {
    return this.jobs.delete(id);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }
}

export const jobService = new JobService();
