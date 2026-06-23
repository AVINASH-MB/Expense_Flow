const router = require("express").Router();
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.status,
             u.created_at AS joined,
             COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.user_id=u.id AND t.type='expense'), 0) AS spend
        FROM users u
       ORDER BY u.created_at DESC
    `);
    res.json(rows.map((r) => ({
      id: r.id, name: r.name, email: r.email, role: r.role, status: r.status,
      joined: (r.joined instanceof Date ? r.joined.toISOString().slice(0, 10) : r.joined),
      spend: Number(r.spend),
    })));
  } catch (e) { next(e); }
});

router.put("/users/:id", async (req, res, next) => {
  try {
    const fields = { role: "role", status: "status", name: "name", email: "email" };
    const sets = []; const vals = [];
    for (const [k, col] of Object.entries(fields)) {
      if (k in req.body) { sets.push(`${col}=?`); vals.push(req.body[k]); }
    }
    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    vals.push(req.params.id);
    await pool.query(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
