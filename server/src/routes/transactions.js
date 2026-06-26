const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { checkBudgetAlerts } = require("../services/alerts");

router.use(requireAuth);

function row(r) {
  return {
    id: r.id, name: r.name, category: r.category, type: r.type,
    amount: Number(r.amount),
    date: (r.date instanceof Date) ? r.date.toISOString().slice(0, 10) : r.date,
    note: r.note || undefined,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC, created_at DESC",
      [req.user.id],
    );
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, category, type, amount, date, note } = req.body || {};
    if (!name || !category || !type || amount == null || !date)
      return res.status(400).json({ error: "Missing fields" });
    const id = uuid();
    await pool.query(
      "INSERT INTO transactions (id,user_id,name,category,type,amount,date,note) VALUES (?,?,?,?,?,?,?,?)",
      [id, req.user.id, name, category, type, amount, date, note || null],
    );
    if (type === "expense") await checkBudgetAlerts(req.user.id);
    const [rows] = await pool.query("SELECT * FROM transactions WHERE id=?", [id]);
    res.status(201).json(row(rows[0]));
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const fields = ["name", "category", "type", "amount", "date", "note"];
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

router.delete("/", async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM transactions WHERE user_id=?", [req.user.id]);
    res.json({ ok: true, deleted: r.affectedRows });
  } catch (e) { next(e); }
});

module.exports = router;
