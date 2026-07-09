const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");
const User = require("../models/User");
const { pool } = require("../config/db");
const { signAccess, signRefresh, verifyRefresh } = require("../utils/jwt");
const { sendMail } = require("../services/email");

const REFRESH_COOKIE = "ef_refresh";
const cookieOpts = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

async function storeRefresh(userId, token) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await pool.query(
    "INSERT INTO refresh_tokens (id,user_id,token_hash,expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 30 DAY))",
    [uuid(), userId, hash],
  );
}

const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role, avatar_url: u.avatar_url || null,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    if (await User.byEmail(email)) return res.status(409).json({ error: "Email in use" });
    const id = uuid();
    const password_hash = await bcrypt.hash(password, 10);
    const role = email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase() ? "admin" : "user";
    await User.create({ id, name, email, password_hash, role });
    await pool.query("INSERT INTO settings (user_id) VALUES (?)", [id]);
    const user = await User.byId(id);
    const token = signAccess(user);
    const refresh = signRefresh(user);
    await storeRefresh(id, refresh);
    res.cookie(REFRESH_COOKIE, refresh, cookieOpts());
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.byEmail(email || "");
    if (!user || user.status !== "active") return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password || "", user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signAccess(user);
    const refresh = signRefresh(user);
    await storeRefresh(user.id, refresh);
    res.cookie(REFRESH_COOKIE, refresh, cookieOpts());
    res.json({ token, user: publicUser(user) });
  } catch (e) { next(e); }
};

exports.refresh = async (req, res, next) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) return res.status(401).json({ error: "No refresh token" });
    const payload = verifyRefresh(raw);
    const user = await User.byId(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid refresh" });
    const token = signAccess(user);
    res.json({ token, user: publicUser(user) });
  } catch {
    res.status(401).json({ error: "Invalid refresh" });
  }
};

exports.logout = async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) {
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash=?", [hash]);
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ ok: true });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const user = await User.byEmail(email || "");
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      await User.update(user.id, {
        reset_token: token,
        reset_expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      const link = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset link: ${link}`,
        html: `<p>Click to reset your password:</p><p><a href="${link}">${link}</a></p>`,
      }).catch(() => {});
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Missing fields" });
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE reset_token=? AND reset_expires > NOW()",
      [token],
    );
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });
    const password_hash = await bcrypt.hash(password, 10);
    await User.update(user.id, { password_hash, reset_token: null, reset_expires: null });
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.byId(req.user.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(publicUser(user));
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar_url, password } = req.body || {};
    const patch = {};
    if (name) patch.name = name;
    if (email) patch.email = email;
    if (avatar_url !== undefined) patch.avatar_url = avatar_url;
    if (password) patch.password_hash = await bcrypt.hash(password, 10);
    await User.update(req.user.id, patch);
    const user = await User.byId(req.user.id);
    res.json(publicUser(user));
  } catch (e) { next(e); }
};
