import { Router } from "express";
import { supabaseService } from "../services/supabase.service";
import { gameService } from "../services/game.service";
import { verifyWallet } from "../middleware/auth.middleware";
import { verifyAdmin } from "../middleware/admin.middleware";

const router = Router();

// All admin routes require wallet authentication + admin verification
router.use(verifyWallet);
router.use(verifyAdmin);

/**
 * GET /api/admin/submissions/pending
 * Get all pending submissions
 */
router.get("/submissions/pending", async (req, res) => {
  try {
    const submissions = await supabaseService.getPendingSubmissions();
    res.json({ submissions });
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    res.status(500).json({ error: "Failed to fetch pending submissions" });
  }
});

/**
 * PATCH /api/admin/submissions/:id
 * Approve or reject a submission
 */
router.patch("/submissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await supabaseService.updateSubmissionStatus(id, status, reviewerNotes);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ error: "Failed to update submission" });
  }
});

/**
 * POST /api/admin/rounds/start
 * Manually start a new round
 */
router.post("/rounds/start", async (req, res) => {
  try {
    const { targetItem } = req.body;
    const newRound = await gameService.manuallyStartRound(targetItem);
    res.json({ success: true, round: newRound });
  } catch (error) {
    console.error("Error starting new round:", error);
    res.status(500).json({ error: "Failed to start new round" });
  }
});

/**
 * PATCH /api/admin/config
 * Update configuration
 */
router.patch("/config", async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }

    // Validate allowed config keys
    const allowedKeys = ["token_address", "fee_pool_total"];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ error: "Invalid config key" });
    }

    await supabaseService.setConfig(key, value);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update config" });
  }
});

export default router;
