import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openPlayground } from "./helpers";

async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical");
  expect(violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map(({ target, failureSummary }) => ({ target: target.join(" "), failureSummary })),
  }))).toEqual([]);
}

test("playground has no serious or critical accessibility violations", async ({ page }) => {
  await openPlayground(page);

  await expectNoSeriousViolations(page);
});

test("open collection and overlay states have no serious accessibility violations", async ({ page }) => {
  await openPlayground(page);

  await page.locator("#select").getByRole("combobox", { name: "Plan", exact: true }).click();
  await expect(page.locator(".akaza-select-content")).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.locator("#date-range-picker").getByRole("button", { name: "Choose date range" }).first().click();
  await expect(page.locator(".akaza-date-range-picker-content")).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.locator("#date-field").getByRole("button", { name: "Choose date" }).click();
  await expect(page.locator(".akaza-date-field-calendar-content")).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.locator("#menu").getByRole("button", { name: "Actions" }).click();
  await expect(page.locator(".akaza-menu-content").first()).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.locator("#dialog").getByRole("button", { name: "Open", exact: true }).first().click();
  await expect(page.getByRole("dialog").first()).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.keyboard.press("Escape");

  await page.locator("#toast").getByRole("button", { name: "Warning" }).click();
  await expect(page.locator(".akaza-toast").last()).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("non-interactive primitives expose their required semantics", async ({ page }) => {
  await openPlayground(page);

  await expect(page.locator("#separator .akaza-separator").first()).toHaveAttribute("role", "separator");
  await expect(page.locator("#progress .akaza-progress").first()).toHaveAttribute("role", "progressbar");
  await expect(page.locator("#meter .akaza-meter").first()).toHaveAttribute("role", "meter");
  await expect(page.locator("#avatar .akaza-avatar").first()).toHaveAttribute("data-akaza-status");
  await expect(page.locator("#field .akaza-field").first()).toBeVisible();
  await expect(page.locator("#fieldset fieldset.akaza-fieldset").first()).toBeVisible();
  await expect(page.locator("#form form.akaza-form").first()).toBeVisible();
  await expect(page.locator("#calendar .akaza-calendar-grid").first()).toHaveAttribute("role", "grid");
  await expect(page.locator("#date-field .akaza-date-field").first()).toHaveAttribute("role", "group");
  await expect(page.locator("#date-field .akaza-date-field-segment").first()).toHaveAttribute("role", "spinbutton");
  await expect(page.locator("#date-range-field .akaza-date-range-field").first()).toHaveAttribute("role", "group");
  await expect(page.locator("#date-range-picker .akaza-date-range-picker").first()).toHaveAttribute("data-akaza-state", "closed");
  await expect(page.locator("#month-picker .akaza-month-picker-grid").first()).toHaveAttribute("role", "grid");
  await expect(page.locator("#month-range-picker .akaza-month-range-picker-grid").first()).toHaveAttribute("role", "grid");
  await expect(page.locator("#year-picker .akaza-year-picker-grid").first()).toHaveAttribute("role", "grid");
  await expect(page.locator("#year-range-picker .akaza-year-range-picker-grid").first()).toHaveAttribute("role", "grid");
  await expect(page.locator("#time-field .akaza-time-field").first()).toHaveAttribute("role", "group");
  await expect(page.locator("#time-field .akaza-time-field-segment").first()).toHaveAttribute("role", "spinbutton");
  await expect(page.locator("#time-range-field .akaza-time-range-field").first()).toHaveAttribute("role", "group");
});
