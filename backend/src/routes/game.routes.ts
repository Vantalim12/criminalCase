import { Router } from "express";
import { gameService } from "../services/game.service";

const router = Router();

/**
 * GET /api/game/current
 * Get current round info with time remaining
 */
router.get("/current", async (req, res) => {
  try {
    const roundInfo = await gameService.getCurrentRoundWithPhase();
    res.json(roundInfo);
  } catch (error) {
    console.error("Error fetching current round:", error);
    res.status(500).json({ error: "Failed to fetch current round" });
  }
});

export default router;
