const db = require("../db");

function logAdminAction(req, action, targetType, targetId, metadata = {}) {
  if (!req?.user) return null;
  return db.auditLog.create({
    data: {
      actorId: req.user.sub || null,
      actorEmail: req.user.email || null,
      action,
      targetType,
      targetId,
      metadata,
    },
  });
}

function createNotification(data) {
  return db.notification.create({ data });
}

function parseDate(value, { endOfDay = false } = {}) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }
  return parsed;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows, columns) {
  const header = columns.map((col) => csvEscape(col.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => csvEscape(row[col.key])).join(",")
  );
  return [header, ...lines].join("\n");
}

function matchesSearch(value, term) {
  if (!term) return true;
  if (!value) return false;
  return String(value).toLowerCase().includes(term);
}

module.exports = {
  logAdminAction,
  createNotification,
  parseDate,
  toCsv,
  matchesSearch,
};
