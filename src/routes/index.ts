import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import Router from "@koa/router";
import { Context } from "koa";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import {
  generateSecretHash,
  respondToNewPasswordRequiredChallenge,
} from "../helpers";
import { adminOnly, authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { AuthRequest, EditAccountRequest } from "../types/requests";
import { AuthRequestDTO, EditAccountDTO } from "../validation/requests";

const router = new Router();
const userRepository = AppDataSource.getRepository(User);

const clientId: string = process.env.COGNITO_CLIENT_ID ?? "";
const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    accountId: process.env.AWS_ACCOUNT_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

router.post("/auth", validateBody(AuthRequestDTO), async (ctx: Context) => {
  const { email, name, role } = ctx.request.body as AuthRequest;

  if (!email || !name || !role) {
    ctx.status = 400;
    ctx.body = { error: "Email, name and role are required" };
    return;
  }

  try {
    let user = await userRepository.findOne({ where: { email } });

    if (!user) {
      user = userRepository.create({
        email,
        name,
        role,
        isOnboarded: false,
      });
      await userRepository.save(user);
    }

    const secretHash = generateSecretHash(
      clientId,
      process.env.COGNITO_CLIENT_SECRET ?? "",
      name
    );

    try {
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: name,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
        ],
        TemporaryPassword: "StrongPassword123!",
        MessageAction: "SUPPRESS",
      });

      await cognitoClient.send(createUserCommand);

      const authCommand = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: name,
          PASSWORD: "StrongPassword123!",
          SECRET_HASH: secretHash,
        },
      });

      const authResult = await cognitoClient.send(authCommand);

      ctx.body = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isOnboarded: user.isOnboarded,
        },
        tokens: {
          accessToken: authResult.AuthenticationResult?.AccessToken,
          idToken: authResult.AuthenticationResult?.IdToken,
          refreshToken: authResult.AuthenticationResult?.RefreshToken,
        },
      };
    } catch (cognitoError) {
      if (cognitoError.name === "UsernameExistsException") {
        const authCommand = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: clientId,
          AuthParameters: {
            USERNAME: name,
            PASSWORD: process.env.COGNITO_DEFAULT_PASSWORD ?? "",
            SECRET_HASH: secretHash,
          },
        });

        let authResult = await cognitoClient.send(authCommand);
        if (authResult.ChallengeName === "NEW_PASSWORD_REQUIRED") {
          authResult = await respondToNewPasswordRequiredChallenge(
            clientId,
            name,
            secretHash,
            authResult.Session ?? "",
            cognitoClient
          );
        }

        ctx.body = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isOnboarded: user.isOnboarded,
          },
          tokens: {
            accessToken: authResult.AuthenticationResult?.AccessToken,
            idToken: authResult.AuthenticationResult?.IdToken,
            refreshToken: authResult.AuthenticationResult?.RefreshToken,
          },
        };
      } else {
        throw cognitoError;
      }
    }
  } catch (error: any) {
    console.error("Authentication error:", error);
    ctx.status = 500;
    ctx.body = {
      error: "Authentication failed",
      details: error.message,
    };
  }
});

router.get("/me", authMiddleware, async (ctx: Context) => {
  const user = await userRepository.findOne({
    where: { email: ctx.state.user.email },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  ctx.body = { user };
});

router.put(
  "/edit-account",
  authMiddleware,
  validateBody(EditAccountDTO),
  async (ctx: Context) => {
    const { name, role } = ctx.request.body as EditAccountRequest;

    if (!name) {
      ctx.status = 400;
      ctx.body = { error: "Name is required" };
      return;
    }

    const userScope = ctx.state.user["cognito:groups"] || [];
    const user = await userRepository.findOne({
      where: { email: ctx.state.user.email },
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    if (userScope.includes("admin")) {
      if (role) user.role = role;
    }

    user.name = name;
    user.isOnboarded = true;
    await userRepository.save(user);

    ctx.body = { user };
  }
);

router.get("/users", authMiddleware, adminOnly, async (ctx: Context) => {
  const users = await userRepository.find();
  ctx.body = { users };
});

export default router;
