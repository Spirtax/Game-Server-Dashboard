import React, { useEffect, useState } from "react";
import { dismissJob, fetchJobs } from "./JobStatus";
import { X } from "@/components/animate-ui/icons/x";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import "./JobStatusBadge.css";

interface Job {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  message: string;
  progress: number;
}

export default function JobStatusBadge() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const getUpdates = () => fetchJobs(setJobs);
    getUpdates();
    const interval = setInterval(getUpdates, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    dismissJob(id, setDismissedIds);
  };

  const visibleJobs = jobs.filter((job) => !dismissedIds.includes(job.id));

  if (visibleJobs.length === 0) return null;

  return (
    <div className="job-badge-container">
      {visibleJobs.map((job) => (
        <div key={job.id} className="job-badge-pill">
          <div className={`job-badge-dot ${job.status}`} />

          <div className="job-badge-info">
            <span className="job-badge-name">
              {job.id.replace("create-", "")}
            </span>
            <span className="job-badge-status">{job.status}</span>
          </div>

          <div className="job-badge-actions">
            {job.status === "running" && (
              <span className="job-badge-progress">{job.progress}%</span>
            )}
            {(job.status === "completed" || job.status === "failed") && (
              <AnimateIcon animateOnHover>
                <div
                  className="job-badge-dismiss"
                  onClick={() => handleDismiss(job.id)}
                >
                  <X animation="expand" size={10} />
                </div>
              </AnimateIcon>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
