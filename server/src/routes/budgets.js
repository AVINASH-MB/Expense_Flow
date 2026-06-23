const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { checkBudgetAlerts } = require("../services/alerts");

router.use(requireAuth);

const row = (r) => ({ id: r.id, category: r.category, limit: Number(r.limit), period: r.period });

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM budgets WHERE user_id=?", [req.user.id]);
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { category, limit, period = "monthly" } = req.body || {};
    if (!category || limit == null) return res.status(400).json({ error: "Missing fields" });
    const id = uuid();
    await pool.query(
      "INSERT INTO budgets (id,user_id,category,`limit`,period) VALUES (?,?,?,?,?)",
      [id, req.user.id, category, limit, period],
    );
    await checkBudgetAlerts(req.user.id);
    res.status(201).json({ id, category, limit: Number(limit), period });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Budget for this category exists" });
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const fields = ["category", "limit", "period"];
    const sets = []; const vals = [];
    for (const f of fields) if (f in req.body) { sets.push(`\`${f}\`=?`); vals.push(req.body[f]); }
    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id, req.user.id);
    const [r] = await pool.query(`UPDATE budgets SET ${sets.join(",")} WHERE id=? AND user_id=?`, vals);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    await checkBudgetAlerts(req.user.id);
    const [rows] = await pool.query("SELECT * FROM budgets WHERE id=?", [req.params.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM budgets WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
