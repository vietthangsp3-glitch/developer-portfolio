import "server-only";

import { createHmac } from "node:crypto";

export function hashPrivateIdentifier(
  identifier: string,
  secret: string,
): string {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (normalizedIdentifier.length === 0 || secret.length < 32) {
    throw new Error(
      "A normalized identifier and a 32-character secret are required.",
    );
  }

  return createHmac("sha256", secret)
    .update(normalizedIdentifier, "utf8")
    .digest("hex");
}
