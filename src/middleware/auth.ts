import { Context, Next } from "koa";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export const authMiddleware = async (ctx: Context, next: Next) => {
  try {
    const token = ctx.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: "No token provided" };
      return;
    }

    const payload = await verifier.verify(token);
    ctx.state.user = payload;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "Invalid token" };
  }
};

export const adminOnly = async (ctx: Context, next: Next) => {
  const userScope = ctx.state.user["cognito:groups"] || [];

  if (!userScope.includes("admin")) {
    ctx.status = 403;
    ctx.body = { error: "Admin access required" };
    return;
  }

  await next();
};
