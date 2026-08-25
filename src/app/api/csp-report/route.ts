import { readBoundedJson } from "@/server/security/request-body";

function blockedOrigin(value: unknown) {
  if (typeof value !== "string" || value.length > 2_048) return undefined;
  if (value === "inline" || value === "eval") return value;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 16_384);
  if (!body.ok && body.reason === "too_large")
    return new Response(null, { status: 413 });

  if (body.ok) {
    try {
      const payload = body.value as Record<string, unknown>;
      const report = (payload["csp-report"] ?? payload) as Record<
        string,
        unknown
      >;
      const directive =
        typeof report["violated-directive"] === "string"
          ? report["violated-directive"].slice(0, 120)
          : "unknown";

      console.warn("CSP report", {
        directive,
        blockedOrigin: blockedOrigin(report["blocked-uri"]),
      });
    } catch {
      // Malformed reports are ignored; the endpoint never reflects input.
    }
  }

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
