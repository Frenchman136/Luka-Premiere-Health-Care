const db = require("../db");

async function ensureUserProfile(decoded) {
  const existing = await db.user.findUnique({ where: { id: decoded.uid } });
  if (existing) {
    return existing;
  }

  const created = await db.user.create({
    data: {
      id: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || decoded.displayName || null,
      role: decoded.role || "USER",
    },
  });

  return created;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const decoded = await db._admin.auth().verifyIdToken(token);
    const profile = await ensureUserProfile(decoded);
    const role = decoded.role || profile.role || "USER";

    req.user = {
      ...decoded,
      sub: decoded.uid,
      uid: decoded.uid,
      email: decoded.email || profile.email || null,
      name: decoded.name || decoded.displayName || profile.name || null,
      role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

const requireAdmin = requireRole("ADMIN");

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
};
