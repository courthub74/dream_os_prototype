// SERVER JS

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./db");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`✅ API running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

// Status Routes
const statsRoutes = require("./routes/stats.routes");
app.use("/stats", statsRoutes);

// Artwork Routes
const artworksRoutes = require("./routes/artworks.routes");
app.use("/artworks", artworksRoutes);
