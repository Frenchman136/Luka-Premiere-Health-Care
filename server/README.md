# Premiere Health Backend

Node/Express backend with Prisma + Postgres, JWT auth, and Stripe payments.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install deps.
3. Run Prisma migrations.
4. Start the API.

## Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API runs on `http://localhost:4000` by default.
