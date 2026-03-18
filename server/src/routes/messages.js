const express = require("express");

const prisma = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, body } = req.body || {};

  if (!name || !email || !body) {
    return res
      .status(400)
      .json({ error: "Name, email, and message body are required" });
  }

  const message = await prisma.message.create({
    data: {
      name,
      email,
      subject: subject || null,
      body,
    },
  });

  return res.status(201).json({ message });
});

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.json({ messages });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { status: status || message.status },
  });

  return res.json({ message: updated });
});

module.exports = router;
