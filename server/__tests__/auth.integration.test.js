const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

const mockVerifyIdToken = jest.fn();
const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
};

jest.mock("../src/db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  appointment: { count: jest.fn(), findMany: jest.fn() },
  message: { count: jest.fn(), findMany: jest.fn() },
  payment: { count: jest.fn() },
  _admin: {
    auth: () => mockAuth,
  },
}));

describe("Firebase ID token auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({
      uid: "user_123",
      email: "user@example.com",
      role: "USER",
      name: "Test User",
    });
    db.user.findUnique.mockResolvedValue({
      id: "user_123",
      email: "user@example.com",
      role: "USER",
      name: "Test User",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  test("rejects missing tokens", async () => {
    await request(app).get("/auth/me").expect(401);
  });

  test("accepts Firebase ID tokens for protected routes", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer test-token")
      .expect(200);

    expect(mockVerifyIdToken).toHaveBeenCalledWith("test-token");
    expect(response.body.user).toEqual(
      expect.objectContaining({
        id: "user_123",
        email: "user@example.com",
        role: "USER",
        name: "Test User",
      })
    );
  });
});
