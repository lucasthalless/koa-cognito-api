import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

export function generateSecretHash(
  clientId: string,
  clientSecret: string,
  username: string
) {
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}

export async function respondToNewPasswordRequiredChallenge(
  clientId: string,
  name: string,
  secretHash: string,
  Session: string,
  cognitoClient: CognitoIdentityProviderClient
) {
  const respondChallenge = new RespondToAuthChallengeCommand({
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: clientId,
    ChallengeResponses: {
      USERNAME: name,
      NEW_PASSWORD: process.env.COGNITO_DEFAULT_PASSWORD ?? "",
      "userAttributes.nickname": name,
      SECRET_HASH: secretHash,
    },
    Session,
  });
  return await cognitoClient.send(respondChallenge);
}
