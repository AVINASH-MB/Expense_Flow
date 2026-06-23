const router = require("express").Router();
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

const row = (r) => ({
  emailBudgetAlerts:   Boolean(r.email_budget_alerts),
  emailGoalAlerts:     Boolean(r.email_goal_alerts),
  emailWeeklyDigest:   Boolean(r.email_weekly_digest),
  emailProductUpdates: Boolean(r.email_product_updates),
});

const defaults = { emailBudgetAlerts: true, emailGoalAlerts: true, emailWeeklyDigest: false, emailProductUpdates: false };

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
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (k in req.body) { sets.push(`${col}=?`); vals.push(req.body[k] ? 1 : 0); }
    }
    if (sets.length) {
      vals.push(req.user.id);
      await pool.query(
        `INSERT INTO settings (user_id, ${Object.values(map).join(",")}) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ${sets.join(",")}`,
        [req.user.id,
          req.body.emailBudgetAlerts ? 1 : 0,
          req.body.emailGoalAlerts ? 1 : 0,
          req.body.emailWeeklyDigest ? 1 : 0,
          req.body.emailProductUpdates ? 1 : 0,
          ...vals.slice(0, -1),
        ],
      );
    }
    const [rows] = await pool.query("SELECT * FROM settings WHERE user_id=?", [req.user.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

module.exports = router;
