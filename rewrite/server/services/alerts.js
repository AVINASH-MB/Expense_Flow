const { v4: uuid } = require("uuid");
const { pool } = require("../config/db");
const { sendMail } = require("./email");

async function notify(userId, type, title, message, refKey = null) {
  if (refKey) {
    const [dup] = await pool.query(
      "SELECT id FROM notifications WHERE user_id=? AND ref_key=? LIMIT 1",
      [userId, refKey],
    );
    if (dup[0]) return;
  }
  await pool.query(
    "INSERT INTO notifications (id,user_id,type,title,message,ref_key) VALUES (?,?,?,?,?,?)",
    [uuid(), userId, type, title, message, refKey],
  );
}

async function checkBudgetAlerts(userId) {
  const [budgets] = await pool.query("SELECT * FROM budgets WHERE user_id=?", [userId]);
  const [settings] = await pool.query("SELECT * FROM settings WHERE user_id=?", [userId]);
  const emailEnabled = settings[0]?.email_budget_alerts !== 0;
  const [user] = await pool.query("SELECT email,name FROM users WHERE id=?", [userId]);

  for (const b of budgets) {
    const [[{ spent }]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS spent FROM transactions
        WHERE user_id=? AND type='expense' AND category=?
          AND date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`,
      [userId, b.category],
    );
    const pct = Number(spent) / Number(b.limit);
    if (pct >= 0.9) {
      const refKey = `budget:${b.id}:${new Date().toISOString().slice(0, 7)}`;
      const msg = `You've used ${(pct * 100).toFixed(0)}% of your ${b.category} budget.`;
      await notify(userId, "budget", "Budget alert", msg, refKey);
      if (emailEnabled && user[0]?.email) {
        await sendMail({
          to: user[0].email,
          subject: `Budget alert: ${b.category}`,
          text: msg,
          html: `<p>Hi ${user[0].name},</p><p>${msg}</p>`,
        }).catch(() => {});
      }
    }
  }
}

async function checkGoalAlerts(userId) {
  const [goals] = await pool.query("SELECT * FROM goals WHERE user_id=?", [userId]);
  for (const g of goals) {
    if (Number(g.current) >= Number(g.target)) {
      await notify(userId, "goal", "Goal reached", `You reached "${g.name}"!`, `goal:${g.id}:done`);
    }
  }
}

module.exports = { notify, checkBudgetAlerts, checkGoalAlerts };
