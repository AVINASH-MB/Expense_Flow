function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(Object.assign(new Error("Admin only"), { status: 403 }));
  }
  next();
}
module.exports = { requireAdmin };
