import { Router } from "express";
import { systemStatusService } from "@/services/SystemService/SystemStatus";

const router = Router();

router.get("/status", (req, res) => {
  const isOnline = systemStatusService.getSystemStatus();
  res.json(isOnline);
});

export default router;
