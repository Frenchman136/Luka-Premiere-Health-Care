# Premiere Health Backend

Node/Express backend with Firebase (Firestore + Firebase Auth) and Stripe payments.

## Setup

1. Copy `.env.example` to `.env` and fill values (service account required for local dev).
2. Install deps.
3. Start the API.

## Commands

```bash
npm install
npm run dev
```

API runs on `http://localhost:4000` by default.

Firestore note: the appointments list uses `userId` + `scheduledAt` ordering, so create a composite index if Firestore prompts you at runtime.

Auth note: clients must sign in with Firebase Auth and send a Firebase ID token in the `Authorization: Bearer <token>` header. The `/auth/register` endpoint returns a Firebase custom token you can exchange client-side for an ID token.

Rules note: sample Firestore rules live at `server/firestore.rules` (adjust and deploy with Firebase CLI if you access Firestore directly from the client).

Admin note: promote an existing Firebase user to admin with `npm run admin:promote -- <email-or-uid>`.

Functions note: when deploying with Firebase Functions, set `CORS_ORIGIN`, `FRONTEND_URL`, and Stripe keys as environment variables. Firebase-managed runtimes use default credentials, so you typically do not need a service account there.
