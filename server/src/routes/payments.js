const express = require("express");
const Stripe = require("stripe");
const { env } = require("../utils/env");

const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function getStripeClient() {
  if (!env("STRIPE_SECRET_KEY", "stripe.secret_key")) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(env("STRIPE_SECRET_KEY", "stripe.secret_key"));
}

router.use(requireAuth);

router.post("/checkout", async (req, res) => {
  const { appointmentId, amount, currency } = req.body || {};

  if (!appointmentId || !amount) {
    return res
      .status(400)
      .json({ error: "appointmentId and amount are required" });
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (req.user.role !== "ADMIN" && appointment.userId !== req.user.sub) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const payment = await db.payment.create({
    data: {
      userId: appointment.userId,
      appointmentId: appointment.id,
      providerRef: "pending",
      amount: Number(amount),
      currency: currency || "usd",
    },
  });

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: req.user.email,
    payment_intent_data: {
      metadata: {
        paymentId: payment.id,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency || "usd",
          unit_amount: Number(amount),
          product_data: {
            name: appointment.service,
          },
        },
      },
    ],
    success_url: `${env("FRONTEND_URL", "frontend.url")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env("FRONTEND_URL", "frontend.url")}/payment/cancel`,
    metadata: {
      paymentId: payment.id,
    },
  });

  const updatedPayment = await db.payment.update({
    where: { id: payment.id },
    data: { providerRef: session.id },
  });

  return res.json({
    payment: updatedPayment,
    checkoutUrl: session.url,
  });
});

async function handleStripeWebhook(req, res) {
  let event;

  try {
    const stripe = getStripeClient();
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env("STRIPE_WEBHOOK_SECRET", "stripe.webhook_secret")
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await db.payment.update({
        where: { id: paymentId },
        data: { status: "PAID" },
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const paymentId = intent.metadata?.paymentId;
    const payment = paymentId
      ? await db.payment.findUnique({ where: { id: paymentId } })
      : null;
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }
  }

  return res.json({ received: true });
}

module.exports = router;
module.exports.handleStripeWebhook = handleStripeWebhook;
