const router = require("express").Router();
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/by-category", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT category, type, SUM(amount) AS total
         FROM transactions WHERE user_id=?
         GROUP BY category, type ORDER BY total DESC`, [req.user.id],
    );
    res.json(rows.map((r) => ({ category: r.category, type: r.type, total: Number(r.total) })));
  } catch (e) { next(e); }
});

router.get("/trend", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS month,
              SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
         FROM transactions WHERE user_id=?
         GROUP BY month ORDER BY month`, [req.user.id],
    );
    res.json(rows.map((r) => ({
      month: r.month, income: Number(r.income), expense: Number(r.expense),
    })));
  } catch (e) { next(e); }
});

module.exports = router;
