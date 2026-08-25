import { getServerEnv } from "@/config/env";
import { assertAdmin } from "@/server/auth/session";
import { createSignedUploadAuthorization } from "@/server/media/cloudinary";
import { consumeRateLimit } from "@/server/rate-limit";
import { hashPrivateIdentifier } from "@/server/security/identifiers";

export async function POST() {
  try {
    const session = await assertAdmin();
    const identifierHash = hashPrivateIdentifier(
      `media-sign:${session.user.id}`,
      getServerEnv().RATE_LIMIT_HMAC_SECRET,
    );
    const limit = await consumeRateLimit({
      scope: "media-sign",
      identifierHash,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limit.allowed)
      return Response.json(
        { error: "Too many upload requests. Try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil((limit.retryAt.getTime() - Date.now()) / 1000),
              ),
            ),
          },
        },
      );
    return Response.json(createSignedUploadAuthorization(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Media upload is unavailable." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
}
