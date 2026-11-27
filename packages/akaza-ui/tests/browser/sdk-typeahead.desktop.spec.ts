import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openPlayground(page);
});

test("menu typeahead cycles enabled labels without selecting or scrolling the page", async ({ page }) => {
  const demo = section(page, "menu");
  const trigger = demo.getByRole("button", { name: "Typeahead commands", exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.mouse.move(0, 0);
  const menu = page.getByRole("menu").filter({ has: page.getByRole("menuitem", { name: "Éditer", exact: true }) });
  await expect(menu.getByRole("menuitem", { name: "Éditer", exact: true })).toBeFocused();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("e");
  await expect(menu.getByRole("menuitem", { name: "Example", exact: true })).toBeFocused();
  await page.keyboard.press("e");
  await expect(menu.getByRole("menuitem", { name: "Éditer", exact: true })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(demo.getByText("command: None", { exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(demo.getByText("command: Éditer", { exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("menubar typeahead does not activate a command until the query expires", async ({ page }) => {
  const demo = section(page, "menubar");
  const menubar = demo.getByRole("menubar", { name: "Typeahead menubar" });
  await menubar.getByRole("menuitem", { name: "Éditer", exact: true }).focus();
  await page.keyboard.press("e");
  await expect(menubar.getByRole("menuitem", { name: "Example", exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(demo.getByText("command: None", { exact: true })).toBeVisible();
  await page.waitForTimeout(550);
  await page.keyboard.press("Space");
  await expect(demo.getByText("command: Example", { exact: true })).toBeVisible();
});

test("navigation typeahead preserves selected state until activation", async ({ page }) => {
  const demo = section(page, "navigation-menu");
  const navigation = demo.getByRole("navigation", { name: "Typeahead navigation" });
  await navigation.getByRole("button", { name: "Éditer", exact: true }).focus();
  await page.keyboard.press("e");
  const example = navigation.getByRole("button", { name: "Example", exact: true });
  await expect(example).toBeFocused();
  await expect(example).toHaveAttribute("data-akaza-state", "inactive");
  await page.keyboard.press("Enter");
  await expect(example).toHaveAttribute("data-akaza-state", "active");
});

test("select preserves its first typed highlight and Space inside a query", async ({ page }) => {
  const demo = section(page, "select");
  const trigger = demo.getByRole("combobox", { name: "Typeahead select" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("n");
  const option = demo.getByRole("option", { name: "New file", exact: true });
  await expect(option).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-activedescendant", await option.getAttribute("id") as string);
  for (const key of ["e", "w", "Space", "f", "o"]) await page.keyboard.press(key);
  const folder = demo.getByRole("option", { name: "New folder", exact: true });
  await expect(trigger).toHaveAttribute("aria-activedescendant", await folder.getAttribute("id") as string);
  await expect(folder).toHaveAttribute("aria-selected", "false");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("New folder");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("listbox typeahead keeps selection separate from highlight", async ({ page }) => {
  const listbox = section(page, "listbox").getByRole("listbox", { name: "Typeahead listbox" });
  await listbox.scrollIntoViewIfNeeded();
  await listbox.focus();
  await page.keyboard.press("e");
  const example = listbox.getByRole("option", { name: "Example", exact: true });
  await expect(listbox).toHaveAttribute("aria-activedescendant", await example.getAttribute("id") as string);
  await expect(example).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Enter");
  await expect(example).toHaveAttribute("aria-selected", "true");
});

test("tree typeahead skips disabled nodes and leaves selection unchanged", async ({ page }) => {
  const tree = section(page, "tree").getByRole("tree", { name: "Typeahead tree" });
  const edit = tree.getByRole("treeitem", { name: "Éditer", exact: true });
  await edit.scrollIntoViewIfNeeded();
  await edit.focus();
  await page.keyboard.press("e");
  const example = tree.getByRole("treeitem", { name: "Example", exact: true });
  await expect(example).toBeFocused();
  await expect(example).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Enter");
  await expect(example).toHaveAttribute("aria-selected", "true");
});

test("new typeahead examples fit narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const examples = [
    page.getByRole("menubar", { name: "Typeahead menubar" }),
    page.getByRole("navigation", { name: "Typeahead navigation" }),
    page.getByRole("listbox", { name: "Typeahead listbox" }),
    page.getByRole("tree", { name: "Typeahead tree" }),
  ];
  for (const example of examples) {
    await example.scrollIntoViewIfNeeded();
    const dimensions = await example.evaluate(element => ({ width: element.clientWidth, content: element.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.width + 1);
  }
});
