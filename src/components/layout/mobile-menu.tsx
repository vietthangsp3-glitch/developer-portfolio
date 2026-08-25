"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type MobileMenuProps = {
  items: ReadonlyArray<{
    label: string;
    href: string;
  }>;
};

export function MobileMenu({ items }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function openMenu() {
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  return (
    <div className="md:hidden">
      <Button
        aria-controls="site-menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={openMenu}
        variant="quiet"
      >
        Menu
      </Button>

      <dialog
        ref={dialogRef}
        id="site-menu"
        className="site-menu"
        aria-label="Site menu"
        onClose={() => setIsOpen(false)}
      >
        <div className="flex h-full flex-col">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <p className="text-label text-muted-foreground font-mono uppercase">
              Navigation
            </p>
            <Button autoFocus onClick={closeMenu} variant="quiet">
              Close
            </Button>
          </div>

          <nav className="mt-8" aria-label="Mobile navigation">
            <ul>
              {items.map((item, index) => (
                <li key={item.href} className="border-border border-b">
                  <Link
                    href={item.href}
                    aria-current={
                      !item.href.includes("#") &&
                      (pathname === item.href ||
                        pathname.startsWith(`${item.href}/`))
                        ? "page"
                        : undefined
                    }
                    className="text-subheading text-hero-eyebrow! hover:text-foreground! focus-visible:text-foreground! aria-[current=page]:text-accent! flex min-h-16 items-center justify-between py-3 font-medium no-underline transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-label text-muted-foreground font-mono"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-border mt-auto border-t pt-4">
            <p className="text-muted-foreground max-w-[28ch] text-sm leading-6">
              Independent design and development for ambitious digital work.
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
