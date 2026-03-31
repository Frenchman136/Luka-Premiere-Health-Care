const express = require("express");

const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { logAdminAction, parseDate, matchesSearch } = require("../utils/admin");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, body } = req.body || {};

  if (!name || !email || !body) {
    return res
      .status(400)
      .json({ error: "Name, email, and message body are required" });
  }

  const message = await db.message.create({
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
  const status = req.query.status || null;
  const priority = req.query.priority || null;
  const assigneeId = req.query.assigneeId || null;
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to, { endOfDay: true });
  const search = String(req.query.search || "").trim().toLowerCase();

  const where = [];
  if (status) where.push({ field: "status", op: "==", value: status });
  if (priority) where.push({ field: "priority", op: "==", value: priority });
  if (assigneeId) where.push({ field: "assigneeId", op: "==", value: assigneeId });
  if (from) where.push({ field: "createdAt", op: ">=", value: from });
  if (to) where.push({ field: "createdAt", op: "<=", value: to });
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);
  const usePagination =
    Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0;

  const findOptions = {
    where: where.length ? where : undefined,
    orderBy: { createdAt: "desc" },
  };

  if (search) {
    const messages = await db.message.findMany(findOptions);
    const filtered = messages.filter((message) => {
      const term = search;
      return (
        matchesSearch(message.name, term) ||
        matchesSearch(message.email, term) ||
        matchesSearch(message.subject, term) ||
        matchesSearch(message.body, term)
      );
    });
    const total = filtered.length;
    const paged = usePagination
      ? filtered.slice((page - 1) * pageSize, page * pageSize)
      : filtered;
    return res.json({
      messages: paged,
      page: usePagination ? page : 1,
      pageSize: usePagination ? pageSize : paged.length,
      total,
    });
  }

  if (usePagination) {
    findOptions.skip = (page - 1) * pageSize;
    findOptions.take = pageSize;
  }

  const [messages, total] = await Promise.all([
    db.message.findMany(findOptions),
    usePagination
      ? db.message.count({ where: findOptions.where })
      : Promise.resolve(null),
  ]);

  return res.json({
    messages,
    page: usePagination ? page : 1,
    pageSize: usePagination ? pageSize : messages.length,
    total: usePagination ? total : messages.length,
  });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, priority, tags, assigneeId } = req.body || {};

  const message = await db.message.findUnique({ where: { id } });
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  const updated = await db.message.update({
    where: { id },
    data: {
      status: status || message.status,
      priority: priority || message.priority,
      tags: Array.isArray(tags) ? tags : message.tags,
      assigneeId: assigneeId ?? message.assigneeId,
    },
  });

  await logAdminAction(req, "MESSAGE_UPDATE", "message", id, {
    status: updated.status,
    priority: updated.priority,
  });

  return res.json({ message: updated });
});

module.exports = router;
