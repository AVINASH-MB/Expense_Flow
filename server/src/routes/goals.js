const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { checkGoalAlerts } = require("../services/alerts");

router.use(requireAuth);

const row = (r) => ({
  id: r.id, name: r.name,
  target: Number(r.target), current: Number(r.current),
  deadline: r.deadline ? (r.deadline instanceof Date ? r.deadline.toISOString().slice(0, 10) : r.deadline) : undefined,
});

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM goals WHERE user_id=?", [req.user.id]);
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, target, current = 0, deadline = null } = req.body || {};
    if (!name || target == null) return res.status(400).json({ error: "Missing fields" });
    const id = uuid();
    await pool.query(
      "INSERT INTO goals (id,user_id,name,target,current,deadline) VALUES (?,?,?,?,?,?)",
      [id, req.user.id, name, target, current, deadline],
    );
    await checkGoalAlerts(req.user.id);
    res.status(201).json({ id, name, target: Number(target), current: Number(current), deadline });
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const fields = ["name", "target", "current", "deadline"];
    const sets = []; const vals = [];
    for (const f of fields) if (f in req.body) { sets.push(`\`${f}\`=?`); vals.push(req.body[f]); }
    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id, req.user.id);
    const [r] = await pool.query(`UPDATE goals SET ${sets.join(",")} WHERE id=? AND user_id=?`, vals);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    await checkGoalAlerts(req.user.id);
    const [rows] = await pool.query("SELECT * FROM goals WHERE id=?", [req.params.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM goals WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
