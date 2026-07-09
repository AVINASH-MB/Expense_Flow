const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

const row = (r) => ({ id: r.id, name: r.name, type: r.type, color: r.color, icon: r.icon });

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE user_id=? ORDER BY type, name", [req.user.id],
    );
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, type = "expense", color = null, icon = null } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing name" });
    const id = uuid();
    await pool.query(
      "INSERT INTO categories (id,user_id,name,type,color,icon) VALUES (?,?,?,?,?,?)",
      [id, req.user.id, name, type, color, icon],
    );
    res.status(201).json({ id, name, type, color, icon });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Category exists" });
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const fields = ["name", "type", "color", "icon"];
    const sets = []; const vals = [];
    for (const f of fields) if (f in req.body) { sets.push(`${f}=?`); vals.push(req.body[f]); }
    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id, req.user.id);
    const [r] = await pool.query(
      `UPDATE categories SET ${sets.join(",")} WHERE id=? AND user_id=?`, vals,
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query("SELECT * FROM categories WHERE id=?", [req.params.id]);
    res.json(row(rows[0]));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [r] = await pool.query(
      "DELETE FROM categories WHERE id=? AND user_id=?", [req.params.id, req.user.id],
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
