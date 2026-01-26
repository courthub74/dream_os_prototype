const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefresh } = require("../Utils/jwt");
const { cookieOptions } = require("../Utils/cookies");

const router = express.Router();


// REQUIRE AUTH
const { requireAuth } = require("../middleware/auth");

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ ok: true, user: { id: req.user.sub, email: req.user.email } });
});

/**
 * POST /auth/register
 * body: { email, password, displayName? }
 */
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    displayName: name.trim()
  });

  return res.status(201).json({
    ok: true,
    user: { id: user._id, email: user.email, displayName: user.displayName }
  });
});


/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  res.cookie("refreshToken", refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.json({
    ok: true,
    accessToken,
    user: { id: user._id, email: user.email, displayName: user.displayName }
  });
});

/**
 * POST /auth/refresh
 * uses httpOnly cookie refreshToken
 */
router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  try {
    const decoded = verifyRefresh(token);
    const accessToken = signAccessToken({ sub: decoded.sub });
    return res.json({ ok: true, accessToken });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/**
 * POST /auth/logout
 */
router.post("/logout", async (req, res) => {
  res.clearCookie("refreshToken", cookieOptions());
  return res.json({ ok: true });
});

module.exports = router;
