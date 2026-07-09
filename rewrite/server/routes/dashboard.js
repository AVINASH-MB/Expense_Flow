const router = require("express").Router();
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [[totals]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type='income'  THEN amount END),0) AS income,
         COALESCE(SUM(CASE WHEN type='expense' THEN amount END),0) AS expense
       FROM transactions WHERE user_id=?`, [uid],
    );
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS month,
              SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
         FROM transactions WHERE user_id=?
         GROUP BY month ORDER BY month DESC LIMIT 12`, [uid],
    );
    const [recent] = await pool.query(
      "SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC, created_at DESC LIMIT 5",
      [uid],
    );
    res.json({
      totals: {
        income: Number(totals.income),
        expense: Number(totals.expense),
        balance: Number(totals.income) - Number(totals.expense),
      },
      monthly: monthly.reverse().map((r) => ({
        month: r.month, income: Number(r.income), expense: Number(r.expense),
      })),
      recent: recent.map((r) => ({
        id: r.id, name: r.name, category: r.category, type: r.type,
        amount: Number(r.amount),
        date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
      })),
    });
  } catch (e) { next(e); }
});

module.exports = router;
