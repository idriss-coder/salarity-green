import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/config/env";

/**
 * Lien de téléchargement client : un jeton aléatoire stocké sur la soumission,
 * signé (HMAC) pour que l'URL ne puisse pas être forgée même en connaissant l'identifiant.
 */
export function generateDownloadToken(): string {
  return randomBytes(24).toString("base64url");
}

export function signDownloadToken(submissionId: string, token: string): string {
  return createHmac("sha256", getEnv().DOWNLOAD_TOKEN_SECRET)
    .update(`${submissionId}:${token}`)
    .digest("base64url");
}

export function verifyDownloadSignature(
  submissionId: string,
  token: string,
  signature: string,
): boolean {
  const expected = Buffer.from(signDownloadToken(submissionId, token));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
