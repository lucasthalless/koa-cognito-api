import { authMiddleware, adminOnly } from "../../src/middleware/auth";
import { Context } from "koa";

describe("Auth Middleware", () => {
  let mockContext: Partial<Context>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockContext = {
      headers: {},
      state: {},
      status: 200,
      body: {},
    };
    mockNext = jest.fn();
  });

  test("should reject requests without token", async () => {
    await authMiddleware(mockContext as Context, mockNext);
    expect(mockContext.status).toBe(401);
    expect(mockContext.body).toEqual({ error: "No token provided" });
  });

  test("adminOnly should reject non-admin users", async () => {
    mockContext.state = { user: { "cognito:groups": ["user"] } };
    await adminOnly(mockContext as Context, mockNext);
    expect(mockContext.status).toBe(403);
  });
});
