import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobileMenu } from "@/components/layout/mobile-menu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/northline-build",
}));

const items = [
  { label: "ABOUT", href: "/#about" },
  { label: "PROJECTS", href: "/projects" },
];

describe("MobileMenu", () => {
  it("opens and closes its native dialog and identifies the active section", () => {
    render(<MobileMenu items={items} />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    const dialog = screen.getByRole("dialog", { hidden: true });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("link", { name: "PROJECTS", hidden: true }),
    ).toHaveAttribute("aria-current", "page");

    fireEvent.click(trigger);
    expect(dialog).toHaveAttribute("open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog).not.toHaveAttribute("open");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
