import { jobService } from "@/services/jobs/JobService";
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const allJobs = jobService.getAllJobs();

  res.json({
    count: allJobs.length,
    jobs: allJobs,
  });
});

router.get("/:id", (req, res) => {
  const job = jobService.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(job);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const deleted = jobService.deleteJob(id);

  if (deleted) {
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

export default router;
