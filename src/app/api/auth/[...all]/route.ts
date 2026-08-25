import { toNextJsHandler } from "better-auth/next-js";

import { loginInputSchema } from "@/features/auth/schemas/auth";
import { recordAuditEventBestEffort } from "@/server/audit";
import { auth } from "@/server/auth";
import { getLoginIdentifierHash } from "@/server/auth/rate-limit";
import { consumeRateLimit } from "@/server/rate-limit";
import { readBoundedJson } from "@/server/security/request-body";

const handlers = toNextJsHandler(auth);
const signInPath = "/api/auth/sign-in/email";
const signOutPath = "/api/auth/sign-out";

export const GET = handlers.GET;

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

async function enforceLoginRateLimit(request: Request) {
  const body = await readBoundedJson(request.clone(), 8_192);
  if (!body.ok) return body.reason;

  const parsed = loginInputSchema.safeParse(body.value);
  const email = parsed.success ? parsed.data.email : "invalid";
  const result = await consumeRateLimit({
    scope: "admin-login",
    identifierHash: getLoginIdentifierHash(request.headers, email),
    limit: 5,
    windowMs: 15 * 60 * 1_000,
  });

  return result.allowed ? "allowed" : "denied";
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;

  if (path === signInPath) {
    try {
      const rateLimit = await enforceLoginRateLimit(request);
      if (rateLimit === "too_large") {
        return jsonError("Request body is too large.", 413);
      }
      if (rateLimit === "invalid") {
        return jsonError("Invalid sign-in request.", 400);
      }
      if (rateLimit === "denied") {
        return jsonError("Too many attempts. Try again later.", 429);
      }
    } catch {
      return jsonError("Unable to sign in right now.", 503);
    }

    const response = await handlers.POST(request);

    if (!response.ok) {
      await recordAuditEventBestEffort({
        actorUserId: null,
        action: "auth.login.failed",
        entityType: "auth_session",
        entityId: null,
        metadata: { reason: "credentials" },
      });

      return jsonError("Invalid email or password.", 401);
    }

    return response;
  }

  if (path === signOutPath) {
    const currentSession = await auth.api.getSession({
      headers: request.headers,
    });
    const response = await handlers.POST(request);

    if (response.ok && currentSession) {
      await recordAuditEventBestEffort({
        actorUserId: currentSession.user.id,
        action: "auth.logout",
        entityType: "auth_session",
        entityId: currentSession.session.id,
        metadata: {},
      });
    }

    return response;
  }

  return handlers.POST(request);
}
