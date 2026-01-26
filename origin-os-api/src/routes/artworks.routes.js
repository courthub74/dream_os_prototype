const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Artwork = require("../models/Artwork");

const router = express.Router();

// Create draft
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.sub;

  const {
    title = "",
    description = "",
    year = "",
    output = "square",
    collection = "",
    notes = "",
    tags = []
  } = req.body || {};

  const artwork = await Artwork.create({
    userId,
    title,
    description,
    year,
    output,
    collection,
    notes,
    tags,
    status: "draft"
  });

  return res.status(201).json({ ok: true, artwork });
});

// Update draft
router.patch("/:id", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const allowed = ["title", "description", "year", "output", "collection", "notes", "tags", "status"];
  const update = {};

  for (const k of allowed) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, k)) {
      update[k] = req.body[k];
    }
  }

  update.updatedAt = new Date();

  const artwork = await Artwork.findOneAndUpdate(
    { _id: id, userId },
    { $set: update },
    { new: true }
  );

  if (!artwork) return res.status(404).json({ error: "Artwork not found" });

  return res.json({ ok: true, artwork });
});

// Get recent activity
router.get("/recent", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const limit = Math.min(parseInt(req.query.limit || "7", 10), 25);

  const items = await Artwork.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("_id title status updatedAt createdAt");

  return res.json({ ok: true, items });
});

module.exports = router;
