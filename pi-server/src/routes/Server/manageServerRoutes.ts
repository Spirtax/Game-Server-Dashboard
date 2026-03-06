import { Router } from "express";
import { ServerActionsService } from "@/services/ServerService/ServerActions";

const router = Router();

router.post("/manage/create", async (req, res) => {
  try {
    const { name, ram, gameType, gameRequirements } = req.body;

    if (!name || !ram || !gameType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, ram, or gameType.",
      });
    }

    ServerActionsService.createServer(
      name,
      ram,
      gameType,
      gameRequirements || {},
    ).catch((error) => {
      console.error(`[Background Task Error] ${name}:`, error.message);
    });

    return res.status(202).json({
      success: true,
      message: "Server creation started in the background.",
      jobId: `create-${name}`,
    });
  } catch (error: any) {
    console.error("Route Error [/create]:", error.message);
    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "An internal error occurred while initializing server creation.",
    });
  }
});

router.post("/manage/delete", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: name.",
      });
    }

    ServerActionsService.deleteServer(name).catch((error) => {
      console.error(`Error while deleting ${name}:`, error.message);
    });

    return res.status(202).json({
      success: true,
      message: "Server deletion process started.",
      jobId: `delete-${name}`,
    });
  } catch (error: any) {
    console.error("Route Error [/delete]:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal error during deletion initialization.",
    });
  }
});

export default router;
