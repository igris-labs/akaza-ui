import { expect, test } from "@playwright/test";
import { openPlayground, section, tap } from "./helpers";

test("Accordion and nested Menu preserve touch activation without overflow", async ({ page }) => {
  await openPlayground(page);
  const accordion = section(page, "accordion").getByRole("group", { name: "RTL accordion" });
  const overview = accordion.getByRole("button", { name: "Overview", exact: true });
  const details = accordion.getByRole("button", { name: "Details", exact: true });
  await tap(page, overview);
  await expect(overview).toHaveAttribute("aria-expanded", "true");
  await tap(page, details);
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(overview).toHaveAttribute("aria-expanded", "false");
  await tap(page, section(page, "menu").getByRole("button", { name: "Grouped focus commands" }));
  const wrap = page.getByRole("menuitemcheckbox", { name: "Word wrap" });
  await tap(page, wrap);
  await expect(wrap).toHaveAttribute("aria-checked", "true");
  const branch = page.getByRole("menuitem", { name: "Nested commands", exact: true });
  await tap(page, branch);
  const nested = page.getByRole("menuitem", { name: "Nested first", exact: true });
  await expect(nested).toBeVisible();
  await tap(page, nested);
  await expect(wrap).toHaveAttribute("aria-checked", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
