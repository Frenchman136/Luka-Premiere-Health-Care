const express = require("express");

const db = require("../db");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { logAdminAction, createNotification, parseDate, matchesSearch } = require("../utils/admin");

const router = express.Router();

const parseTimeSlot = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : null;
};

const buildScheduledAt = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const time = parseTimeSlot(timeValue);
  if (!time) return null;
  const scheduledAt = new Date(`${dateValue}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) return null;
  return scheduledAt;
};

router.post("/", optionalAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    phone,
    email,
    visit,
    department,
    doctor,
    appointmentDate,
    appointmentTime,
    service,
    scheduledAt,
    notes,
  } = req.body || {};

  const resolvedService = service || department;
  const resolvedScheduledAt = scheduledAt
    ? new Date(scheduledAt)
    : buildScheduledAt(appointmentDate, appointmentTime);

  if (!resolvedService || !resolvedScheduledAt) {
    return res
      .status(400)
      .json({ error: "Service and appointment time are required" });
  }

  if (Number.isNaN(resolvedScheduledAt.getTime())) {
    return res.status(400).json({ error: "Invalid appointment time" });
  }

  try {
    const appointment = await db.appointment.create({
      data: {
        userId: req.user?.sub || null,
        // userId:"AoYqDU4CB8ZIcd6ee2F8XcHx5EB2",
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        dob: dob || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        visit: visit || null,
        department: department || null,
        doctor: doctor || null,
        appointmentDate: appointmentDate || null,
        appointmentTime: appointmentTime || null,
        service: resolvedService,
        scheduledAt: resolvedScheduledAt,
        notes: notes || null,
      },
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Server error" });
  }
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const allowAll = req.user.role === "ADMIN" && req.query.all === "true";
  const where = [];
  if (!allowAll) {
    where.push({ field: "userId", op: "==", value: req.user.sub });
  }
  const status = req.query.status || null;
  const department = req.query.department || null;
  const doctor = req.query.doctor || null;
  const visit = req.query.visit || null;
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to, { endOfDay: true });
  const search = String(req.query.search || "").trim().toLowerCase();

  if (status) where.push({ field: "status", op: "==", value: status });
  if (department) where.push({ field: "department", op: "==", value: department });
  if (doctor) where.push({ field: "doctor", op: "==", value: doctor });
  if (visit) where.push({ field: "visit", op: "==", value: visit });
  if (from) where.push({ field: "scheduledAt", op: ">=", value: from });
  if (to) where.push({ field: "scheduledAt", op: "<=", value: to });
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  const usePagination =
    Number.isInteger(page) &&
    page > 0 &&
    Number.isInteger(pageSize) &&
    pageSize > 0;

  const findOptions = {
    where: where.length ? where : undefined,
    orderBy: { scheduledAt: "desc" },
  };

  if (search) {
    const appointments = await db.appointment.findMany(findOptions);
    const filtered = appointments.filter((appointment) => {
      const term = search;
      return (
        matchesSearch(appointment.firstName, term) ||
        matchesSearch(appointment.lastName, term) ||
        matchesSearch(appointment.email, term) ||
        matchesSearch(appointment.phone, term) ||
        matchesSearch(appointment.service, term) ||
        matchesSearch(appointment.department, term) ||
        matchesSearch(appointment.doctor, term) ||
        matchesSearch(appointment.notes, term)
      );
    });
    const total = filtered.length;
    const paged = usePagination
      ? filtered.slice((page - 1) * pageSize, page * pageSize)
      : filtered;
    return res.json({
      appointments: paged,
      page: usePagination ? page : 1,
      pageSize: usePagination ? pageSize : paged.length,
      total,
    });
  }

  if (usePagination) {
    findOptions.skip = (page - 1) * pageSize;
    findOptions.take = pageSize;
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany(findOptions),
    usePagination
      ? db.appointment.count({ where: findOptions.where })
      : Promise.resolve(null),
  ]);

  return res.json({
    appointments,
    page: usePagination ? page : 1,
    pageSize: usePagination ? pageSize : appointments.length,
    total: usePagination ? total : appointments.length,
  });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    service,
    scheduledAt,
    status,
    notes,
    doctor,
    department,
    visit,
    priority,
    assigneeId,
  } = req.body || {};

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
      doctor: doctor ?? appointment.doctor,
      department: department ?? appointment.department,
      visit: visit ?? appointment.visit,
      priority: priority || appointment.priority,
      assigneeId: assigneeId ?? appointment.assigneeId,
    },
  });

  if (req.user.role === "ADMIN") {
    await logAdminAction(req, "APPOINTMENT_UPDATE", "appointment", id, {
      status: updated.status,
      scheduledAt: updated.scheduledAt,
      assigneeId: updated.assigneeId || null,
    });

    if (updated.userId) {
      await createNotification({
        type: "APPOINTMENT_UPDATE",
        targetType: "appointment",
        targetId: id,
        toUserId: updated.userId,
        payload: {
          status: updated.status,
          scheduledAt: updated.scheduledAt,
          service: updated.service,
        },
      });
    }
  }

  return res.json({ appointment: updated });
});

module.exports = router;
