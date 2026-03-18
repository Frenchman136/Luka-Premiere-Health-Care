const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const prisma = require("../src/db");

jest.mock("../src/db", () => ({
  user: { count: jest.fn() },
  appointment: { count: jest.fn(), findMany: jest.fn() },
  message: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: { count: jest.fn() },
}));

const makeToken = (role = "ADMIN", overrides = {}) =>
  jwt.sign(
    {
      sub: "user_123",
      email: "admin@example.com",
      role,
      ...overrides,
    },
    process.env.JWT_SECRET
  );

describe("Admin access", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects missing token", async () => {
    await request(app).get("/admin/overview").expect(401);
  });

  test("rejects non-admin tokens", async () => {
    const token = makeToken("USER");

    await request(app)
      .get("/admin/overview")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });

  test("returns counts for admin", async () => {
    prisma.user.count.mockResolvedValue(12);
    prisma.appointment.count.mockResolvedValue(7);
    prisma.message.count.mockResolvedValue(5);
    prisma.payment.count.mockResolvedValue(3);

    const token = makeToken("ADMIN");

    const response = await request(app)
      .get("/admin/overview")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      counts: {
        users: 12,
        appointments: 7,
        messages: 5,
        payments: 3,
      },
    });
  });

  test("restricts message inbox to admins", async () => {
    prisma.message.findMany.mockResolvedValue([]);

    const userToken = makeToken("USER");
    await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    const adminToken = makeToken("ADMIN");
    await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  test("appointments all query only opens for admins", async () => {
    prisma.appointment.findMany.mockResolvedValue([]);

    const userToken = makeToken("USER");
    await request(app)
      .get("/appointments?all=true")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_123" } })
    );

    prisma.appointment.findMany.mockResolvedValue([]);

    const adminToken = makeToken("ADMIN");
    await request(app)
      .get("/appointments?all=true")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  test("admin can update message status", async () => {
    prisma.message.findUnique.mockResolvedValue({
      id: "msg_123",
      status: "NEW",
    });
    prisma.message.update.mockResolvedValue({
      id: "msg_123",
      status: "RESOLVED",
    });

    const adminToken = makeToken("ADMIN");
    const response = await request(app)
      .patch("/messages/msg_123")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "RESOLVED" })
      .expect(200);

    expect(response.body).toEqual({
      message: { id: "msg_123", status: "RESOLVED" },
    });
  });
});
