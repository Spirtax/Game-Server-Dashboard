import { Router } from "express";
import { ServerActionsService } from "@/services/ServerService/ServerActions";

const router = Router();

const ALLOWED_ACTIONS = ["start", "stop", "restart", "delete", "create"];

router.post("/create", async (req, res) => {
  try {
    const { name, ram, gameType, gameRequirements } = req.body;

    if (!name || !ram || !gameType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, ram, or gameType.",
      });
    }

    const result = await ServerActionsService.createServer(
      name,
      ram,
      gameType,
      gameRequirements || {},
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to create server",
      });
    }

    // Success response
    return res.status(201).json({
      success: true,
      message: result.message || "Server created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Route Error [/create]:", error.message);
    return res.status(500).json({
      success: false,
      error:
        error.message || "An internal error occurred during server creation.",
    });
  }
});

router.post("/:name/:action", async (req, res) => {
  const { name, action } = req.params;

  if (!ALLOWED_ACTIONS.includes(action)) {
    return res.status(400).json({ success: false, error: "Invalid action" });
  }

  try {
    const result = await ServerActionsService.manageContainer(name, action);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json({
      success: true,
      server: name,
      action,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
