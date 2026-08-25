import { toNextJsHandler } from "better-auth/next-js";

import { loginInputSchema } from "@/features/auth/schemas/auth";
import { recordAuditEventBestEffort } from "@/server/audit";
import { auth } from "@/server/auth";
import { getLoginIdentifierHash } from "@/server/auth/rate-limit";
import { consumeRateLimit } from "@/server/rate-limit";

const handlers = toNextJsHandler(auth);
const signInPath = "/api/auth/sign-in/email";
const signOutPath = "/api/auth/sign-out";

export const GET = handlers.GET;

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

async function enforceLoginRateLimit(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) return false;

  let input: unknown;
  try {
    input = await request.clone().json();
  } catch {
    return false;
  }

  const parsed = loginInputSchema.safeParse(input);
  const email = parsed.success ? parsed.data.email : "invalid";
  const result = await consumeRateLimit({
    scope: "admin-login",
    identifierHash: getLoginIdentifierHash(request.headers, email),
    limit: 5,
    windowMs: 15 * 60 * 1_000,
  });

  return result.allowed;
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;

  if (path === signInPath) {
    try {
      if (!(await enforceLoginRateLimit(request))) {
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
