import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/projects",
  "/projects/northline-build",
  "/projects/field-notes-supply",
  "/projects/atlas-weekends",
  "/projects/studio-ledger",
  "/projects/relay-operations",
  "/projects/kinetic-type-lab",
];

const legacyRedirects = [
  ["/work", "/projects"],
  ["/work/northline-build", "/projects/northline-build"],
  ["/about", "/#about"],
  ["/services", "/#services"],
  ["/contact", "/#contact"],
] as const;

const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
];

test("all public routes render one clear page heading", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);

    expect(response?.ok(), `${route} should return successfully`).toBe(true);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("public navigation exposes the one-page anchors and project index only", async ({
  page,
}) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await expect(navigation.getByRole("link")).toHaveCount(4);
  await expect(navigation.getByRole("link").allTextContents()).resolves.toEqual(
    ["ABOUT", "PROJECTS", "SERVICES", "CONTACT"],
  );

  await expect(navigation.getByRole("link", { name: "ABOUT" })).toHaveAttribute(
    "href",
    "/#about",
  );
  await expect(
    navigation.getByRole("link", { name: "PROJECTS" }),
  ).toHaveAttribute("href", "/projects");
  await expect(
    navigation.getByRole("link", { name: "SERVICES" }),
  ).toHaveAttribute("href", "/#services");
  await expect(
    navigation.getByRole("link", { name: "CONTACT" }),
  ).toHaveAttribute("href", "/#contact");

  for (const id of ["about", "services", "contact"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await page.goto("/projects/northline-build");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "ABOUT" })
    .click();
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator("#about")).toBeVisible();
});

test("legacy public routes permanently redirect to canonical destinations", async ({
  request,
}) => {
  for (const [source, destination] of legacyRedirects) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), `${source} should be permanent`).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
});

test("homepage remains overflow-free across supported widths", async ({
  page,
}) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("homepage limits featured projects while the project index renders all published work", async ({
  page,
}) => {
  await page.goto("/");
  const selectedCards = page.locator("#selected-projects .project-cell");
  const selectedCount = await selectedCards.count();
  expect(selectedCount).toBeGreaterThan(0);
  expect(selectedCount).toBeLessThanOrEqual(6);
  await expect(
    page.getByRole("link", { name: "View all projects" }),
  ).toHaveAttribute("href", "/projects");

  await page.goto("/projects");
  const allCards = page.locator(".project-cell");
  expect(await allCards.count()).toBeGreaterThanOrEqual(selectedCount);
  await expect(allCards.first().getByRole("link")).toHaveAttribute(
    "href",
    /\/projects\/[a-z0-9-]+/,
  );
});

test("public testimonial reads exclude pre-launch demo proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Sample client 01")).toHaveCount(0);
  await expect(
    page.getByText(/Client references are shared privately/),
  ).toBeVisible();
});

test("public background remains fixed and continuous behind transparent sections", async ({
  page,
}) => {
  await page.goto("/");

  const background = page.locator("[data-site-background]");
  await expect(background).toHaveCount(1);
  await expect(background).toHaveAttribute("aria-hidden", "true");

  const initial = await background.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      pointerEvents: styles.pointerEvents,
      position: styles.position,
      top: element.getBoundingClientRect().top,
      zIndex: styles.zIndex,
    };
  });

  expect(initial).toEqual({
    pointerEvents: "none",
    position: "fixed",
    top: 0,
    zIndex: "0",
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(
    await background.evaluate((element) => element.getBoundingClientRect().top),
  ).toBe(0);

  for (const route of routes) {
    await page.goto(route);

    const opaqueWrappers = await page
      .locator(".site-foreground > header, main > header, main section, footer")
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              window.getComputedStyle(element).backgroundColor !==
              "rgba(0, 0, 0, 0)",
          )
          .map((element) => element.outerHTML.slice(0, 120)),
      );

    expect(
      opaqueWrappers,
      `${route} should keep public wrappers transparent`,
    ).toEqual([]);
  }

  await page.goto("/");
  await expect(page.locator(".project-cell").first()).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );

  await page.goto("/#contact");
  await expect(page.getByLabel("Name")).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
});

test("homepage motion settles without runtime errors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/");

  const heroLine = page.locator("[data-hero-line]").first();
  await expect
    .poll(
      () =>
        heroLine.evaluate((element) => {
          const styles = window.getComputedStyle(element);
          const matrix = new DOMMatrixReadOnly(styles.transform);

          return styles.opacity === "1" && Math.abs(matrix.m42) < 0.5;
        }),
      { timeout: 5_000 },
    )
    .toBe(true);

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Send enquiry" }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("route navigation resets scroll without breaking intentional anchors", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("lenis")),
    )
    .toBe(true);

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const scrollToPageEnd = async () => {
    await page.mouse.wheel(0, 100_000);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Math.abs(
              window.scrollY -
                (document.documentElement.scrollHeight - window.innerHeight),
            ) < 1,
        ),
      )
      .toBe(true);
  };

  for (let repetition = 0; repetition < 5; repetition += 1) {
    await scrollToPageEnd();
    await primaryNavigation.getByRole("link", { name: "PROJECTS" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await scrollToPageEnd();
    await page.locator(".site-foreground > header a[href='/']").click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }

  await scrollToPageEnd();
  await primaryNavigation.getByRole("link", { name: "CONTACT" }).click();
  await expect(page).toHaveURL(/\/#contact$/);

  const contact = page.locator("#contact");
  const contactReveal = contact.locator("..");
  const header = page.locator(".site-foreground > header");
  await expect
    .poll(async () => {
      const contactTop = await contact.evaluate(
        (element) => element.getBoundingClientRect().top,
      );
      const headerHeight = await header.evaluate(
        (element) => element.getBoundingClientRect().height,
      );
      return contactTop >= headerHeight;
    })
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Send enquiry" }),
  ).toBeVisible();
  await expect(contactReveal).toHaveCSS("opacity", "1");
  await expect(contactReveal).toHaveCSS("visibility", "visible");

  await primaryNavigation.getByRole("link", { name: "PROJECTS" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(
    page.getByRole("button", { name: "Send enquiry" }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/projects$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(runtimeErrors).toEqual([]);
});

test("selected work hover and focus reveal imagery without shifting cells", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const cell = page.locator(".project-cell").first();
  const image = cell.locator(".project-cell-image");
  const link = cell.getByRole("link");
  await cell.scrollIntoViewIfNeeded();

  const initial = await image.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      blur: Number(styles.filter.match(/blur\(([^p]+)px\)/)?.[1]),
      cellWidth: element.closest("article")?.getBoundingClientRect().width,
      opacity: Number(styles.opacity),
      scale: new DOMMatrixReadOnly(styles.transform).a,
    };
  });

  await cell.hover();
  await expect
    .poll(() =>
      image.evaluate((element) =>
        Number(window.getComputedStyle(element).opacity),
      ),
    )
    .toBeGreaterThan(initial.opacity);

  const hovered = await image.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      blur: Number(styles.filter.match(/blur\(([^p]+)px\)/)?.[1]),
      cellWidth: element.closest("article")?.getBoundingClientRect().width,
      scale: new DOMMatrixReadOnly(styles.transform).a,
    };
  });
  expect(hovered.blur).toBeLessThan(initial.blur);
  expect(hovered.scale).toBeGreaterThan(initial.scale);
  expect(hovered.cellWidth).toBe(initial.cellWidth);

  await page.mouse.move(0, 0);
  await link.focus();
  await expect
    .poll(() =>
      image.evaluate((element) =>
        Number(window.getComputedStyle(element).opacity),
      ),
    )
    .toBeGreaterThan(initial.opacity);
});

test("reduced motion exposes complete, navigable homepage content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Thang Nguyen",
    }),
  ).toBeVisible();

  const projectLinks = page
    .locator('[aria-labelledby="selected-projects-title"]')
    .getByRole("link");
  await expect(projectLinks).toHaveCount(5);
  await expect(projectLinks.nth(0)).toHaveAttribute(
    "href",
    "/projects/northline-build",
  );
  for (let step = 0; step < 12; step += 1) {
    if (
      await projectLinks
        .nth(0)
        .evaluate((element) => element === document.activeElement)
    ) {
      break;
    }
    await page.keyboard.press("Tab");
  }
  await expect(projectLinks.nth(0)).toBeFocused();

  const animatedElements = page.locator(
    "[data-hero-line], [data-project-media], [data-project-meta]",
  );
  const hiddenElements = await animatedElements.evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const styles = window.getComputedStyle(element);
        return styles.opacity === "0" || styles.visibility === "hidden";
      }).length,
  );

  expect(hiddenElements).toBe(0);
  await expect(
    page.getByRole("link", { name: "View all projects" }),
  ).toHaveAttribute("href", "/projects");
});

test("keyboard and mobile navigation preserve focus and route context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/northline-build");

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();

  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.click();
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "PROJECTS" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(menuButton).toBeFocused();
});

test("contact form is labelled, responsive, and reports validation", async ({
  page,
}) => {
  for (const width of [375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#contact");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(page.getByLabel("Project type")).toBeVisible();
    await expect(page.getByLabel("Indicative budget")).toBeVisible();
    await expect(page.getByLabel("Project details")).toBeVisible();
    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBe(widths.client);
  }

  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator("#form-status")).toContainText(
    "Review the highlighted fields",
  );
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
});

test("public not-found and metadata endpoints fail safely", async ({
  page,
  request,
}) => {
  await page.goto("/route-that-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "This page is not part of the index." }),
  ).toBeVisible();

  await page.goto("/projects/not-a-published-project");
  await expect(
    page.getByRole("heading", { name: "This page is not part of the index." }),
  ).toBeVisible();

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Disallow: /");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const expectedProjectsUrl = new URL(
    "/projects",
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ).toString();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain(expectedProjectsUrl);
  expect(sitemapText).not.toContain("/work");
  expect(sitemapText).not.toContain("/about");
  expect(sitemapText).not.toContain("/services");
  expect(sitemapText).not.toContain("/contact");
});

test("security headers are present without prematurely enforcing CSP", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toBeUndefined();
  expect(response.headers()["content-security-policy-report-only"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
