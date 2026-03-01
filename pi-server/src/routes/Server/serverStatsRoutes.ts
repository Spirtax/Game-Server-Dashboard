import { Router, type Request, type Response } from "express";
import { containerStatsService } from "@/services/ServerService/ContainerStats";
import { ServerGameStatsService } from "@/services/ServerService/ServerGameStats";
import { ConfigService } from "@/services/data/Config";
import type { GameType } from "@/types/GameTypes";

const router = Router();

router.get("/:name/stats", async (req: Request, res: Response) => {
  const name = req.params.name as string;
  if (!name) {
    return res.status(400).json({ error: "Server name is required" });
  }

  try {
    const config = ConfigService.getServerConfig(name);
    if (!config) {
      return res
        .status(404)
        .json({ error: `Configuration for server '${name}' not found` });
    }

    const containerHistory = containerStatsService.getHistory(name);
    if (!containerHistory) {
      return res
        .status(404)
        .json({ error: `Stats history for server '${name}' not found` });
    }

    const gameStats = await ServerGameStatsService.getGameSpecificStats(
      name,
      config.gameType as GameType,
    );

    const startTime = config.startTime || null;
    const maxPlayers = config.maxPlayerCount || 0;
    const format = (list: any[]) =>
      (list || []).map((item, i) => ({
        id: i,
        key: item.key,
        data:
          typeof item.data === "number" ? parseFloat(item.data.toFixed(2)) : 0,
      }));

    res.json({
      cpu: format(containerHistory.cpu),
      ram: format(containerHistory.ram),
      netIn: format(containerHistory.netIn),
      netOut: format(containerHistory.netOut),
      diskUsage: containerHistory.diskUsage || 0,
      startTime: startTime,
      maxPlayerCount: maxPlayers,
      ...gameStats,
    });
  } catch (error) {
    console.error(`Error fetching stats for ${name}:`, error);
    res.status(500).json({ error: "Failed to fetch container stats" });
  }
});

router.get("/:name/config", async (req: Request, res: Response) => {
  const name = req.params.name;

  if (typeof name !== "string") {
    return res.status(400).json({ error: "Invalid server name" });
  }

  try {
    const config = ConfigService.getLayout(name);

    if (!config) {
      return res.status(404).json({ error: "Server not found" });
    }

    res.json({
      gameType: config.gameType,
      layout: config.layout,
    });
  } catch (error) {
    console.error("Config fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
