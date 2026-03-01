import { Router } from "express";
import { ServerListService } from "../../services/ServerService/ServerList";

const router = Router();

router.get("/list", async (req, res) => {
  try {
    const servers = await ServerListService.listServers();
    res.json(servers);
  } catch (err: any) {
    console.error("Discovery Error:", err);
    res.status(500).json({ error: "Failed to list servers" });
  }
});

export default router;
