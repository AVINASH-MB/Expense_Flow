const { pool } = require("../db");
const { v4: uuid } = require("uuid");

/**
 * Recompute current-month spend per category and insert a budget-exceeded
 * notification when over limit. Unique (user_id,type,ref_key) prevents dupes.
 */
async function checkBudgetAlerts(userId) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const start = new Date(y, m, 1).toISOString().slice(0, 10);
  const end   = new Date(y, m + 1, 1).toISOString().slice(0, 10);

  const [spendRows] = await pool.query(
    `SELECT category, SUM(amount) AS spent FROM transactions
      WHERE user_id=? AND type='expense' AND date>=? AND date<?
      GROUP BY category`,
    [userId, start, end],
  );
  const spend = new Map(spendRows.map((r) => [r.category, Number(r.spent)]));

  const [budgets] = await pool.query(`SELECT * FROM budgets WHERE user_id=?`, [userId]);
  for (const b of budgets) {
    const s = spend.get(b.category) || 0;
    if (s > Number(b.limit)) {
      const ref = `budget:${b.id}:${y}-${m}`;
      try {
        await pool.query(
          `INSERT INTO notifications (id,user_id,type,title,message,ref_key)
           VALUES (?,?,?,?,?,?)`,
          [
            uuid(), userId, "budget",
            `Budget exceeded: ${b.category}`,
            `You've spent $${s.toFixed(0)} of your $${Number(b.limit)} ${b.category} budget this month.`,
            ref,
          ],
        );
      } catch (e) { if (e.code !== "ER_DUP_ENTRY") throw e; }
    }
  }
}

async function checkGoalAlerts(userId) {
  const [goals] = await pool.query(`SELECT * FROM goals WHERE user_id=?`, [userId]);
  for (const g of goals) {
    if (Number(g.current) >= Number(g.target)) {
      const ref = `goal:${g.id}`;
      try {
        await pool.query(
          `INSERT INTO notifications (id,user_id,type,title,message,ref_key)
           VALUES (?,?,?,?,?,?)`,
          [
            uuid(), userId, "goal",
            `Goal achieved: ${g.name} 🎉`,
            `You've reached your $${Number(g.target)} target for ${g.name}.`,
            ref,
          ],
        );
      } catch (e) { if (e.code !== "ER_DUP_ENTRY") throw e; }
    }
  }
}

module.exports = { checkBudgetAlerts, checkGoalAlerts };
