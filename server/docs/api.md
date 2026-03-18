# API Contract (Draft)

Base URL: `http://localhost:4000`

## Auth

`POST /auth/register`
Body: `{ name?, email, password }`

`POST /auth/login`
Body: `{ email, password }`

`GET /auth/me`
Header: `Authorization: Bearer <token>`

## Appointments

`GET /appointments`
Header: `Authorization: Bearer <token>`
Query: `?all=true` (admin only)
Query (optional pagination): `?page=1&pageSize=10`

`POST /appointments`
Header: `Authorization: Bearer <token>`
Body: `{ service, scheduledAt, notes? }`

`PATCH /appointments/:id`
Header: `Authorization: Bearer <token>`
Body: `{ service?, scheduledAt?, status?, notes? }`

## Messages (Contact Form)

`POST /messages`
Body: `{ name, email, subject?, body }`

`GET /messages`
Header: `Authorization: Bearer <token>` (admin only)
Query (optional pagination): `?page=1&pageSize=10`

`PATCH /messages/:id`
Header: `Authorization: Bearer <token>` (admin only)
Body: `{ status }`

## Payments

`POST /payments/checkout`
Header: `Authorization: Bearer <token>`
Body: `{ appointmentId, amount, currency? }`

`POST /payments/webhook`
Stripe webhook endpoint

## Admin

`GET /admin/overview`
Header: `Authorization: Bearer <token>` (admin only)
