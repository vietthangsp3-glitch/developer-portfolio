const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  // TODO(owner): Confirm these identity and availability values before launch.
  name: "Thang Nguyen",
  shortName: "TN",
  title: "Thang Nguyen — Independent Developer",
  description:
    "A developer portfolio focused on thoughtful interfaces and production-ready web engineering.",
  url: siteUrl,
  availability: "Available for select freelance projects",
  location: "Working with clients worldwide",
  email: "hello@thangnguyen.dev",
  navigation: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
