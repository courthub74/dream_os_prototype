const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Artwork = require("../models/Artwork");
const { aiQueue } = require("../jobs/queue");

const router = express.Router();

// Enqueue a generation job
router.post("/generate", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const { artworkId } = req.body || {};
  if (!artworkId) return res.status(400).json({ error: "artworkId is required" });

  const artwork = await Artwork.findOne({ _id: artworkId, userId });
  if (!artwork) return res.status(404).json({ error: "Artwork not found" });

  // Optional: prevent duplicate jobs when already running
  if (artwork.aiStage && artwork.aiStage !== "Ready" && artwork.status !== "failed" && artwork.aiProgress > 0 && artwork.aiProgress < 100) {
    return res.status(409).json({ error: "Generation already in progress" });
  }

  const job = await aiQueue.add(
    "generate",
    { artworkId, userId },
    { removeOnComplete: true, removeOnFail: false }
  );

  await Artwork.updateOne(
    { _id: artworkId, userId },
    { $set: { aiJobId: job.id, aiProgress: 0, aiStage: "Queued", aiError: "", updatedAt: new Date() } }
  );

  return res.status(202).json({ ok: true, jobId: job.id });
});

module.exports = router;
