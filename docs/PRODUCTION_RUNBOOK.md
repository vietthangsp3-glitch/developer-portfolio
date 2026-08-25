# Production runbook

This runbook is the launch gate for the portfolio. Never run a mutation until
the Vercel project, canonical origin, and dedicated Neon production branch have
been identified by name in the operator's change record. Commands contain
placeholders deliberately; replace them with provider values rather than
guessing.

## Environment separation

| Concern               | Development                 | Preview                     | Production                            |
| --------------------- | --------------------------- | --------------------------- | ------------------------------------- |
| Neon                  | Developer branch            | Dedicated preview branch    | Dedicated production branch           |
| Canonical/auth origin | `http://localhost:3000`     | Stable HTTPS preview origin | Final HTTPS public origin             |
| Cloudinary            | Test-capable account/folder | Scoped preview credentials  | Production-approved credentials       |
| Resend                | Disabled or test sender     | Optional verified sender    | Optional; verified sender recommended |
| Indexing              | Disallowed                  | Disallowed                  | Valid production configuration only   |
| Admin                 | Development account         | Preview-only account        | Separate production account           |

Never copy a database URL, auth secret, HMAC secret, or administrator password
between environments. Scope Vercel values explicitly to Preview or Production.
A stable preview origin is required for authenticated preview QA; do not point
preview auth at the production origin.

## Required production values

Set these in the Vercel Production environment only:

- `NEXT_PUBLIC_SITE_URL`: exact public HTTPS origin, with no path.
- `DATABASE_URL`: pooled URL for the dedicated Neon production branch.
- `DATABASE_URL_UNPOOLED`: direct URL for that same branch.
- `BETTER_AUTH_URL`: exactly the same origin as `NEXT_PUBLIC_SITE_URL`.
- `BETTER_AUTH_SECRET`: new high-entropy production-only value.
- `RATE_LIMIT_HMAC_SECRET`: a different production-only value.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET`: one production-approved credential set.
- Optional: `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_EMAIL`, and
  `INQUIRY_FROM_EMAIL`. Configure all three together with a verified sender and
  private owner recipient, or leave all three unset. Database-backed inquiry
  capture remains active without email.

`VERCEL_ENV` is supplied by Vercel and must not be copied into committed env
files. No secret belongs in a `NEXT_PUBLIC_` variable.

## First launch sequence

1. Link this repository to the intended Vercel project. Record the project name,
   team, and production branch. Do not fabricate `.vercel/project.json`.
2. Create dedicated Neon Preview and Production branches. Record a restore point
   or create a temporary backup branch before the first migration.
3. Configure Preview values and verify the preview remains `noindex`. Resolve
   CSP reports there; keep CSP report-only until a real production observation
   window is clean.
4. Configure all required Production values and either all three Resend values
   or none. Pull them into an ignored temporary local
   environment only when an operator must run migrations. Never paste values
   into documentation or logs.
5. Run `VERCEL_ENV=production npm run production:check`. Confirm the displayed
   origin and Neon hostname/database match the change record. No credential is
   printed.
6. Run `npm run db:check`, review all committed SQL under `drizzle/`, then run
   `npm run db:migrate` once against the confirmed production branch. Never use
   schema push.
7. After the owner approves the existing six projects as launch content, run the
   idempotent import against that same target:

   ```bash
   VERCEL_ENV=production \
   PRODUCTION_CONTENT_APPROVED=six-portfolio-projects \
   CONTENT_IMPORT_EXPECTED_DATABASE_HOST=<exact-direct-neon-host> \
   npm run db:seed -- --confirm-production-import
   ```

   This preserves slugs and imports projects, local media metadata, services,
   and site settings. It never creates testimonials, inquiries, or users.

8. Bootstrap one production administrator with a unique password entered at the
   prompt, never as a command argument:

   ```bash
   VERCEL_ENV=production \
   ADMIN_BOOTSTRAP_CONFIRM=production \
   ADMIN_BOOTSTRAP_EXPECTED_DATABASE_HOST=<exact-direct-neon-host> \
   npm run auth:create-admin -- --email <owner-email> --name "Portfolio Admin"
   ```

9. Deploy only after the user explicitly confirms the Vercel project and the
   production target. For a custom domain, use only DNS records Vercel provides,
   verify the domain, then update both public/auth origins and rebuild.

## Post-deploy smoke test

On the real URL verify the homepage, Work and every published project, About,
Services, Contact, admin login/dashboard/CMS/media/inquiries, logout,
`robots.txt`, `sitemap.xml`, canonical metadata, Open Graph images, browser
console, and failed network requests. Submit one controlled inquiry and confirm
the database row exists. If Resend is enabled, confirm delivery is marked sent;
otherwise confirm `not_requested`. Upload one small
allowlisted image, confirm it renders through `next/image`, then delete the
unreferenced QA asset and confirm Cloudinary and PostgreSQL are clean.

Run Lighthouse on the real indexable origin. Launch targets are Performance
90+, Accessibility 95+, Best Practices 95+, and SEO 95+. Confirm production
cookies are Secure, HTTP-only, host-only, SameSite Lax, and expire within eight
hours. Collect CSP reports after deployment, fix legitimate violations, and
review a clean observation window before changing report-only to enforced. Do
not relax the policy with broad wildcards.

## Recovery

- Database unavailable: verify Neon status and target branch; do not re-run a
  migration blindly.
- Failed migration: stop deployment, preserve redacted logs, then restore from
  the pre-migration branch/restore point or ship a reviewed forward fix.
- Resend unavailable: inquiries remain authoritative in PostgreSQL; retry failed
  or unrequested delivery from admin after recovery.
- Cloudinary unavailable: existing delivery remains usable; postpone mutations
  and reconcile only verified unreferenced assets after recovery.
- Lost admin access: inspect the production user through a secure database
  channel, then use guarded bootstrap only if no active admin can recover access.
  Never enable public signup.
- Bad application release: use Vercel deployment rollback for code. Do not roll
  database state backward without a reviewed migration recovery plan.

## Final content and hygiene check

Verify only intended projects/services/settings are public, testimonial rows are
genuine and non-demo, and no development inquiry, QA media, or development admin
exists in production. Confirm `.env.local`, Playwright artifacts, screenshots,
and generated source assets are ignored and all Drizzle migrations are
committed.
