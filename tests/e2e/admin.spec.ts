import { expect, test } from "@playwright/test";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const cloudinaryQaAvailable = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

test("unauthenticated admin requests redirect to a safe login destination", async ({
  page,
  request,
}) => {
  await page.goto("/admin/projects?draft=1");

  await expect(page).toHaveURL(
    /\/admin\/login\?returnTo=%2Fadmin%2Fprojects%3Fdraft%3D1$/,
  );
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  const mediaSign = await request.post("/api/media/sign");
  expect(mediaSign.status()).toBe(403);

  await page.context().addCookies([
    {
      name: "portfolio-admin.session_token",
      value: "expired-or-invalid-session",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin login is accessible and overflow-free at required widths", async ({
  page,
}) => {
  for (const viewport of [375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/admin/login");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBe(widths.client);
  }
});

test("invalid login stays generic and public signup is unavailable", async ({
  page,
  request,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(`missing-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("not-a-valid-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Invalid email or password.")).toBeVisible();

  const signup = await request.post("/api/auth/sign-up/email", {
    data: {
      email: `signup-${Date.now()}@example.com`,
      name: "Unauthorized signup",
      password: "not-a-valid-admin-password",
    },
  });
  expect(signup.ok()).toBe(false);
});

test("authenticated admin navigation and logout invalidate access", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  for (const width of [375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBe(widths.client);
  }

  await page
    .getByRole("button", { name: "Logout" })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("contact inquiry is stored and moves through the admin workflow", async ({
  page,
}) => {
  const email = `phase-8-inquiry-${Date.now()}@example.com`;
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Honeypot QA");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Project type").selectOption("Web application");
    await page
      .getByLabel("Project details")
      .fill("This valid-looking payload must be ignored by the honeypot.");
    await page.locator('input[name="website"]').evaluate((input) => {
      (input as HTMLInputElement).value = "https://spam.example";
    });
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("status")).toContainText(
      "your inquiry has been received",
    );
    const honeypotRows = await sql.query(
      "select count(*)::int as count from inquiries where email = $1",
      [email],
    );
    expect(honeypotRows[0]?.count).toBe(0);

    await page.goto("/contact");
    await page.getByLabel("Name").fill("Phase 8 QA");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Company").fill("QA Studio");
    await page.getByLabel("Project type").selectOption("Web application");
    await page.getByLabel("Indicative budget").selectOption("$10,000–$25,000");
    await page
      .getByLabel("Project details")
      .fill("A temporary inquiry that verifies the complete private workflow.");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("status")).toContainText(
      "your inquiry has been received",
    );

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail!);
    await page.getByLabel("Password").fill(adminPassword!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/inquiries?status=received");
    const inquiry = page.locator("article").filter({ hasText: email });
    await expect(inquiry).toContainText("Email not requested");
    await inquiry.getByRole("link", { name: "Review" }).click();
    await expect(
      page.getByRole("heading", { name: "Phase 8 QA" }),
    ).toBeVisible();
    await expect(
      page.getByText("A temporary inquiry that verifies"),
    ).toBeVisible();

    await page.getByLabel("Workflow status").selectOption("contacted");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Inquiry status updated.")).toBeVisible();
    await page.goto("/admin/inquiries?status=contacted");
    await expect(
      page.locator("article").filter({ hasText: email }),
    ).toHaveCount(1);

    await page
      .locator("article")
      .filter({ hasText: email })
      .getByRole("link", { name: "Review" })
      .click();
    await page.getByLabel("Workflow status").selectOption("received");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Inquiry status updated.")).toBeVisible();
  } finally {
    await sql`delete from inquiries where email = ${email}`;
  }
});

test("admin can create, publish, update, archive, and delete a project", async ({
  page,
}) => {
  const slug = `phase-7-qa-${Date.now()}`;
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  for (const width of [375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/admin/projects",
      "/admin/projects/new",
      "/admin/media",
      "/admin/inquiries",
      "/admin/settings",
    ]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scroll,
        `${route} should not overflow at ${width}px`,
      ).toBe(dimensions.client);
    }
  }

  await page.goto("/admin/projects/new");
  await page.getByLabel("Title", { exact: true }).fill("Phase 7 QA Project");
  await page.getByLabel("Slug").fill(slug);
  await page
    .getByLabel("Summary")
    .fill("A temporary project used to verify the CMS publication workflow.");
  await page.getByLabel("Category").fill("Quality assurance");
  await page.getByLabel("Role / services").fill("Design / Development");
  await page.getByLabel("Technologies").fill("Next.js, TypeScript");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]+\?created=1$/);

  await page.goto(`/work/${slug}`);
  await expect(
    page.getByRole("heading", {
      name: "This page is not part of the index.",
    }),
  ).toBeVisible();
  await page.goBack();

  await page.getByLabel("Thumbnail").selectOption({ index: 1 });
  await page.getByLabel("Hero image").selectOption({ index: 1 });
  await page.getByLabel("Status").selectOption("published");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.getByText("Project saved.")).toBeVisible();
  await page.goto(`/work/${slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Phase 7 QA Project" }),
  ).toBeVisible();

  await page.goto("/admin/projects");
  await page
    .locator("article")
    .filter({ hasText: slug })
    .getByRole("link", { name: "Edit" })
    .click();
  await page
    .getByLabel("Summary")
    .fill("The public update is visible after targeted cache invalidation.");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.getByText("Project saved.")).toBeVisible();
  await page.goto(`/work/${slug}`);
  await expect(
    page.getByText(
      "The public update is visible after targeted cache invalidation.",
    ),
  ).toBeVisible();

  await page.goto("/admin/projects");
  await page
    .locator("article")
    .filter({ hasText: slug })
    .getByRole("link", { name: "Edit" })
    .click();
  await page.getByLabel("Status").selectOption("archived");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.getByText("Project saved.")).toBeVisible();
  await page.reload();
  await page.getByText("Delete project").click();
  await page.getByLabel("I understand this cannot be undone.").check();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\?deleted=1$/);
  await page.goto(`/work/${slug}`);
  await expect(
    page.getByRole("heading", {
      name: "This page is not part of the index.",
    }),
  ).toBeVisible();
});

test("admin can upload and safely delete an unused Cloudinary image", async ({
  page,
}) => {
  test.skip(
    !cloudinaryQaAvailable,
    "Set E2E admin and Cloudinary credentials for live media QA.",
  );
  const altText = `Phase 7 Cloudinary QA ${Date.now()}`;
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/media");

  const signingResponse = await page.evaluate(async () => {
    const response = await fetch("/api/media/sign", { method: "POST" });
    return { ok: response.ok, body: await response.json() };
  });
  expect(signingResponse.ok).toBe(true);
  const authorization = signingResponse.body as {
    cloudName: string;
    apiKey: string;
    folder: string;
    public_id: string;
    timestamp: number;
    signature: string;
  };
  await page.route("**/api/media/sign", async (route) => {
    await route.fulfill({ json: authorization });
  });

  // Managed Chromium cannot open direct internet sockets and route.fetch()
  // drops multipart file streams. Reconstruct only this signed provider request
  // through Playwright's network-enabled request context.
  await page.route("https://api.cloudinary.com/**", async (route) => {
    const response = await page.context().request.post(route.request().url(), {
      multipart: {
        file: {
          name: "northline-build.webp",
          mimeType: "image/webp",
          buffer: readFileSync("public/images/projects/northline-build.webp"),
        },
        api_key: authorization.apiKey,
        timestamp: String(authorization.timestamp),
        signature: authorization.signature,
        folder: authorization.folder,
        public_id: authorization.public_id,
      },
    });
    if (!response.ok()) {
      throw new Error(`Cloudinary upload failed with ${response.status()}.`);
    }
    await route.fulfill({ response });
  });

  const uploadForm = page
    .getByRole("heading", { name: "Upload image" })
    .locator("xpath=ancestor::form");
  await uploadForm
    .getByLabel("Image")
    .setInputFiles("public/images/projects/northline-build.webp");
  await uploadForm.getByLabel("Alt text").fill(altText);
  await uploadForm.getByRole("button", { name: "Upload" }).click();
  await expect(uploadForm.getByText("Image uploaded.")).toBeVisible({
    timeout: 30_000,
  });

  const mediaItem = page.locator("article").filter({
    has: page.locator(`input[name="altText"][value="${altText}"]`),
  });
  await expect(mediaItem).toHaveCount(1);
  await expect(mediaItem.getByText(/cloudinary/i)).toBeVisible();
  const uploadedImage = mediaItem.locator("img");
  await expect(uploadedImage).toBeVisible();
  await expect
    .poll(() =>
      uploadedImage.evaluate(
        (image) => (image as HTMLImageElement).naturalWidth,
      ),
    )
    .toBeGreaterThan(0);
  await mediaItem.getByText("Delete media").click();
  await mediaItem.getByLabel("I understand this cannot be undone.").check();
  await mediaItem.getByRole("button", { name: "Delete permanently" }).click();
  await expect(mediaItem).toHaveCount(0, { timeout: 30_000 });
  await page.goto("/admin/media");
  await expect(page.getByRole("heading", { name: "Media" })).toBeVisible();
});
