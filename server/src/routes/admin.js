const express = require("express");

const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

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

module.exports = router;
