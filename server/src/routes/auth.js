const express = require("express");

const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRecord = await db._admin.auth().createUser({
      email,
      password,
      displayName: name || undefined,
    });

    await db._admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "USER",
    });

    const profile = await db.user.upsert({
      where: { id: userRecord.uid },
      update: {
        email,
        name: name || null,
        role: "USER",
      },
      create: {
        id: userRecord.uid,
        email,
        name: name || null,
        role: "USER",
      },
    });

    const customToken = await db._admin
      .auth()
      .createCustomToken(userRecord.uid, { role: "USER" });

    return res.status(201).json({
      user: sanitizeUser(profile),
      customToken,
      tokenType: "firebaseCustomToken",
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { idToken } = req.body || {};

  if (!idToken) {
    return res.status(400).json({
      error:
        "idToken is required. Sign in with Firebase client SDK and send the ID token.",
    });
  }

  try {
    const decoded = await db._admin.auth().verifyIdToken(idToken);
    const profile = await db.user.findUnique({ where: { id: decoded.uid } });

    return res.json({
      user: profile ? sanitizeUser(profile) : null,
      token: idToken,
      tokenType: "firebaseIdToken",
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ user: sanitizeUser(user) });
});

module.exports = router;
