const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
};

jest.mock("../src/db", () => ({
  user: { count: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  appointment: { count: jest.fn(), findMany: jest.fn() },
  message: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: { count: jest.fn() },
  _admin: {
    auth: () => mockAuth,
  },
}));

const makeToken = () => "test-token";

describe("Admin access", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
    });
    db.user.findUnique.mockResolvedValue({
      id: "user_123",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  test("rejects missing token", async () => {
    await request(app).get("/admin/overview").expect(401);
  });

  test("rejects non-admin tokens", async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "user@example.com",
      role: "USER",
      name: "User",
    });

    await request(app)
      .get("/admin/overview")
      .set("Authorization", `Bearer ${makeToken()}`)
      .expect(403);
  });

  test("returns counts for admin", async () => {
    db.user.count.mockResolvedValue(12);
    db.appointment.count.mockResolvedValue(7);
    db.message.count.mockResolvedValue(5);
    db.payment.count.mockResolvedValue(3);

    const response = await request(app)
      .get("/admin/overview")
      .set("Authorization", `Bearer ${makeToken()}`)
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
    db.message.findMany.mockResolvedValue([]);

    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "user@example.com",
      role: "USER",
      name: "User",
    });
    await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${makeToken()}`)
      .expect(403);

    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
    });
    await request(app)
      .get("/messages")
      .set("Authorization", `Bearer ${makeToken()}`)
      .expect(200);
  });

  test("appointments all query only opens for admins", async () => {
    db.appointment.findMany.mockResolvedValue([]);

    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "user@example.com",
      role: "USER",
      name: "User",
    });
    await request(app)
      .get("/appointments?all=true")
      .set("Authorization", `Bearer ${makeToken()}`)
      .expect(200);

    expect(db.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_123" } })
    );

    db.appointment.findMany.mockResolvedValue([]);

    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
    });
    await request(app)
      .get("/appointments?all=true")
      .set("Authorization", `Bearer ${makeToken()}`)
      .expect(200);

    expect(db.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  test("admin can update message status", async () => {
    db.message.findUnique.mockResolvedValue({
      id: "msg_123",
      status: "NEW",
    });
    db.message.update.mockResolvedValue({
      id: "msg_123",
      status: "RESOLVED",
    });

    const response = await request(app)
      .patch("/messages/msg_123")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ status: "RESOLVED" })
      .expect(200);

    expect(response.body).toEqual({
      message: { id: "msg_123", status: "RESOLVED" },
    });
  });
});
