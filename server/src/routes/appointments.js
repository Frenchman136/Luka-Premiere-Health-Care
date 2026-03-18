const express = require("express");

const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const allowAll = req.user.role === "ADMIN" && req.query.all === "true";
  const where = allowAll ? {} : { userId: req.user.sub };

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: "desc" },
  });

  return res.json({ appointments });
});

router.post("/", async (req, res) => {
  const { service, scheduledAt, notes } = req.body || {};

  if (!service || !scheduledAt) {
    return res
      .status(400)
      .json({ error: "Service and scheduledAt are required" });
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: req.user.sub,
      service,
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
    },
  });

  return res.status(201).json({ appointment });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { service, scheduledAt, status, notes } = req.body || {};

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (req.user.role !== "ADMIN" && appointment.userId !== req.user.sub) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      service: service || appointment.service,
      scheduledAt: scheduledAt
        ? new Date(scheduledAt)
        : appointment.scheduledAt,
      status: status || appointment.status,
      notes: notes ?? appointment.notes,
    },
  });

  return res.json({ appointment: updated });
});

module.exports = router;
