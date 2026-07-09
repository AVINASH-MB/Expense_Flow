const router = require("express").Router();
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res, next) => {
  try {
    const rows = await User.all();
    res.json(rows.map((r) => ({
      id: r.id, name: r.name, email: r.email, role: r.role, status: r.status,
      joined: r.joined instanceof Date ? r.joined.toISOString().slice(0, 10) : r.joined,
      spend: Number(r.spend),
    })));
  } catch (e) { next(e); }
});

router.put("/users/:id", async (req, res, next) => {
  try {
    const patch = {};
    for (const k of ["name", "email", "role", "status"]) if (k in req.body) patch[k] = req.body[k];
    await User.update(req.params.id, patch);
    const u = await User.byId(req.params.id);
    res.json(u);
  } catch (e) { next(e); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });
    await User.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
