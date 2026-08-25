import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isHttpsProduction =
  process.env.VERCEL_ENV === "production" &&
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com",
  "media-src 'self' https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/work", destination: "/projects", permanent: true },
      {
        source: "/work/:slug",
        destination: "/projects/:slug",
        permanent: true,
      },
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/services", destination: "/#services", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
    ];
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy-Report-Only",
        value: contentSecurityPolicy,
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
      },
    ];

    if (isHttpsProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // The CLI checker does not return captured stdout under the current Node 24
    // runtime. TypeScript 5 still exposes the compiler API Next.js needs.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
