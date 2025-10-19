import { Router } from "express";
import { supabaseService } from "../services/supabase.service";

const router = Router();

/**
 * GET /api/stats
 * Get platform statistics
 */
router.get("/", async (req, res) => {
  try {
    const stats = await supabaseService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
