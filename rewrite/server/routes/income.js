// Income-only convenience: same table, filtered to type='income'.
const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE user_id=? AND type='income' ORDER BY date DESC",
      [req.user.id],
    );
    res.json(rows.map((r) => ({
      id: r.id, name: r.name, category: r.category, amount: Number(r.amount),
      date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
      note: r.note || undefined,
    })));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, category, amount, date, note } = req.body || {};
    if (!name || !category || amount == null || !date)
      return res.status(400).json({ error: "Missing fields" });
    const id = uuid();
    await pool.query(
      "INSERT INTO transactions (id,user_id,name,category,type,amount,date,note) VALUES (?,?,?,?,'income',?,?,?)",
      [id, req.user.id, name, category, amount, date, note || null],
    );
    res.status(201).json({ id, name, category, amount: Number(amount), date, note });
  } catch (e) { next(e); }
});

module.exports = router;
