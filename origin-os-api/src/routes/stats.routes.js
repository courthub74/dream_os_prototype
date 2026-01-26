const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Artwork = require("../models/Artwork");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.sub;

  const works = await Artwork.countDocuments({ userId });

  // placeholders for now (until you build these models)
  const collections = 0;
  const drops = 0;

  return res.json({ ok: true, stats: { works, collections, drops } });
});

module.exports = router;
