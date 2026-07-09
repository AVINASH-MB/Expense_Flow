const router = require("express").Router();
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
const ALLOWED_CURRENCIES = new Set(["USD","INR","EUR","GBP","AED","SGD","JPY","CAD","AUD"]);

const row = (r) => ({
  emailBudgetAlerts:   Boolean(r.email_budget_alerts),
  emailGoalAlerts:     Boolean(r.email_goal_alerts),
  emailWeeklyDigest:   Boolean(r.email_weekly_digest),
  emailProductUpdates: Boolean(r.email_product_updates),
  currency:            r.currency || "USD",
  theme:               r.theme || "system",
});

const defaults = {
  emailBudgetAlerts: true, emailGoalAlerts: true,
  emailWeeklyDigest: false, emailProductUpdates: false,
  currency: "USD", theme: "system",
};

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM settings WHERE user_id=?", [req.user.id]);
    if (!rows[0]) {
      await pool.query("INSERT INTO settings (user_id) VALUES (?)", [req.user.id]);
      return res.json(defaults);
    }
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

router.put("/", async (req, res, next) => {
  try {
    const map = {
      emailBudgetAlerts: "email_budget_alerts",
      emailGoalAlerts: "email_goal_alerts",
      emailWeeklyDigest: "email_weekly_digest",
      emailProductUpdates: "email_product_updates",
    };
    await pool.query(
      "INSERT INTO settings (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id=user_id",
      [req.user.id],
    );
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (k in req.body) { sets.push(`${col}=?`); vals.push(req.body[k] ? 1 : 0); }
    }
    if ("currency" in req.body) {
      const c = String(req.body.currency || "").toUpperCase();
      if (!ALLOWED_CURRENCIES.has(c)) return res.status(400).json({ error: "Unsupported currency" });
      sets.push("currency=?"); vals.push(c);
    }
    if ("theme" in req.body) {
      const t = String(req.body.theme);
      if (!["light","dark","system"].includes(t)) return res.status(400).json({ error: "Invalid theme" });
      sets.push("theme=?"); vals.push(t);
    }
    if (sets.length) {
      vals.push(req.user.id);
      await pool.query(`UPDATE settings SET ${sets.join(",")} WHERE user_id=?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM settings WHERE user_id=?", [req.user.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

// Delete account
router.delete("/account", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM users WHERE id=?", [req.user.id]);
    res.clearCookie("ef_refresh", { path: "/api/auth" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
