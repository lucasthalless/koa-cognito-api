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
