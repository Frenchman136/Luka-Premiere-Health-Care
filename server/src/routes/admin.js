const express = require("express");

const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { logAdminAction, parseDate, toCsv, matchesSearch } = require("../utils/admin");

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

function buildAppointmentFilters(query) {
  const where = [];
  const status = query.status || null;
  const department = query.department || null;
  const doctor = query.doctor || null;
  const visit = query.visit || null;
  const from = parseDate(query.from);
  const to = parseDate(query.to, { endOfDay: true });
  if (status) where.push({ field: "status", op: "==", value: status });
  if (department) where.push({ field: "department", op: "==", value: department });
  if (doctor) where.push({ field: "doctor", op: "==", value: doctor });
  if (visit) where.push({ field: "visit", op: "==", value: visit });
  if (from) where.push({ field: "scheduledAt", op: ">=", value: from });
  if (to) where.push({ field: "scheduledAt", op: "<=", value: to });
  return {
    where: where.length ? where : undefined,
    search: String(query.search || "").trim().toLowerCase(),
  };
}

function buildMessageFilters(query) {
  const where = [];
  const status = query.status || null;
  const priority = query.priority || null;
  const assigneeId = query.assigneeId || null;
  const from = parseDate(query.from);
  const to = parseDate(query.to, { endOfDay: true });
  if (status) where.push({ field: "status", op: "==", value: status });
  if (priority) where.push({ field: "priority", op: "==", value: priority });
  if (assigneeId) where.push({ field: "assigneeId", op: "==", value: assigneeId });
  if (from) where.push({ field: "createdAt", op: ">=", value: from });
  if (to) where.push({ field: "createdAt", op: "<=", value: to });
  return {
    where: where.length ? where : undefined,
    search: String(query.search || "").trim().toLowerCase(),
  };
}

function filterAppointmentsBySearch(appointments, term) {
  if (!term) return appointments;
  return appointments.filter((appointment) => {
    const search = term;
    return (
      matchesSearch(appointment.firstName, search) ||
      matchesSearch(appointment.lastName, search) ||
      matchesSearch(appointment.email, search) ||
      matchesSearch(appointment.phone, search) ||
      matchesSearch(appointment.service, search) ||
      matchesSearch(appointment.department, search) ||
      matchesSearch(appointment.doctor, search) ||
      matchesSearch(appointment.notes, search)
    );
  });
}

function filterMessagesBySearch(messages, term) {
  if (!term) return messages;
  return messages.filter((message) => {
    const search = term;
    return (
      matchesSearch(message.name, search) ||
      matchesSearch(message.email, search) ||
      matchesSearch(message.subject, search) ||
      matchesSearch(message.body, search)
    );
  });
}

router.get("/overview", async (req, res) => {
  const [users, appointments, messages, payments] = await Promise.all([
    db.user.count(),
    db.appointment.count(),
    db.message.count(),
    db.payment.count(),
  ]);

  return res.json({
    counts: {
      users,
      appointments,
      messages,
      payments,
    },
  });
});

router.get("/analytics", async (req, res) => {
  const from = parseDate(req.query.from) || parseDate(new Date(Date.now() - 13 * 86400000));
  const to = parseDate(req.query.to, { endOfDay: true }) || new Date();

  const [appointments, messages] = await Promise.all([
    db.appointment.findMany({
      where: [
        { field: "scheduledAt", op: ">=", value: from },
        { field: "scheduledAt", op: "<=", value: to },
      ],
    }),
    db.message.findMany({
      where: [
        { field: "createdAt", op: ">=", value: from },
        { field: "createdAt", op: "<=", value: to },
      ],
    }),
  ]);

  const toKey = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toISOString().split("T")[0];
  };

  const days = {};
  const seedDate = new Date(from);
  seedDate.setHours(0, 0, 0, 0);
  const endDate = new Date(to);
  endDate.setHours(0, 0, 0, 0);
  for (
    let cursor = new Date(seedDate);
    cursor <= endDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const key = cursor.toISOString().split("T")[0];
    days[key] = { date: key, appointments: 0, messages: 0 };
  }

  appointments.forEach((appointment) => {
    const key = toKey(appointment.scheduledAt);
    if (!days[key]) {
      days[key] = { date: key, appointments: 0, messages: 0 };
    }
    days[key].appointments += 1;
  });

  messages.forEach((message) => {
    const key = toKey(message.createdAt);
    if (!days[key]) {
      days[key] = { date: key, appointments: 0, messages: 0 };
    }
    days[key].messages += 1;
  });

  const series = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  return res.json({ from, to, series });
});

router.get("/users", async (req, res) => {
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  const search = String(req.query.search || "").trim().toLowerCase();
  const usePagination =
    Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0;

  const findOptions = {
    orderBy: { createdAt: "desc" },
  };

  const users = await db.user.findMany(findOptions);
  const filtered = search
    ? users.filter((user) =>
        matchesSearch(user.name, search) || matchesSearch(user.email, search)
      )
    : users;

  const total = filtered.length;
  const paged = usePagination
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  return res.json({
    users: paged,
    page: usePagination ? page : 1,
    pageSize: usePagination ? pageSize : paged.length,
    total,
  });
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const appointments = await db.appointment.findMany({
    where: [{ field: "userId", op: "==", value: id }],
    orderBy: { scheduledAt: "desc" },
  });

  return res.json({ user, appointments });
});

router.patch("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  await db._admin.auth().setCustomUserClaims(id, { role });
  const updated = await db.user.upsert({
    where: { id },
    update: { role },
    create: { id, role },
  });

  await logAdminAction(req, "USER_ROLE_UPDATE", "user", id, { role });
  return res.json({ user: updated });
});

router.post("/users/role", async (req, res) => {
  const { identifier, role } = req.body || {};
  if (!identifier || !role) {
    return res.status(400).json({ error: "identifier and role are required" });
  }

  const userRecord = identifier.includes("@")
    ? await db._admin.auth().getUserByEmail(identifier)
    : await db._admin.auth().getUser(identifier);

  await db._admin.auth().setCustomUserClaims(userRecord.uid, { role });
  const updated = await db.user.upsert({
    where: { id: userRecord.uid },
    update: { role, email: userRecord.email || null, name: userRecord.displayName || null },
    create: {
      id: userRecord.uid,
      email: userRecord.email || null,
      name: userRecord.displayName || null,
      role,
    },
  });

  await logAdminAction(req, "USER_ROLE_UPDATE", "user", userRecord.uid, { role });
  return res.json({ user: updated });
});

router.get("/notifications", async (req, res) => {
  const status = req.query.status || null;
  const limit = Number(req.query.limit) || 25;
  const where = status ? [{ field: "status", op: "==", value: status }] : undefined;

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return res.json({ notifications: notifications.slice(0, limit) });
});

router.get("/audit", async (req, res) => {
  const limit = Number(req.query.limit) || 30;
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return res.json({ logs });
});

router.get("/export/appointments", async (req, res) => {
  const { where, search } = buildAppointmentFilters(req.query);
  const appointments = await db.appointment.findMany({
    where,
    orderBy: { scheduledAt: "desc" },
  });

  const filtered = filterAppointmentsBySearch(appointments, search);
  const csv = toCsv(filtered, [
    { key: "id", label: "ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "service", label: "Service" },
    { key: "department", label: "Department" },
    { key: "doctor", label: "Doctor" },
    { key: "scheduledAt", label: "Scheduled At" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "notes", label: "Notes" },
  ]);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=appointments.csv");
  return res.send(csv);
});

router.get("/export/messages", async (req, res) => {
  const { where, search } = buildMessageFilters(req.query);
  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const filtered = filterMessagesBySearch(messages, search);
  const csv = toCsv(filtered, [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
    { key: "body", label: "Message" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "createdAt", label: "Created At" },
  ]);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=messages.csv");
  return res.send(csv);
});

module.exports = router;
