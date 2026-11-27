import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("manual Tabs inherit RTL and activate once without scrolling the page", async ({ page }) => {
  const list = section(page, "tabs").getByRole("tablist", { name: "RTL tabs" });
  const overview = list.getByRole("tab", { name: "Overview" });
  await overview.scrollIntoViewIfNeeded();
  await overview.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowLeft");
  const analytics = list.getByRole("tab", { name: "Analytics" });
  await expect(analytics).toBeFocused();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(analytics).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Space");
  await expect(analytics).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.keyboard.press("Control+Home");
  await expect(analytics).toBeFocused();
});

test("automatic Tabs retain orientation, disabled skipping, and one Tab entry", async ({ page }) => {
  const list = section(page, "tabs").getByRole("tablist", { name: "Status filter" });
  const active = list.getByRole("tab", { name: "Active", exact: true });
  await active.focus();
  await page.keyboard.press("End");
  const paused = list.getByRole("tab", { name: "Paused" });
  await expect(paused).toBeFocused();
  await expect(paused).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(active).toBeFocused();
  await expect(list.locator('[tabindex="0"]')).toHaveCount(1);
  const vertical = section(page, "tabs").getByRole("tablist", { name: "Settings sections" });
  await vertical.getByRole("tab", { name: "Profile" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(vertical.getByRole("tab", { name: "Notifications" })).toBeFocused();
});

test("RadioGroup inherits RTL and stops at enabled boundaries without a page jump", async ({ page }) => {
  const group = section(page, "radio-group").getByRole("radiogroup", { name: "RTL storage" });
  const ssd = group.getByRole("radio", { name: "SSD", exact: true });
  const hdd = group.getByRole("radio", { name: "HDD", exact: true });
  await ssd.scrollIntoViewIfNeeded();
  await ssd.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowLeft");
  await expect(hdd).toBeFocused();
  await expect(hdd).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(hdd).toBeFocused();
  await expect(group.getByRole("radio", { name: "NVMe" })).toBeDisabled();
  await page.keyboard.press("Home");
  await expect(ssd).toBeFocused();
  await expect(ssd).toHaveAttribute("aria-checked", "true");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
});

test("ToggleGroup keeps focus across keyed DOM moves and handles Space only once", async ({ page }) => {
  const demo = section(page, "toggle-group");
  const group = demo.getByRole("group", { name: "RTL alignment" });
  await group.getByRole("button", { name: "Left", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  const center = group.getByRole("button", { name: "Center", exact: true });
  await expect(center).toBeFocused();
  await expect(center).toHaveAttribute("aria-pressed", "false");
  await demo.getByRole("button", { name: "Reverse alignment options" }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(center).toBeFocused();
  await expect(group.locator('button[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("Space");
  await expect(center).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(center).toHaveAttribute("aria-pressed", "false");
  const right = group.getByRole("button", { name: "Right", exact: true });
  await right.click();
  await expect(right).toHaveAttribute("aria-pressed", "true");
});

test("roving group examples have no automated WCAG violations", async ({ page }) => {
  const result = await new AxeBuilder({ page })
    .include("#tabs")
    .include("#radio-group")
    .include("#toggle-group")
    .include("#toolbar")
    .include("#stepper")
    .include("#menubar")
    .include("#navigation-menu")
    .include("#rating")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
});

test("Rating handles fractional RTL, both arrow pairs, and native clicks without page scrolling", async ({ page }) => {
  const group = section(page, "rating").getByRole("radiogroup", { name: "RTL quality" });
  const radio = (value: number) => group.getByRole("radio", { name: `${value} of 5`, exact: true });
  await radio(2.5).scrollIntoViewIfNeeded();
  await radio(2.5).focus();
  const scroll = await page.evaluate(() => window.scrollY);
  for (const [key, value] of [["ArrowLeft", 3], ["ArrowDown", 3.5], ["ArrowUp", 3], ["ArrowRight", 2.5], ["Home", 0.5], ["ArrowRight", 0.5], ["End", 5], ["ArrowLeft", 5]] as const) {
    await page.keyboard.press(key);
    await expect(radio(value)).toBeFocused();
    await expect(radio(value)).toHaveAttribute("aria-checked", "true");
  }
  await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await radio(2.5).click();
  await expect(radio(2.5)).toHaveAttribute("aria-checked", "true");
  const vertical = section(page, "rating").getByRole("radiogroup", { name: "Vertical quality" });
  await vertical.getByRole("radio", { name: "3 of 5", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(vertical.getByRole("radio", { name: "4 of 5", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(vertical.getByRole("radio", { name: "3 of 5", exact: true })).toHaveAttribute("aria-checked", "true");
});

test("ToggleGroup required and cancelable demo retains accepted selection", async ({ page }) => {
  const group = section(page, "toggle-group").getByRole("group", { name: "Required alignment" });
  const left = group.getByRole("button", { name: "Left", exact: true });
  await left.focus();
  await page.keyboard.press("Space");
  await expect(left).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowRight");
  const center = group.getByRole("button", { name: "Center", exact: true });
  await expect(center).toBeFocused();
  await expect(left).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(center).toHaveAttribute("aria-pressed", "true");
  const right = group.getByRole("button", { name: "Right", exact: true });
  await right.click();
  await right.click();
  await expect(right).toHaveAttribute("aria-pressed", "false");
  await expect(center).toHaveAttribute("aria-pressed", "true");
  await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
});

test("Menubar RTL panel traversal preserves submenu ownership and focus return", async ({ page }) => {
  const root = section(page, "menubar").getByRole("menubar", { name: "RTL application menu" });
  const project = root.getByRole("menuitem", { name: "Project", exact: true });
  await project.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await project.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowDown");
  const open = page.getByRole("menuitem", { name: "Open project", exact: true });
  await expect(open).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const recent = page.getByRole("menuitem", { name: "Recent", exact: true });
  await expect(recent).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: "Workspace", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(recent).toBeFocused();
  await open.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: "Preferences", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(root.getByRole("menuitem", { name: "Settings", exact: true })).toBeFocused();
  await expect(root.locator('[tabindex="0"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Preferences", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root.getByRole("menuitem", { name: "Settings", exact: true })).toBeFocused();
});

test("NavigationMenu RTL movement does not select a destination and closes back to its trigger", async ({ page }) => {
  const root = section(page, "navigation-menu").getByRole("navigation", { name: "RTL navigation" });
  const overview = root.getByRole("button", { name: "Overview", exact: true });
  await overview.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await overview.focus();
  await page.keyboard.press("ArrowLeft");
  const workspace = root.getByRole("button", { name: "Workspace", exact: true });
  await expect(workspace).toBeFocused();
  await expect(overview).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("ArrowDown");
  await expect(workspace).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(workspace).toBeFocused();
  await expect(workspace).toHaveAttribute("aria-expanded", "false");
  await expect(overview).toHaveAttribute("aria-current", "page");
});

test("RadioGroup supports horizontal arrows in its vertical example", async ({ page }) => {
  const group = section(page, "radio-group").getByRole("radiogroup", { name: "Size options" });
  const medium = group.getByRole("radio", { name: "md", exact: true });
  await medium.focus();
  await page.keyboard.press("ArrowRight");
  const large = group.getByRole("radio", { name: "lg", exact: true });
  await expect(large).toBeFocused();
  await expect(large).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowUp");
  await expect(medium).toBeFocused();
  await expect(medium).toHaveAttribute("aria-checked", "true");
});

test("Toolbar crosses grouped RTL commands without hijacking native input editing", async ({ page }) => {
  const toolbar = section(page, "toolbar").getByRole("toolbar", { name: "RTL commands" });
  const cut = toolbar.getByRole("button", { name: "Cut", exact: true });
  await cut.scrollIntoViewIfNeeded();
  await cut.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowLeft");
  const redo = toolbar.getByRole("button", { name: "Redo", exact: true });
  await expect(redo).toBeFocused();
  await expect(redo).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Space");
  await expect(section(page, "toolbar").getByText("action: None, query: (empty)", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(toolbar.getByRole("button", { name: "Copy", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(toolbar.getByRole("link", { name: "Help" })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  const input = toolbar.getByRole("textbox", { name: "Command query" });
  await input.fill("search");
  await input.press("Home");
  await expect(input).toBeFocused();
  await expect(section(page, "toolbar").getByText("action: None, query: search", { exact: true })).toBeVisible();
});

test("Stepper preserves RTL manual activation, controls, and selected semantics", async ({ page }) => {
  const list = section(page, "stepper").getByRole("list", { name: "RTL steps" });
  const account = list.getByRole("button", { name: "Account", exact: true });
  await account.scrollIntoViewIfNeeded();
  await account.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("ArrowLeft");
  const workspace = list.getByRole("button", { name: "Workspace", exact: true });
  await expect(workspace).toBeFocused();
  await expect(account).toHaveAttribute("aria-current", "step");
  await expect(workspace).not.toHaveAttribute("aria-current");
  await page.keyboard.press("Space");
  await expect(workspace).toHaveAttribute("aria-current", "step");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  const root = list.locator("..");
  const next = root.getByRole("button", { name: "Next", exact: true });
  await next.click();
  await expect(list.getByRole("button", { name: "Review", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(list.locator('button[tabindex="0"]')).toHaveCount(1);
});
