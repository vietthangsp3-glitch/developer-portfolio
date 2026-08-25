# Developer Portfolio

A production-focused personal portfolio built with Next.js, TypeScript, and
Tailwind CSS. The project is delivered in explicit phases so visual quality,
accessibility, performance, and backend security can be reviewed independently.

Phase 9 completes the repository-side production-readiness safeguards around
the database-first contact pipeline and private CMS.
Valid inquiries are rate-limited, stored in Neon, and optionally notified
through Resend without risking the stored lead when email delivery fails. The
private CMS now includes inquiry filtering, status restoration, delivery state,
and an audited manual retry. Metadata, published-project sitemap entries,
environment-aware robots, JSON-LD, social previews, and report-only CSP headers
are active without redesigning the approved public experience.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Local development

Copy the documented environment template and set the canonical local origin:

```bash
cp .env.example .env.local
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # local development
npm run lint         # ESLint and Next.js rules
npm run typecheck    # strict TypeScript validation
npm test             # Vitest unit and component tests
npm run test:e2e     # Playwright responsive and keyboard smoke tests
npm run format       # format supported files
npm run format:check # verify formatting
npm run build        # production webpack build
npm run start        # serve the production build
npm run db:generate  # generate reviewable SQL from the Drizzle schema
npm run db:check     # verify migration history consistency
npm run db:migrate   # apply committed migrations to the configured database
npm run db:studio    # inspect the configured development database
npm run db:seed -- --confirm-development # explicitly seed demo content
npm run auth:create-admin -- --email you@example.com --name "Admin" # guarded admin bootstrap; prompts for password
npm run production:check # validate a complete production environment without printing secrets
```

## Architecture

- Application routes and source live under `src/`.
- Public pages use the `(site)` route group and Server Components by default.
- Site identity and navigation are centralized in `src/config/site.ts`.
- Semantic design tokens live in `src/app/globals.css` and are exposed to
  Tailwind CSS 4.
- Public content reads through typed Neon DTOs and retains the structured
  case-study block model.
- Motion lives in small leaf Client Components under `src/components/animation`;
  static content remains server-rendered, visible without JavaScript, and final
  by default for reduced-motion users.
- Database, email, media, and security infrastructure lives under `src/server`,
  imports `server-only`, and exposes minimal DTOs through dedicated boundaries.
- Better Auth owns database sessions and the protected `/admin` CMS. Vercel
  Analytics remains deferred pending an explicit privacy/product decision;
  Three.js remains outside the approved baseline.

Read [the architecture blueprint](docs/ARCHITECTURE.md) and
[the implementation plan](docs/IMPLEMENTATION_PLAN.md) before making changes.
Permanent contributor instructions are in [AGENTS.md](AGENTS.md).

## Environment

| Variable                     | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Canonical absolute origin for the Metadata API.                |
| `DATABASE_URL`               | Pooled Neon URL used by application runtime queries.           |
| `DATABASE_URL_UNPOOLED`      | Direct Neon URL preferred for migrations and local seeds.      |
| `BETTER_AUTH_URL`            | Exact application origin used by Better Auth.                  |
| `BETTER_AUTH_SECRET`         | High-entropy Better Auth encryption/signing secret, 32+ chars. |
| `RATE_LIMIT_HMAC_SECRET`     | Separate 32+ character key for privacy-preserving rate limits. |
| `CLOUDINARY_CLOUD_NAME`      | Cloudinary account name; required with the other media values. |
| `CLOUDINARY_API_KEY`         | Cloudinary upload API key.                                     |
| `CLOUDINARY_API_SECRET`      | Server-only signing and deletion secret.                       |
| `RESEND_API_KEY`             | Optional locally; server-only Resend credential.               |
| `INQUIRY_NOTIFICATION_EMAIL` | Private recipient for stored inquiry notifications.            |
| `INQUIRY_FROM_EMAIL`         | Sender on a verified Resend domain.                            |

Never commit `.env.local` or real credentials. Auth and admin routes fail closed
when their server environment is incomplete; no auth value uses a
`NEXT_PUBLIC_` prefix.

All three inquiry email variables must be set together. Without them, valid
local inquiries still store successfully with `not_requested` delivery state.
Production launch requires a verified Resend domain and all three variables.

## Neon and migrations

1. Create or select a non-production Neon development branch.
2. Copy `.env.example` to `.env.local` and add the branch's pooled runtime URL
   plus its direct/unpooled migration URL.
3. Run `npm run db:generate`, then review the generated SQL under `drizzle/`.
4. Run `npm run db:check` before applying the migration.
5. Run `npm run db:migrate` only after confirming the target branch.

Production schema changes use committed migrations, never `drizzle-kit push` or
request-time migration logic. The initial migration creates projects,
technologies, project media, provider-neutral media assets, services,
testimonials, inquiries, site settings, audit logs, and atomic rate-limit rows.

The guarded seed is the one-time fixture import path for development. It is
idempotent, requires `--confirm-development`, refuses Vercel production,
preserves all six public project slugs and case studies, and never inserts the
placeholder testimonials. Runtime public pages do not import fixtures.

Production uses the same idempotent content mapper only through a separate,
triple-confirmed import mode. It requires the production Vercel environment, an
owner content-approval phrase, and the exact expected Neon hostname. It never
creates testimonials, inquiries, provider test assets, or administrators.

## Administrator bootstrap

There is no public registration page, and Better Auth's email signup endpoint is
disabled. After applying migrations to a confirmed non-production Neon branch,
create the first administrator with the official Better Auth CLI wrapper:

```bash
ADMIN_BOOTSTRAP_CONFIRM=development npm run auth:create-admin -- \
  --email you@example.com --name "Portfolio Admin"
```

The CLI prompts for the password so it is not placed in source control or shell
history. Development requires its existing confirmation. Production requires a
separate confirmation, Vercel production context, aligned HTTPS auth origin,
and the exact expected Neon hostname. Do not pass `--password` in a shared
terminal or script.

`/admin/login` is public; all other `/admin` routes require a database-backed,
active `admin` session. Proxy performs only a cookie-presence redirect. Protected
layouts and every private DAL operation perform authoritative session and role
checks again. Login accepts five attempts per HMAC(network signal + normalized
email) per 15-minute PostgreSQL window.

## Data boundaries

- `src/config/env.ts` is the only application runtime reader of database secrets.
- `src/server/db` owns the Neon HTTP client and Drizzle schema.
- `src/server/dal` owns parameterized public/admin reads and CMS mutations;
  public callers receive explicit DTOs that exclude draft/private fields.
- Zod validates environment, CMS inputs, URLs, structured case-study JSON, and
  JSON read back across database boundaries.
- Public projects, services, legitimate testimonials, and typed site settings
  use one-hour tagged caches. CMS actions update the relevant tags and paths.
- Signed media uploads go directly from the authenticated browser to the fixed
  `portfolio/projects` Cloudinary namespace. The server verifies provider
  signatures and metadata before recording an asset; referenced assets cannot
  be deleted.

## Contact and deployment policy

The contact Server Action validates and normalizes bounded text, ignores a
honeypot submission without revealing the decision, consumes an atomic four-per-
15-minute PostgreSQL limit, and stores only an HMAC of Vercel's trusted network
header. No raw IP or user-agent value is persisted. On Vercel,
`x-vercel-forwarded-for` is trusted because the platform supplies it; local
development intentionally shares one synthetic identity.

Database storage is authoritative and happens before email. Resend receives a
plain-text notification only, with the visitor's validated email as `replyTo`.
Provider failures mark delivery `failed` while returning a successful receipt
to the visitor. Admins may explicitly retry failed or previously unrequested
notifications.

Search indexing is fail-closed. It is enabled only when `NODE_ENV=production`,
`VERCEL_ENV=production`, and `NEXT_PUBLIC_SITE_URL` is a non-local HTTPS origin.
Preview and local builds emit `noindex` and a disallow-all robots policy. The
report-only CSP posts redacted violation summaries to `/api/csp-report`; enforce
it only after clean preview/production reports. HSTS is emitted only for an
HTTPS Vercel production deployment.

The exact launch order, environment matrix, guarded production import/bootstrap,
smoke tests, rollback, and provider recovery steps are documented in
[the production runbook](docs/PRODUCTION_RUNBOOK.md). Deployment remains a
manual gate until the Vercel project, canonical origin, and dedicated Neon
production branch are explicitly confirmed.
