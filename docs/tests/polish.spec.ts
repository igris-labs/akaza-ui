import { expect, test } from "@playwright/test";

for (const path of ["/", "/components/accordion"]) {
  test(`header alignment and accordion hover boundaries on ${path}`, async ({ page }) => {
    await page.goto(path);
    const brand = page.getByRole("link", { name: "Akaza UI home" });
    const centers = await brand.evaluate((link) => {
      const center = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return rect.top + rect.height / 2;
      };
      const header = link.closest("header")!;
      return [
        center(link),
        center(link.querySelector("img:not(.hidden)")!),
        center(header.querySelector(".akaza-navigation-menu-trigger")!),
        center(header),
      ];
    });
    expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(1);
    if (path !== "/") {
      const docs = page.getByRole("link", { name: "Docs", exact: true });
      expect(
        await docs.evaluate((el) => {
          const a = el.getBoundingClientRect();
          const b = el.closest("header")!.getBoundingClientRect();
          return Math.abs(a.top + a.height / 2 - b.top - b.height / 2);
        }),
      ).toBeLessThanOrEqual(1);
    }
    const trigger = page.getByRole("button", { name: "What is Akaza UI?", exact: true });
    await trigger.hover();
    expect(
      await trigger.evaluate((button) => {
        const container = button.closest(".akaza-accordion")!.parentElement!;
        const rect = container.getBoundingClientRect();
        return document.elementFromPoint(rect.left + 1, rect.top + 1)?.closest("button") === button;
      }),
    ).toBe(false);
    await trigger.click();
    await expect(
      page.getByText("A headless Vue component library with a Vue-native slots API.", {
        exact: true,
      }),
    ).toBeVisible();
  });
}

test("docs article stays centered on the viewport with and without a table of contents", async ({
  page,
}) => {
  for (const width of [1280, 1440, 1750]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/components", "/components/accordion"]) {
      await page.goto(path);
      const geometry = await page.locator("[data-docs-article]").evaluate((article) => {
        const rect = article.getBoundingClientRect();
        return {
          offset: Math.abs(rect.left + rect.width / 2 - innerWidth / 2),
          width: rect.width,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(geometry.offset).toBeLessThanOrEqual(1);
      expect(geometry.width).toBeLessThanOrEqual(672);
      expect(geometry.overflow).toBe(false);
    }
  }
});

test("hero tabs have a contrasting indicator that follows pointer and keyboard selection", async ({
  page,
}) => {
  await page.goto("/");
  const list = page.getByRole("tablist", { name: "Component demonstration" });
  const indicator = list.locator(".akaza-tab-indicator");
  await expect
    .poll(() => indicator.evaluate((el) => el.getBoundingClientRect().width))
    .toBeGreaterThan(30);
  expect(
    await indicator.evaluate(
      (el) =>
        getComputedStyle(el).backgroundColor !==
        getComputedStyle(el.parentElement!).backgroundColor,
    ),
  ).toBe(true);
  const source = page.getByRole("tab", { name: "Slots API", exact: true });
  await source.click();
  await expect
    .poll(() =>
      indicator.evaluate((el) => {
        const tab = el
          .parentElement!.querySelector('[aria-selected="true"]')!
          .getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        return Math.abs(rect.left - tab.left) + Math.abs(rect.width - tab.width);
      }),
    )
    .toBeLessThan(1);
  await source.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Preview", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await indicator.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
});

test("landing sections have clear separation and the IPEX form preserves server validation", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const gaps = await page.locator("main > div").evaluate((container) => {
    const children = Array.from(container.children);
    return children
      .slice(1)
      .map(
        (element, index) =>
          element.getBoundingClientRect().top - children[index]!.getBoundingClientRect().bottom,
      );
  });
  expect(gaps.length).toBeGreaterThan(3);
  expect(Math.min(...gaps)).toBeGreaterThanOrEqual(96);
  await page.getByRole("textbox", { name: /^Requester/ }).fill("Casey");
  await page.getByRole("textbox", { name: /^Workspace slug/ }).fill("admin");
  await page.getByRole("combobox", { name: /^Plan/ }).click();
  await page.getByRole("option", { name: /^Business/ }).click();
  await page.getByRole("spinbutton", { name: /^Seats/ }).fill("5");
  await page.getByRole("button", { name: "Submit form", exact: true }).click();
  await expect(page.getByLabel("Form submission result")).toHaveText(
    "Server validation returned field errors.",
  );
  await page.getByRole("textbox", { name: /^Workspace slug/ }).fill("support-team");
  await page.getByRole("button", { name: "Submit form", exact: true }).click();
  await expect(page.getByLabel("Form submission result")).toContainText("support-team");
});

test("IPEX dimensions and ecosystem links follow the reference", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/components/accordion", { waitUntil: "networkidle" });
  const geometry = await page.locator("[data-docs-article]").evaluate((article) => {
    const content = article.getBoundingClientRect();
    const toc = document.querySelector('[aria-label="On this page"]')!.getBoundingClientRect();
    return { width: content.width, gap: toc.left - content.right };
  });
  expect(geometry).toEqual({ width: 672, gap: 96 });
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "IPEX", exact: true })).toHaveAttribute(
    "href",
    "https://ipex.igrislabs.com",
  );
  await expect(footer.getByRole("link", { name: "Initera", exact: true })).toHaveAttribute(
    "href",
    "https://initera.app",
  );
  await page.goto("/", { waitUntil: "networkidle" });
  expect(
    await page.locator("h1").evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
  ).toBe(48);
  await page.getByRole("button", { name: "Documentation", exact: true }).hover();
  await expect(
    page.getByRole("link", { name: /IPEX design system/ }).filter({ visible: true }),
  ).toHaveAttribute("href", "https://ipex.igrislabs.com");
  await expect(
    page.getByText("Design system foundation built on Akaza UI.").filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.locator("footer").getByRole("link", { name: "Initera", exact: true }),
  ).toHaveAttribute("href", "https://initera.app");
});

test("IPEX preview controls retain keyboard behavior and keep switch thumbs inside their tracks", async ({
  page,
}) => {
  await page.goto("/components/switch", { waitUntil: "networkidle" });
  const toggle = page.getByRole("switch", { name: "Email notifications", exact: true });
  for (const checked of [true, false]) {
    await expect(toggle).toHaveAttribute("aria-checked", String(checked));
    expect(
      await toggle.evaluate((track) => {
        const root = track.getBoundingClientRect();
        const thumb = track.querySelector(".akaza-switch-thumb")!.getBoundingClientRect();
        return thumb.left >= root.left && thumb.right <= root.right;
      }),
    ).toBe(true);
    await toggle.press("Space");
    await page.waitForTimeout(200);
  }
  await page.goto("/components/slider", { waitUntil: "networkidle" });
  const slider = page.getByRole("slider", { name: "Volume" }).first();
  const before = Number(await slider.getAttribute("aria-valuenow"));
  await slider.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", String(before + 1));
  await page.goto("/components/select", { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Plan", exact: true }).click();
  await page.getByRole("option", { name: /^Free/ }).click();
  await expect(page.getByText("Selected: free", { exact: true })).toBeVisible();
});

test("header dropdown links use compact content-sized columns", async ({ page }) => {
  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/components/accordion"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Documentation", exact: true }).click();
      const panel = page.locator('.akaza-navigation-menu-content-list[data-akaza-state="open"]');
      await expect(panel).toBeVisible();
      const rects = await panel.locator("a").evaluateAll((links) =>
        links.map((link) => {
          const rect = link.getBoundingClientRect();
          return { left: rect.left, top: rect.top, bottom: rect.bottom };
        }),
      );
      expect(rects).toHaveLength(8);
      for (const [previous, next] of [
        [0, 1],
        [2, 3],
        [4, 5],
        [5, 6],
        [6, 7],
      ]) {
        expect(Math.abs(rects[previous]!.left - rects[next]!.left)).toBeLessThan(1);
        const gap = rects[next]!.top - rects[previous]!.bottom;
        expect(gap).toBeGreaterThanOrEqual(0);
        expect(gap).toBeLessThanOrEqual(8);
      }
      expect(await panel.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(340);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    }
  }
});
