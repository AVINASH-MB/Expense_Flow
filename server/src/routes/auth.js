const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email already in use" });

    const [countRows] = await pool.query("SELECT COUNT(*) AS c FROM users");
    const role = countRows[0].c === 0 ? "admin" : "user";

    const id = uuid();
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)",
      [id, name, email, hash, role],
    );
    await pool.query(
      "INSERT INTO settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id=user_id",
      [id],
    );

    const user = { id, name, email, role };
    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    const u = rows[0];
    if (!u || u.status === "suspended") return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user: publicUser(u), token: signToken(u) });
  } catch (e) { next(e); }
});

router.post("/forgot-password", async (_req, res) => {
  // Stub — wire to your email provider (SES, Resend, etc.)
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

module.exports = router;
