import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { isAdminSession } from "@/features/auth/access";
import { getSafeAdminReturnTo } from "@/features/auth/schemas/auth";
import { proxy } from "@/proxy";
import type { AuthSession } from "@/server/auth";

function sessionWith(role: string, banned = false) {
  return {
    user: { role, banned },
    session: {},
  } as unknown as AuthSession;
}

describe("admin authentication boundaries", () => {
  it("accepts only active administrator sessions", () => {
    expect(isAdminSession(sessionWith("admin"))).toBe(true);
    expect(isAdminSession(sessionWith("user"))).toBe(false);
    expect(isAdminSession(sessionWith("admin", true))).toBe(false);
    expect(isAdminSession(null)).toBe(false);
  });

  it("allows only local admin return destinations", () => {
    expect(getSafeAdminReturnTo("/admin/projects?draft=1")).toBe(
      "/admin/projects?draft=1",
    );
    expect(getSafeAdminReturnTo("https://evil.example/admin")).toBe("/admin");
    expect(getSafeAdminReturnTo("//evil.example/admin")).toBe("/admin");
    expect(getSafeAdminReturnTo("/work")).toBe("/admin");
    expect(getSafeAdminReturnTo("/admin/login")).toBe("/admin");
  });

  it("optimistically redirects missing sessions but never blocks login", () => {
    const protectedRequest = new NextRequest(
      "http://localhost:3000/admin/projects?draft=1",
    );
    const protectedResponse = proxy(protectedRequest);

    expect(protectedResponse.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?returnTo=%2Fadmin%2Fprojects%3Fdraft%3D1",
    );

    const loginResponse = proxy(
      new NextRequest("http://localhost:3000/admin/login"),
    );
    expect(loginResponse.headers.get("location")).toBeNull();
  });

  it("lets a session cookie reach authoritative server authorization", () => {
    const request = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: "portfolio-admin.session_token=untrusted-placeholder",
      },
    });

    expect(proxy(request).headers.get("location")).toBeNull();
  });
});
