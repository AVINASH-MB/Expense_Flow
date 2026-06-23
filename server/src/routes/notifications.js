const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

router.use(requireAuth);

const row = (r) => ({
  id: r.id, type: r.type, title: r.title, message: r.message,
  date: (r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at),
  read: Boolean(r.read),
});

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 200",
      [req.user.id],
    );
    res.json(rows.map(row));
  } catch (e) { next(e); }
});

router.post("/:id/read", async (req, res, next) => {
  try {
    await pool.query("UPDATE notifications SET `read`=1 WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/read-all", async (req, res, next) => {
  try {
    await pool.query("UPDATE notifications SET `read`=1 WHERE user_id=?", [req.user.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM notifications WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Admin broadcast — insert one notification per user
router.post("/broadcast", requireAdmin, async (req, res, next) => {
  try {
    const { title, message, type = "system" } = req.body || {};
    if (!title || !message) return res.status(400).json({ error: "Missing fields" });
    const [users] = await pool.query("SELECT id FROM users");
    const values = users.map((u) => [uuid(), u.id, type, title, message, null]);
    if (values.length) {
      await pool.query(
        "INSERT INTO notifications (id,user_id,type,title,message,ref_key) VALUES ?",
        [values],
      );
    }
    res.json({ ok: true, count: values.length });
  } catch (e) { next(e); }
});

module.exports = router;
