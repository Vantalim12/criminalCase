import { Router } from "express";
import { holderService } from "../services/holder.service";

const router = Router();

/**
 * GET /api/holders
 * Get top 10 holders
 */
router.get("/", async (req, res) => {
  try {
    const holders = await holderService.getTopHolders(10);
    res.json({
      holders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching holders:", error);
    res.status(500).json({ error: "Failed to fetch holders" });
  }
});

/**
 * GET /api/holders/rank/:address
 * Get specific holder rank
 */
router.get("/rank/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const holder = await holderService.getHolderByAddress(address);

    if (!holder) {
      return res.status(404).json({ error: "Holder not found" });
    }

    res.json(holder);
  } catch (error) {
    console.error("Error fetching holder rank:", error);
    res.status(500).json({ error: "Failed to fetch holder rank" });
  }
});

export default router;
