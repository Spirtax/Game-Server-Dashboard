import { Router } from "express";
import { ServerStateManagerService } from "@/services/ServerService/ServerStateManager";

const router = Router();

router.get("/:name", async (req, res) => {
  try {
    const state = await ServerStateManagerService.getServerState(
      req.params.name,
    );
    if (!state) return res.status(404).json({ error: "Server not found" });
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:name/control", async (req, res) => {
  const { name } = req.params;
  const { action } = req.body;

  try {
    await ServerStateManagerService.setPendingState(name, action);

    res.json({ success: true, message: `Action ${action} initiated.` });

    ServerStateManagerService.performAction(name, action).catch((err) => {
      console.error("Background Docker action failed:", err);
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
