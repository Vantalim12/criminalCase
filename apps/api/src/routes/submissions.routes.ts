import { Router } from "express";
import { supabaseService } from "../services/supabase.service";
import { holderService } from "../services/holder.service";
import { verifyWallet, AuthRequest } from "../middleware/auth.middleware";
import { MAX_PHOTO_SIZE_MB } from "@discover/config";

const router = Router();

/**
 * GET /api/submissions/approved
 * Get gallery of approved finds
 */
router.get("/approved", async (req, res) => {
  try {
    const submissions = await supabaseService.getApprovedSubmissions(50);
    res.json({ submissions });
  } catch (error) {
    console.error("Error fetching approved submissions:", error);
    res.status(500).json({ error: "Failed to fetch approved submissions" });
  }
});

/**
 * POST /api/submissions
 * Submit a photo (authenticated, highest holder only, during submission window)
 */
router.post("/", verifyWallet, async (req: AuthRequest, res) => {
  try {
    const { photoBase64, roundId } = req.body;
    const walletAddress = req.walletAddress!;

    // Validate inputs
    if (!photoBase64 || !roundId) {
      return res.status(400).json({ error: "Missing photoBase64 or roundId" });
    }

    // Check if base64 data is valid
    if (!photoBase64.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid photo format" });
    }

    // Get current round
    const currentRound = await supabaseService.getCurrentRound();
    if (!currentRound || currentRound.id !== roundId) {
      return res.status(400).json({ error: "Invalid round" });
    }

    // Check if in submission window
    if (currentRound.status !== "submission_window") {
      return res.status(400).json({ error: "Not in submission window" });
    }

    // Check if user is the highest holder
    const highestHolder = await holderService.getHighestHolder();
    if (!highestHolder || highestHolder.wallet_address !== walletAddress) {
      return res
        .status(403)
        .json({ error: "Only the highest holder can submit" });
    }

    // Check if already submitted for this round
    const existingSubmission =
      await supabaseService.getSubmissionByRoundAndWallet(
        roundId,
        walletAddress
      );
    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "Already submitted for this round" });
    }

    // Validate file size
    const sizeInMB = (photoBase64.length * 3) / 4 / (1024 * 1024);
    if (sizeInMB > MAX_PHOTO_SIZE_MB) {
      return res
        .status(400)
        .json({ error: `Photo too large (max ${MAX_PHOTO_SIZE_MB}MB)` });
    }

    // Convert base64 to buffer
    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Supabase Storage
    const filename = `${roundId}_${walletAddress}_${Date.now()}.jpg`;
    const photoUrl = await supabaseService.uploadPhoto(buffer, filename);

    // Create submission record
    const submission = await supabaseService.createSubmission(
      roundId,
      walletAddress,
      photoUrl
    );

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Error submitting photo:", error);
    res.status(500).json({ error: "Failed to submit photo" });
  }
});

export default router;
