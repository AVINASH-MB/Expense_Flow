const jwt = require("jsonwebtoken");

function requireAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Missing token"), { status: 401 }));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(Object.assign(new Error("Invalid token"), { status: 401 }));
  }
}

module.exports = { requireAuth };
