import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { authClient } from "@/features/auth/auth-client";

vi.mock("@/features/auth/auth-client", () => ({
  authClient: {
    signIn: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

describe("admin interactive foundations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a generic invalid-login error without enumerating accounts", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: { status: 401, statusText: "Unauthorized", message: "No user" },
    } as never);

    render(<LoginForm returnTo="/admin" />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "missing@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "not-a-real-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password.")).toBeVisible();
    expect(screen.queryByText(/No user/i)).not.toBeInTheDocument();
  });

  it("renders keyboard-reachable responsive navigation and logout", async () => {
    vi.mocked(authClient.signOut).mockImplementation(
      () => new Promise(() => {}) as never,
    );

    render(
      <AdminShell admin={{ name: "Admin", email: "admin@example.com" }}>
        <h1>Dashboard</h1>
      </AdminShell>,
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(
      screen.getAllByRole("navigation", { name: "Admin navigation" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "Projects" })[0],
    ).toHaveAttribute("href", "/admin/projects");
    expect(
      screen.getAllByRole("link", { name: "Dashboard" })[0],
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button", { name: "Logout" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Logout" })[0]);
    await waitFor(() => expect(authClient.signOut).toHaveBeenCalledOnce());
  });
});
