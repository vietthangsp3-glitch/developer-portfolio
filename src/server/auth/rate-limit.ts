import "server-only";

import { getServerEnv } from "@/config/env";
import { hashPrivateIdentifier } from "@/server/security/identifiers";

function getNetworkSignal(headers: Headers) {
  const value =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",").at(-1) ??
    "unknown";

  return value.trim().slice(0, 256) || "unknown";
}

export function getLoginIdentifierHash(headers: Headers, email: string) {
  return hashPrivateIdentifier(
    `admin-login:${getNetworkSignal(headers)}:${email}`,
    getServerEnv().RATE_LIMIT_HMAC_SECRET,
  );
}
