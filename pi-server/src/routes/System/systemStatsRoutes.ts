import { Router } from "express";
import { SystemStatsService } from "@/services/SystemService/SystemStats";

const router = Router();

router.get("/stats", (req, res) => {
  res.json(SystemStatsService.getHistory());
});

export default router;
