const express = require("express");

const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const allowAll = req.user.role === "ADMIN" && req.query.all === "true";
  const where = allowAll ? {} : { userId: req.user.sub };
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  const usePagination =
    Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0;

  const findOptions = {
    where,
    orderBy: { scheduledAt: "desc" },
  };

  if (usePagination) {
    findOptions.skip = (page - 1) * pageSize;
    findOptions.take = pageSize;
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany(findOptions),
    usePagination ? db.appointment.count({ where }) : Promise.resolve(null),
  ]);

  return res.json({
    appointments,
    page: usePagination ? page : 1,
    pageSize: usePagination ? pageSize : appointments.length,
    total: usePagination ? total : appointments.length,
  });
});

router.post("/", async (req, res) => {
  const { service, scheduledAt, notes } = req.body || {};

  if (!service || !scheduledAt) {
    return res
      .status(400)
      .json({ error: "Service and scheduledAt are required" });
  }

  const appointment = await db.appointment.create({
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

  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (req.user.role !== "ADMIN" && appointment.userId !== req.user.sub) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await db.appointment.update({
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
