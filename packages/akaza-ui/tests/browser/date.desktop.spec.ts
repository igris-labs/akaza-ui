import { expect, test } from "@playwright/test";
import { openPlayground, section } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("calendar supports pointer selection and cross-month keyboard navigation", async ({ page }) => {
  const calendar = section(page, "calendar").locator(".akaza-calendar").first();
  const selected = calendar.locator('.akaza-calendar-cell-trigger[data-akaza-selected="true"]');
  await expect(selected).toHaveAttribute("aria-label", /August 12, 2026/);

  await selected.focus();
  await selected.press("ArrowRight");
  const nextDay = calendar.locator(".akaza-calendar-cell-trigger:focus");
  await expect(nextDay).toHaveAttribute("aria-label", /August 13, 2026/);
  await nextDay.press("Enter");
  await expect(nextDay).toHaveAttribute("data-akaza-selected", "true");

  await nextDay.press("PageDown");
  await expect(calendar.locator(".akaza-calendar-heading")).toContainText("September 2026");
  await expect(calendar.locator(".akaza-calendar-cell-trigger:focus")).toHaveAttribute("aria-label", /September 13, 2026/);

  await calendar.getByRole("button", { name: "Previous page" }).click();
  await expect(calendar.locator(".akaza-calendar-heading")).toContainText("August 2026");
});

test("calendar supports contiguous range selection", async ({ page }) => {
  const calendar = section(page, "calendar").locator('.akaza-calendar[data-akaza-selection-mode="range"]');
  await calendar.getByRole("button", { name: /August 20, 2026/ }).click();
  await expect(calendar).toHaveAttribute("data-akaza-state", "selecting");
  await calendar.getByRole("button", { name: /August 24, 2026/ }).click();

  await expect(calendar.getByRole("button", { name: /August 20, 2026/ })).toHaveAttribute("data-akaza-range-start", "true");
  await expect(calendar.getByRole("button", { name: /August 22, 2026/ })).toHaveAttribute("data-akaza-in-range", "true");
  await expect(calendar.getByRole("button", { name: /August 24, 2026/ })).toHaveAttribute("data-akaza-range-end", "true");
});

test("date field supports segment editing, native validation, and FormData", async ({ page }) => {
  const dateSection = section(page, "date-field");
  const controlled = dateSection.locator(".akaza-date-field").first();
  expect((await controlled.boundingBox())?.width ?? 0).toBeGreaterThan(300);
  expect(await dateSection.locator(".akaza-date-field-segment").evaluateAll(elements =>
    elements
      .filter(element => element.scrollWidth > element.clientWidth)
      .map(element => element.getAttribute("data-akaza-segment")),
  )).toEqual([]);
  const year = controlled.locator('[data-akaza-segment="year"]');
  await year.fill("2");
  await expect(year).toHaveValue("2");
  await expect(dateSection.getByText("selected: 2026-08-12")).toBeVisible();
  await year.fill("2026");
  const month = controlled.locator('[data-akaza-segment="month"]');
  await month.focus();
  await month.press("ArrowUp");
  await expect(dateSection.getByText("selected: 2026-09-12")).toBeVisible();
  await month.press("ArrowRight");
  await expect(controlled.locator('[data-akaza-segment="day"]')).toBeFocused();

  const form = dateSection.locator("form");
  const field = form.locator(".akaza-field");
  const dateField = form.locator(".akaza-date-field");
  await form.getByRole("button", { name: "Submit date" }).click();
  await expect(dateField).toHaveAttribute("data-akaza-invalid", "true");
  await expect(field.locator(".akaza-field-error")).not.toBeEmpty();
  await expect(dateField.locator('[data-akaza-segment="month"]')).toBeFocused();

  await dateField.locator('[data-akaza-segment="month"]').fill("08");
  await dateField.locator('[data-akaza-segment="day"]').fill("12");
  await dateField.locator('[data-akaza-segment="year"]').fill("2026");
  await form.getByRole("button", { name: "Submit date" }).click();
  await expect(dateField).not.toHaveAttribute("data-akaza-invalid", "true");
  await expect(dateSection.getByText("start: 2026-08-12")).toBeVisible();
});

test("date field calendar commits selection and restores trigger focus", async ({ page }) => {
  const dateSection = section(page, "date-field");
  const trigger = dateSection.getByRole("button", { name: "Choose date" });
  await trigger.click();
  const popup = page.locator(".akaza-date-field-calendar-content");
  await expect(popup).toBeVisible();
  expect((await popup.boundingBox())?.width ?? Infinity).toBeLessThan(400);
  await expect(popup.getByRole("button", { name: /August 12, 2026/ })).toBeFocused();

  await popup.getByRole("button", { name: /August 20, 2026/ }).click();
  await expect(dateSection.getByText("selected: 2026-08-20")).toBeVisible();
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("calendar composes inside a popover", async ({ page }) => {
  const calendarSection = section(page, "calendar");
  const trigger = calendarSection.locator(".akaza-popover-root > button");
  await expect(trigger).toHaveText("Choose date");
  await trigger.click();
  const popup = page.locator(".akaza-popover-content");
  await expect(popup).toBeVisible();
  expect((await popup.boundingBox())?.width ?? Infinity).toBeLessThan(400);
  await popup.getByRole("button", { name: /August 20, 2026/ }).click();
  await expect(trigger).toHaveText("2026-08-20");
  await expect(popup).toBeHidden();
});

test("date range field validates and submits paired endpoint values", async ({ page }) => {
  const rangeSection = section(page, "date-range-field");
  const form = rangeSection.locator("form");
  const field = form.locator(".akaza-date-range-field");

  await form.getByRole("button", { name: "Submit range" }).click();
  await expect(field).toHaveAttribute("data-akaza-invalid", "true");
  await expect(form.locator(".akaza-field-error")).not.toBeEmpty();

  for (const [endpoint, values] of [
    ["start", ["08", "12", "2026"]],
    ["end", ["08", "15", "2026"]],
  ] as const) {
    const root = field.locator(`.akaza-date-range-field-${endpoint}`);
    await root.locator('[data-akaza-segment="month"]').fill(values[0]);
    await root.locator('[data-akaza-segment="day"]').fill(values[1]);
    await root.locator('[data-akaza-segment="year"]').fill(values[2]);
  }

  await form.getByRole("button", { name: "Submit range" }).click();
  await expect(field).not.toHaveAttribute("data-akaza-invalid", "true");
  expect(await form.evaluate(element =>
    Object.fromEntries(new FormData(element as HTMLFormElement).entries()),
  )).toEqual({
    "travel.start": "2026-08-12",
    "travel.end": "2026-08-15",
  });
});

test("date range picker selects with pointer and restores focus on close", async ({ page }) => {
  const pickerSection = section(page, "date-range-picker");
  const trigger = pickerSection.getByRole("button", { name: "Choose date range" }).first();
  await trigger.click();
  const popup = page.locator(".akaza-date-range-picker-content");
  await expect(popup).toBeVisible();

  await popup.getByRole("button", { name: /August 20, 2026/ }).click();
  await popup.getByRole("button", { name: /August 24, 2026/ }).click();
  await expect(pickerSection.getByText("2026-08-20 — 2026-08-24")).toBeVisible();
  await popup.getByRole("button", { name: "Done" }).click();
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("date range picker completes from keyboard and closes when configured", async ({ page }) => {
  const pickerSection = section(page, "date-range-picker");
  const trigger = pickerSection.getByRole("button", { name: "Choose date range" }).nth(1);
  await trigger.click();
  const popup = page.locator(".akaza-date-range-picker-content");
  const focusedDay = popup.locator(".akaza-calendar-cell-trigger:focus");
  await expect(focusedDay).toBeVisible();
  await focusedDay.press("Enter");
  await focusedDay.press("ArrowRight");
  await popup.locator(".akaza-calendar-cell-trigger:focus").press("Enter");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("month and year pickers support roving keyboard selection and paging", async ({ page }) => {
  const monthPicker = section(page, "month-picker").locator(".akaza-month-picker").first();
  const selectedMonth = monthPicker.locator('.akaza-month-picker-cell-trigger[data-akaza-selected="true"]');
  await expect(selectedMonth).toHaveAttribute("aria-label", "August 2026");
  await selectedMonth.focus();
  await selectedMonth.press("ArrowRight");
  await expect(monthPicker.locator(".akaza-month-picker-cell-trigger:focus")).toHaveAttribute("aria-label", "September 2026");
  await monthPicker.locator(".akaza-month-picker-cell-trigger:focus").press("Enter");
  await expect(section(page, "month-picker").getByText("selected: 2026-09-01")).toBeVisible();
  await monthPicker.getByRole("button", { name: "Next page" }).click();
  await expect(monthPicker.locator(".akaza-month-picker-heading")).toHaveText("2027");

  const yearPicker = section(page, "year-picker").locator(".akaza-year-picker").first();
  const selectedYear = yearPicker.locator('.akaza-year-picker-cell-trigger[data-akaza-selected="true"]');
  await expect(selectedYear).toHaveText("2028");
  await selectedYear.focus();
  await selectedYear.press("ArrowDown");
  await yearPicker.locator(".akaza-year-picker-cell-trigger:focus").press("Space");
  await expect(section(page, "year-picker").getByText("selected: 2031")).toBeVisible();
  await yearPicker.getByRole("button", { name: "Previous page" }).click();
  await expect(yearPicker.locator(".akaza-year-picker-heading")).toContainText("2014");
});

test("month and year range pickers commit pointer ranges", async ({ page }) => {
  const monthRange = section(page, "month-range-picker").locator(".akaza-month-range-picker").first();
  await monthRange.getByRole("gridcell", { name: "August 2026" }).click();
  await expect(monthRange).toHaveAttribute("data-akaza-state", "selecting");
  await monthRange.getByRole("gridcell", { name: "October 2026" }).click();
  await expect(monthRange.getByRole("gridcell", { name: "August 2026" })).toHaveAttribute("data-akaza-range-start", "true");
  await expect(monthRange.getByRole("gridcell", { name: "September 2026" })).toHaveAttribute("data-akaza-in-range", "true");
  await expect(monthRange.getByRole("gridcell", { name: "October 2026" })).toHaveAttribute("data-akaza-range-end", "true");

  const yearRange = section(page, "year-range-picker").locator(".akaza-year-range-picker").first();
  const availableYears = yearRange.locator('[role="gridcell"]:not([aria-disabled="true"])');
  const start = availableYears.nth(1);
  const end = availableYears.nth(3);
  await start.click();
  await expect(yearRange).toHaveAttribute("data-akaza-state", "selecting");
  await end.click();
  await expect(start).toHaveAttribute("data-akaza-range-start", "true");
  await expect(end).toHaveAttribute("data-akaza-range-end", "true");
});

test("time field supports keyboard editing, validation, and native FormData", async ({ page }) => {
  const timeSection = section(page, "time-field");
  const field = timeSection.locator(".akaza-time-field").nth(1);
  const hour = field.locator('[data-akaza-segment="hour"]');
  await hour.focus();
  await hour.press("ArrowUp");
  await expect(timeSection.getByText("24-hour: 10:30:00")).toBeVisible();
  await hour.press("ArrowRight");
  await expect(field.locator('[data-akaza-segment="minute"]')).toBeFocused();

  const form = timeSection.locator("form");
  const requiredField = form.locator(".akaza-time-field");
  await form.getByRole("button", { name: "Submit time" }).click();
  await expect(requiredField).toHaveAttribute("data-akaza-invalid", "true");
  await expect(form.locator(".akaza-field-error")).not.toBeEmpty();

  await requiredField.locator('[data-akaza-segment="hour"]').fill("09");
  await requiredField.locator('[data-akaza-segment="minute"]').fill("30");
  await form.getByRole("button", { name: "Submit time" }).click();
  await expect(requiredField).not.toHaveAttribute("data-akaza-invalid", "true");
  await expect(timeSection.getByText("meeting: 09:30:00")).toBeVisible();
});

test("time range field rejects reversed values and submits endpoint values", async ({ page }) => {
  const rangeSection = section(page, "time-range-field");
  const form = rangeSection.locator("form");
  const range = form.locator(".akaza-time-range-field");
  await form.getByRole("button", { name: "Submit range" }).click();
  await expect(range).toHaveAttribute("data-akaza-invalid", "true");

  const start = range.locator(".akaza-time-range-field-start");
  const end = range.locator(".akaza-time-range-field-end");
  await start.locator('[data-akaza-segment="hour"]').fill("17");
  await start.locator('[data-akaza-segment="minute"]').fill("00");
  await end.locator('[data-akaza-segment="hour"]').fill("09");
  await end.locator('[data-akaza-segment="minute"]').fill("00");
  await expect(range).toHaveAttribute("data-akaza-invalid", "true");

  await end.locator('[data-akaza-segment="hour"]').fill("18");
  await form.getByRole("button", { name: "Submit range" }).click();
  await expect(range).not.toHaveAttribute("data-akaza-invalid", "true");
  await expect(rangeSection.getByText("17:00:00 - 18:00:00")).toBeVisible();
  expect(await form.evaluate(element =>
    Object.fromEntries(new FormData(element as HTMLFormElement).entries()),
  )).toEqual({
    "window.start": "17:00:00",
    "window.end": "18:00:00",
  });
});
