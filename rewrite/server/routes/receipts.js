const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { pool } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

router.use(requireAuth);

const publicRow = (req, r) => ({
  id: r.id,
  filename: r.filename,
  original: r.original,
  mime: r.mime,
  size_bytes: r.size_bytes,
  url: `${req.protocol}://${req.get("host")}/uploads/${r.filename}`,
  uploaded_at: r.uploaded_at instanceof Date ? r.uploaded_at.toISOString() : r.uploaded_at,
});

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM receipts WHERE user_id=? ORDER BY uploaded_at DESC",
      [req.user.id],
    );
    res.json(rows.map((r) => publicRow(req, r)));
  } catch (e) { next(e); }
});

router.post("/", upload.single("receipt"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const id = uuid();
    await pool.query(
      "INSERT INTO receipts (id,user_id,filename,original,mime,size_bytes) VALUES (?,?,?,?,?,?)",
      [id, req.user.id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size],
    );
    const [rows] = await pool.query("SELECT * FROM receipts WHERE id=?", [id]);
    res.status(201).json(publicRow(req, rows[0]));
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM receipts WHERE id=? AND user_id=?", [req.params.id, req.user.id],
    );
    const rec = rows[0];
    if (!rec) return res.status(404).json({ error: "Not found" });
    const fp = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads", rec.filename);
    fs.promises.unlink(fp).catch(() => {});
    await pool.query("DELETE FROM receipts WHERE id=?", [rec.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
