import { expect, test } from "@playwright/test";

for (const path of [
  "/",
  "/getting-started",
  "/getting-started/installation",
  "/components",
  "/components/dialog",
  "/components/calendar",
  "/composables/use-toast",
  "/builders/layout-builder",
]) {
  test(`renders ${path} without hydration errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|Failed to resolve component/.test(message.text())) errors.push(message.text());
    });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    // An interactive header proves that hydration completed.
    await page
      .getByRole("button", { name: "Search documentation", exact: true })
      .filter({ visible: true })
      .click();
    await expect(page.getByRole("dialog", { name: "Search documentation" })).toBeVisible();
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
  });
}

test("landing controls, source tabs, and themes work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Workspace preferences" })).toBeVisible();
  const notifications = page.getByRole("switch", { name: "Notifications", exact: true });
  await expect(notifications).toBeChecked();
  await notifications.click();
  await expect(notifications).not.toBeChecked();
  await page.getByRole("textbox", { name: "Workspace name" }).fill("My workspace");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved in this preview." }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Slots API" }).click();
  await expect(page.getByRole("tabpanel", { name: "Slots API" }).locator("pre")).toContainText(
    "import { Switch } from 'akaza-ui'",
  );
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Workspace name" })).toHaveValue("My workspace");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("keyboard search finds a page, handles no results, and navigates", async ({ page }) => {
  await page.goto("/getting-started");
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Search documentation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search documentation" });
  await expect(search).toBeVisible();
  const input = search.getByRole("combobox");
  await input.fill("xyznoresult");
  await expect(search.getByRole("status")).toContainText("No matching");
  await input.fill("Dialog");
  await expect(search.getByRole("option").first()).toContainText("Dialog");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/components\/dialog$/);
  await expect(page.locator("h1")).toHaveText("Dialog");
});

test("package commands, code disclosure, copy actions, and dialog focus work", async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  await page.goto("/getting-started/installation");
  await page.getByRole("tab", { name: "npm", exact: true }).click();
  await expect(page.getByRole("tabpanel", { name: "npm", exact: true })).toContainText(
    "npm install akaza-ui",
  );
  await page.getByRole("button", { name: "Copy page", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Install the package",
  );
  await page.getByRole("button", { name: "More page actions" }).click();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("menuitem", { name: "View as Markdown" }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/raw\/getting-started\/installation\.md$/);
  await popup.close();
  await page.goto("/components/dialog");
  const trigger = page.getByRole("button", { name: "Edit profile", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Show code" }).first().click();
  await expect(page.getByRole("button", { name: "Hide code" }).first()).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("mobile navigation closes after a selection without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/dialog");
  await page.getByRole("button", { name: "Open documentation navigation" }).click();
  const navigation = page.getByRole("dialog");
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Accordion", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/accordion$/);
  await expect(navigation).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("unknown routes retain the error recovery page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("button", { name: "Back to documentation" }).click();
  await expect(page.locator("h1")).toHaveText("Introduction");
});

test("IPEX header navigation works on desktop and mobile", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Documentation", exact: true }).focus();
  await page.keyboard.press("Enter");
  const installation = page
    .getByRole("link", { name: /^Installation\s/ })
    .filter({ visible: true })
    .first();
  await expect(installation).toBeVisible();
  await installation.click();
  await expect(page).toHaveURL(/\/getting-started\/installation$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("link", { name: "Components", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/components$/);
  await expect(page.locator("h1")).toHaveText("All Components");
});

test("landing retains earlier content and separates API code surfaces in both themes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A Vue-native headless UI library." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Everything you need, nothing you don't" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "TypeScript First" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Complete form behavior, in one example." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add Akaza UI to your project." })).toBeVisible();
  const preview = page.locator('section[aria-labelledby="principles-title"] pre').first();
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.getByRole("button", { name: "Use dark theme" }).click();
    expect(
      await preview.evaluate((pre) => {
        const code = pre.parentElement!;
        return (
          getComputedStyle(code).backgroundColor !==
          getComputedStyle(code.parentElement!).backgroundColor
        );
      }),
    ).toBe(true);
  }
});
