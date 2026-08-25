import "server-only";

import { getServerEnv } from "@/config/env";
import { hashPrivateIdentifier } from "@/server/security/identifiers";

function getTrustedNetworkSignal(headers: Headers) {
  if (process.env.VERCEL === "1") {
    const forwarded = headers.get("x-vercel-forwarded-for")?.split(",")[0];
    return forwarded?.trim().slice(0, 256) || "vercel-unknown";
  }

  return "local-development";
}

export function getContactIdentifierHash(headers: Headers) {
  return hashPrivateIdentifier(
    `contact:${getTrustedNetworkSignal(headers)}`,
    getServerEnv().RATE_LIMIT_HMAC_SECRET,
  );
}
