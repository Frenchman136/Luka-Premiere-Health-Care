const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const appointmentsRoutes = require("./routes/appointments");
const messagesRoutes = require("./routes/messages");
const paymentsRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const { handleStripeWebhook } = require("./routes/payments");

const app = express();

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length
      ? { origin: allowedOrigins, credentials: true }
      : undefined
  )
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/messages", messagesRoutes);
app.use("/payments", paymentsRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
