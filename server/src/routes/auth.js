const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const REFRESH_COOKIE = "ef_refresh";
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const COOKIE_SECURE = String(process.env.COOKIE_SECURE || "false") === "true";

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL },
  );
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function refreshCookieOpts(maxAgeMs) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: maxAgeMs,
  };
}

async function issueRefreshToken(userId, familyId, parentId, req) {
  const token = crypto.randomBytes(32).toString("hex"); // 64 chars
  const id = uuid();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 86400 * 1000);
  await pool.query(
    "INSERT INTO refresh_tokens (id,user_id,token_hash,family_id,parent_id,expires_at,user_agent,ip) VALUES (?,?,?,?,?,?,?,?)",
    [
      id, userId, sha256(token), familyId, parentId || null, expiresAt,
      (req.headers["user-agent"] || "").slice(0, 250),
      (req.ip || "").slice(0, 60),
    ],
  );
  return { token, id, expiresAt };
}

async function setRefreshCookie(res, userId, familyId, parentId, req) {
  const { token, expiresAt } = await issueRefreshToken(userId, familyId, parentId, req);
  res.cookie(REFRESH_COOKIE, token, refreshCookieOpts(expiresAt.getTime() - Date.now()));
}

async function revokeFamily(familyId) {
  await pool.query(
    "UPDATE refresh_tokens SET revoked_at=NOW() WHERE family_id=? AND revoked_at IS NULL",
    [familyId],
  );
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
    await setRefreshCookie(res, id, uuid(), null, req);
    res.json({ user: publicUser(user), token: signAccess(user) });
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
    await setRefreshCookie(res, u.id, uuid(), null, req);
    res.json({ user: publicUser(u), token: signAccess(u) });
  } catch (e) { next(e); }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (!presented) return res.status(401).json({ error: "No refresh token" });

    const [rows] = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token_hash=?",
      [sha256(presented)],
    );
    const row = rows[0];
    if (!row) {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Refresh token expired" });
    }
    if (row.revoked_at) {
      // Reuse detected — burn the whole family
      await revokeFamily(row.family_id);
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "Refresh token reuse detected" });
    }

    // Rotate
    await pool.query("UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=?", [row.id]);
    const [userRows] = await pool.query("SELECT * FROM users WHERE id=?", [row.user_id]);
    const u = userRows[0];
    if (!u || u.status === "suspended") {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      return res.status(401).json({ error: "User unavailable" });
    }
    await setRefreshCookie(res, u.id, row.family_id, row.id, req);
    res.json({ user: publicUser(u), token: signAccess(u) });
  } catch (e) { next(e); }
});

router.post("/logout", async (req, res, next) => {
  try {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (presented) {
      const [rows] = await pool.query(
        "SELECT family_id FROM refresh_tokens WHERE token_hash=?",
        [sha256(presented)],
      );
      if (rows[0]) await revokeFamily(rows[0].family_id);
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/forgot-password", async (_req, res) => {
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

router.delete("/account", requireAuth, async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    const u = rows[0];
    if (!u) return res.status(404).json({ error: "Account not found" });
    if (!password) return res.status(400).json({ error: "Password required" });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Incorrect password" });

    // Cascades remove transactions, budgets, goals, notifications, settings, refresh_tokens
    await pool.query("DELETE FROM users WHERE id=?", [req.user.id]);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
