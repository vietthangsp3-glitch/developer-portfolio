import { describe, expect, it } from "vitest";

import { readBoundedJson } from "@/server/security/request-body";

describe("bounded JSON request parsing", () => {
  it("rejects oversized bodies without Content-Length", async () => {
    const request = new Request("https://example.com/report", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(200) }),
    });
    request.headers.delete("content-length");

    await expect(readBoundedJson(request, 64)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("does not trust a misleading small Content-Length", async () => {
    const request = new Request("https://example.com/report", {
      method: "POST",
      headers: { "content-length": "1" },
      body: JSON.stringify({ value: "x".repeat(200) }),
    });

    await expect(readBoundedJson(request, 64)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("parses valid bounded JSON", async () => {
    const request = new Request("https://example.com/report", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });

    await expect(readBoundedJson(request, 64)).resolves.toEqual({
      ok: true,
      value: { ok: true },
    });
  });
});
