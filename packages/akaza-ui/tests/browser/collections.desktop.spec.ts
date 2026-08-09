import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("component search navigates to a matching section", async ({ page }) => {
  const search = page.getByLabel("Search components", { exact: true });
  await search.fill("listbox");
  await search.press("Enter");

  await expect(page).toHaveURL(/#listbox$/);
  await expect(section(page, "listbox")).toBeInViewport();
});

test("select, listbox, and combobox support pointer and keyboard selection", async ({ page }) => {
  const select = section(page, "select").getByRole("combobox", { name: "Plan", exact: true });
  await select.click();
  const selectOptions = page.locator(".akaza-select-content").getByRole("option");
  await expect(selectOptions.first()).toBeVisible();
  await selectOptions.nth(1).click();
  await expect(select).toHaveAttribute("aria-expanded", "false");
  await select.press("ArrowDown");
  await expect(select).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(select).toHaveAttribute("aria-expanded", "false");

  const listbox = section(page, "listbox").getByRole("listbox", { name: "Framework", exact: true });
  await page.mouse.move(0, 0);
  await listbox.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(listbox.getByRole("option", { name: /Nuxt/ })).toHaveAttribute("aria-selected", "true");
  const vite = listbox.getByRole("option", { name: "Vite Frontend build tool." });
  await vite.click();
  await expect(vite).toHaveAttribute("aria-selected", "true");

  const combobox = section(page, "combobox").getByRole("combobox", { name: "Framework or skill" });
  await combobox.fill("Nu");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(combobox).toHaveValue("Nuxt");
  await combobox.click();
  await expect(page.locator(".akaza-combobox-content").first()).toBeVisible();
});

test("select autocomplete preserves page scroll when opened", async ({ page }) => {
  const autocomplete = section(page, "select").getByRole("combobox", { name: "Permission", exact: true });
  await autocomplete.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);

  await autocomplete.click();

  await expect(page.locator(".akaza-select-search-input")).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(before - 1);
});

test("virtualized listbox preserves manual pointer scrolling", async ({ page }) => {
  const listbox = section(page, "listbox").getByRole("listbox", { name: "Large result set" });
  await listbox.scrollIntoViewIfNeeded();
  await listbox.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const bottom = await listbox.evaluate((element) => element.scrollTop);
  const box = await listbox.boundingBox();
  if (!box) throw new Error("Virtualized listbox has no bounding box");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -720);
  await expect.poll(() => listbox.evaluate((element) => element.scrollTop)).toBeLessThan(bottom - 100);
  await page.waitForTimeout(200);
  expect(await listbox.evaluate((element) => element.scrollTop)).toBeLessThan(bottom - 100);
});

test("collapsible, accordion, tabs, and stepper expose keyboard state", async ({ page }) => {
  const collapsible = section(page, "collapsible").locator(".akaza-collapsible").first();
  const collapsibleTrigger = collapsible.locator(".akaza-collapsible-trigger");
  await collapsibleTrigger.click();
  await expect(collapsibleTrigger).toHaveAttribute("aria-expanded", "true");
  await collapsibleTrigger.press("Space");
  await expect(collapsibleTrigger).toHaveAttribute("aria-expanded", "false");

  const accordion = section(page, "accordion").locator(".akaza-accordion").first();
  const accordionTriggers = accordion.locator(".akaza-accordion-trigger");
  await accordionTriggers.first().click();
  await expect(accordionTriggers.first()).toHaveAttribute("aria-expanded", "true");
  await accordionTriggers.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(accordionTriggers.nth(1)).toBeFocused();
  await accordionTriggers.nth(1).press("Enter");
  await expect(accordionTriggers.nth(1)).toHaveAttribute("aria-expanded", "true");

  const tabs = section(page, "tabs").getByRole("tablist", { name: "Main navigation" });
  const tabItems = tabs.getByRole("tab");
  await tabItems.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabItems.nth(1)).toBeFocused();
  await expect(tabItems.nth(1)).toHaveAttribute("aria-selected", "true");
  await tabItems.last().click();
  await expect(tabItems.last()).toHaveAttribute("aria-selected", "true");

  const stepper = section(page, "stepper").locator(".akaza-stepper").first();
  const steps = stepper.locator(".akaza-stepper-trigger");
  await stepper.locator(".akaza-stepper-next").click();
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  await steps.nth(1).focus();
  await page.keyboard.press("ArrowRight");
  await expect(steps.nth(2)).toBeFocused();
});

test("pagination, navigation menu, menubar, and toolbar support both modalities", async ({ page }) => {
  const pagination = section(page, "pagination").locator(".akaza-pagination").first();
  const initialPage = Number(await pagination.getAttribute("data-akaza-page"));
  await pagination.locator(".akaza-pagination-next").click();
  await expect(pagination).toHaveAttribute("data-akaza-page", String(initialPage + 1));
  const followingPage = pagination.locator(`[data-akaza-page="${initialPage + 2}"]`);
  await followingPage.focus();
  await followingPage.press("Enter");
  await expect(pagination).toHaveAttribute("data-akaza-page", String(initialPage + 2));
  await expect(pagination.locator('.akaza-pagination-page[data-akaza-state="active"]')).toHaveAttribute("aria-current", "page");

  const navigation = section(page, "navigation-menu").locator(".akaza-navigation-menu");
  const navProducts = navigation.getByRole("button", { name: "Products" });
  await navProducts.click();
  await expect(navProducts).toHaveAttribute("aria-expanded", "true");
  const navDocs = navigation.getByRole("button", { name: "Docs" });
  const simultaneousPanels = await navDocs.evaluate((element) => new Promise<number>((resolve) => {
    (element as HTMLButtonElement).click();
    queueMicrotask(() => resolve(document.querySelectorAll("#navigation-menu .akaza-navigation-menu-panel").length));
  }));
  expect(simultaneousPanels).toBe(2);
  await expect(navigation.locator(".akaza-navigation-menu-viewport")).toHaveAttribute("data-akaza-activation-direction", "right");
  await expect(navigation.locator(".akaza-navigation-menu-panel").last()).toContainText("Getting started");
  await page.keyboard.press("Escape");
  await expect(navDocs).toHaveAttribute("aria-expanded", "false");
  await navProducts.focus();
  await page.keyboard.press("ArrowRight");
  await expect(navDocs).toBeFocused();

  const menubar = section(page, "menubar").getByRole("menubar", { name: "Editor menu" });
  const file = menubar.getByRole("menuitem", { name: "File", exact: true });
  await file.scrollIntoViewIfNeeded();
  await file.focus();
  const menubarScroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".akaza-menubar-content [data-akaza-highlighted]")).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(menubarScroll);
  await page.keyboard.press("Escape");
  await file.click();
  await expect(file).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await file.focus();
  await page.keyboard.press("ArrowRight");
  await expect(menubar.getByRole("menuitem", { name: "Edit" })).toBeFocused();

  const toolbar = section(page, "toolbar").getByRole("toolbar", { name: "Editor toolbar" });
  const toolbarButtons = toolbar.getByRole("button");
  await toolbarButtons.first().click();
  await toolbarButtons.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbarButtons.nth(1)).toBeFocused();
});
