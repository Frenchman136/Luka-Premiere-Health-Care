const express = require("express");

const prisma = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/overview", async (req, res) => {
  const [users, appointments, messages, payments] = await Promise.all([
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.message.count(),
    prisma.payment.count(),
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

module.exports = router;
