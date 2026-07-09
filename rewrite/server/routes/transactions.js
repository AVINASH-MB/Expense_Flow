const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { checkBudgetAlerts } = require("../services/alerts");

router.use(requireAuth);

const row = (r) => ({
  id: r.id, name: r.name, category: r.category, type: r.type,
  amount: Number(r.amount),
  date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : r.date,
  note: r.note || undefined,
  receipt_id: r.receipt_id || undefined,
});

router.get("/", async (req, res, next) => {
  try {
    const { type, category, from, to, q } = req.query;
    const where = ["user_id=?"]; const vals = [req.user.id];
    if (type)     { where.push("type=?");     vals.push(type); }
    if (category) { where.push("category=?"); vals.push(category); }
    if (from)     { where.push("date>=?");    vals.push(from); }
    if (to)       { where.push("date<=?");    vals.push(to); }
    if (q)        { where.push("(name LIKE ? OR note LIKE ?)"); vals.push(`%${q}%`, `%${q}%`); }
    const [rows] = await pool.query(
      `SELECT * FROM transactions WHERE ${where.join(" AND ")} ORDER BY date DESC, created_at DESC`,
      vals,
    );
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, category, type, amount, date, note, receipt_id } = req.body || {};
    if (!name || !category || !type || amount == null || !date)
      return res.status(400).json({ error: "Missing fields" });
    const id = uuid();
    await pool.query(
      "INSERT INTO transactions (id,user_id,name,category,type,amount,date,note,receipt_id) VALUES (?,?,?,?,?,?,?,?,?)",
      [id, req.user.id, name, category, type, amount, date, note || null, receipt_id || null],
    );
    if (type === "expense") await checkBudgetAlerts(req.user.id);
    const [rows] = await pool.query("SELECT * FROM transactions WHERE id=?", [id]);
    res.status(201).json(row(rows[0]));
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const fields = ["name", "category", "type", "amount", "date", "note", "receipt_id"];
    const sets = []; const vals = [];
    for (const f of fields) if (f in req.body) { sets.push(`\`${f}\`=?`); vals.push(req.body[f]); }
    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id, req.user.id);
    const [r] = await pool.query(
      `UPDATE transactions SET ${sets.join(",")} WHERE id=? AND user_id=?`, vals,
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    await checkBudgetAlerts(req.user.id);
    const [rows] = await pool.query("SELECT * FROM transactions WHERE id=?", [req.params.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [r] = await pool.query(
      "DELETE FROM transactions WHERE id=? AND user_id=?",
      [req.params.id, req.user.id],
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
