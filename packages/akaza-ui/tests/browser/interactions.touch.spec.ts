import { expect, test } from "@playwright/test";
import { dragTouch, longPress, openPlayground, section, tap } from "./helpers";

test.beforeEach(async ({ page }) => openPlayground(page));

test("tap activates native and composite controls", async ({ page }) => {
  const toggle = section(page, "toggle").getByRole("button", { name: "Bold", exact: true });
  await tap(page, toggle);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  const switchControl = section(page, "switch").getByRole("switch", { name: "Toggle feature" });
  await tap(page, switchControl);
  await expect(switchControl).toHaveAttribute("aria-checked", "true");

  const checkbox = section(page, "checkbox").getByRole("checkbox", { name: "Example state" });
  await tap(page, checkbox);
  await expect(checkbox).toHaveAttribute("aria-checked", "true");

  const alignment = section(page, "toggle-group").getByRole("group", { name: "Text alignment" });
  const center = alignment.getByRole("button", { name: "Center" });
  await tap(page, center);
  await expect(center).toHaveAttribute("aria-pressed", "true");

  const rating = section(page, "rating").getByRole("radiogroup").first().getByRole("radio").last();
  await tap(page, rating);
  await expect(rating).toHaveAttribute("aria-checked", "true");
});

test("tap focuses and edits text, numeric, and composite form controls", async ({ page }) => {
  const input = section(page, "input").locator(".akaza-input").first();
  await tap(page, input);
  await expect(input).toBeFocused();
  await input.fill("Touch input");

  const pinCell = section(page, "pin-input").locator(".akaza-pin-input-input").first();
  await tap(page, pinCell);
  await expect(pinCell).toBeFocused();

  const tagsInput = section(page, "tags-input").locator(".akaza-tags-input input:not(.akaza-tags-input-hidden-input)").first();
  await tap(page, tagsInput);
  await expect(tagsInput).toBeFocused();

  const editable = section(page, "editable").locator(".akaza-editable").first();
  await tap(page, editable.locator(".akaza-editable-preview"));
  await expect(editable.locator(".akaza-editable-input")).toBeFocused();
  await tap(page, editable.locator(".akaza-editable-cancel"));

  const numberField = section(page, "number-field").locator(".akaza-number-field").first();
  const spinbutton = numberField.getByRole("spinbutton", { name: "Seats" });
  const initial = Number(await spinbutton.getAttribute("aria-valuenow"));
  await tap(page, numberField.locator(".akaza-number-field-increment"));
  await expect(spinbutton).toHaveAttribute("aria-valuenow", String(initial + 1));

  const dateSegment = section(page, "date-field").locator(".akaza-date-field-segment").first();
  await tap(page, dateSegment);
  await expect(dateSegment).toBeFocused();
  await dateSegment.fill("09");

  const rangeSegment = section(page, "date-range-field").locator(".akaza-date-field-segment").first();
  await tap(page, rangeSegment);
  await expect(rangeSegment).toBeFocused();

  const timeSegment = section(page, "time-field").locator(".akaza-time-field-segment").first();
  await tap(page, timeSegment);
  await expect(timeSegment).toBeFocused();

  const timeRangeSegment = section(page, "time-range-field").locator(".akaza-time-field-segment").first();
  await tap(page, timeRangeSegment);
  await expect(timeRangeSegment).toBeFocused();

  const rangeTrigger = section(page, "date-range-picker").getByRole("button", { name: "Choose date range" }).first();
  await tap(page, rangeTrigger);
  const rangePopup = page.locator(".akaza-date-range-picker-content");
  await expect(rangePopup).toBeVisible();
  await tap(page, rangePopup.getByRole("button", { name: /August 20, 2026/ }));
  await tap(page, rangePopup.getByRole("button", { name: "Done" }));
  await expect(rangePopup).toBeHidden();

  const combobox = section(page, "combobox").getByRole("combobox", { name: "Framework or skill" });
  await tap(page, combobox);
  await expect(page.locator(".akaza-combobox-content").first()).toBeVisible();
  await tap(page, page.locator(".akaza-combobox-content").first().getByRole("option", { name: /Nuxt/ }));
  await expect(combobox).toHaveValue("Nuxt");
});

test("tap selects collection items and disclosures", async ({ page }) => {
  const select = section(page, "select").getByRole("combobox", { name: "Plan", exact: true });
  await tap(page, select);
  const selectOption = page.locator(".akaza-select-content").getByRole("option").nth(1);
  await tap(page, selectOption);
  await expect(selectOption).toHaveAttribute("aria-selected", "true");

  const listboxOption = section(page, "listbox")
    .getByRole("listbox", { name: "Framework", exact: true })
    .getByRole("option", { name: "Vite Frontend build tool." });
  await tap(page, listboxOption);
  await expect(listboxOption).toHaveAttribute("aria-selected", "true");

  const collapsible = section(page, "collapsible").locator(".akaza-collapsible-trigger").first();
  await tap(page, collapsible);
  await expect(collapsible).toHaveAttribute("aria-expanded", "true");

  const accordion = section(page, "accordion").locator(".akaza-accordion-trigger").first();
  await tap(page, accordion);
  await expect(accordion).toHaveAttribute("aria-expanded", "true");

  const tab = section(page, "tabs").getByRole("tablist", { name: "Main navigation" }).getByRole("tab").nth(1);
  await tap(page, tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");

  const stepper = section(page, "stepper").locator(".akaza-stepper").first();
  await tap(page, stepper.locator(".akaza-stepper-next"));
  await expect(stepper.locator(".akaza-stepper-trigger").nth(1)).toHaveAttribute("aria-current", "step");

  const calendar = section(page, "calendar").locator(".akaza-calendar").first();
  const calendarDay = calendar.locator('.akaza-calendar-cell-trigger[data-akaza-state="available"]').first();
  const calendarDayLabel = await calendarDay.getAttribute("aria-label");
  if (!calendarDayLabel) throw new Error("Calendar day has no accessible label");
  await tap(page, calendarDay);
  await expect(calendar.getByRole("button", { name: calendarDayLabel, exact: true })).toHaveAttribute("data-akaza-selected", "true");

  const monthPicker = section(page, "month-picker").locator(".akaza-month-picker").first();
  const september = monthPicker.getByRole("gridcell", { name: "September 2026" });
  await tap(page, september);
  await expect(september).toHaveAttribute("data-akaza-selected", "true");

  const yearPicker = section(page, "year-picker").locator(".akaza-year-picker").first();
  const year = yearPicker.getByRole("gridcell", { name: "2029" });
  await tap(page, year);
  await expect(year).toHaveAttribute("data-akaza-selected", "true");

  const nextPage = section(page, "pagination").locator(".akaza-pagination-next").first();
  const pagination = section(page, "pagination").locator(".akaza-pagination").first();
  const initialPage = Number(await pagination.getAttribute("data-akaza-page"));
  await tap(page, nextPage);
  await expect(pagination).toHaveAttribute("data-akaza-page", String(initialPage + 1));
});

test("tap operates navigation composites and long press opens context menu", async ({ browserName, page }) => {
  const navigation = section(page, "navigation-menu").locator(".akaza-navigation-menu");
  const products = navigation.getByRole("button", { name: "Products" });
  await tap(page, products);
  await expect(products).toHaveAttribute("aria-expanded", "true");
  await tap(page, products);
  await expect(products).toHaveAttribute("aria-expanded", "false");

  const menubar = section(page, "menubar").getByRole("menubar", { name: "Editor menu" });
  const file = menubar.getByRole("menuitem", { name: "File", exact: true });
  await tap(page, file);
  await expect(file).toHaveAttribute("aria-expanded", "true");
  await tap(page, page.locator(".akaza-menubar-content").getByRole("menuitem", { name: "New file" }));
  await expect(file).toHaveAttribute("aria-expanded", "false");

  const toolbar = section(page, "toolbar").getByRole("toolbar", { name: "Editor toolbar" });
  const bold = toolbar.getByRole("button", { name: "Bold" });
  await tap(page, bold);
  await expect(bold).toHaveAttribute("aria-pressed", "false");

  // Playwright WebKit exposes real taps but no long-press gesture API.
  if (browserName === "webkit") return;
  const contextTarget = section(page, "context-menu").getByText("Right-click here", { exact: true });
  await longPress(page, contextTarget, 1000, section(page, "context-menu").locator(".akaza-context-menu-root"));
  await expect(page.locator(".akaza-context-menu-content")).toBeVisible();
});

test("tap opens and closes overlay controls without hover", async ({ page }) => {
  const popover = section(page, "popover").getByRole("button", { name: "Open popover" });
  await tap(page, popover);
  await expect(page.locator(".akaza-popover-content")).toBeVisible();
  await tap(page, page.locator(".akaza-popover-content").getByRole("button", { name: "Close" }));
  await expect(page.locator(".akaza-popover-content")).toBeHidden();

  const menuTrigger = section(page, "menu").getByRole("button", { name: "Actions" });
  await tap(page, menuTrigger);
  await expect(page.locator(".akaza-menu-content").first()).toBeVisible();
  await tap(page, menuTrigger);
  await expect(page.locator(".akaza-menu-content").first()).toBeHidden();

  const dialogTrigger = section(page, "dialog").getByRole("button", { name: "Open", exact: true }).first();
  await tap(page, dialogTrigger);
  const dialog = page.getByRole("dialog").first();
  await expect(dialog).toBeVisible();
  await tap(page, dialog.getByRole("button", { name: "Cancel" }));
  await expect(dialog).toBeHidden();

  const alertTrigger = section(page, "alert-dialog").getByRole("button", { name: "Delete account" });
  await tap(page, alertTrigger);
  const alert = page.getByRole("alertdialog").first();
  await expect(alert).toBeVisible();
  await tap(page, alert.getByRole("button", { name: "Cancel" }));
  await expect(alert).toBeHidden();

  const drawerTrigger = section(page, "drawer").getByRole("button", { name: "Open right" });
  await tap(page, drawerTrigger);
  const drawer = page.locator(".akaza-drawer").first();
  await expect(drawer).toBeVisible();
  await tap(page, drawer.getByRole("button", { name: "Close" }));
  await expect(drawer).toBeHidden();

  const toastButton = section(page, "toast").getByRole("button", { name: "Warning" });
  await tap(page, toastButton);
  const toast = page.locator(".akaza-toast").last();
  await expect(toast).toHaveAttribute("data-akaza-type", "warning");
  await tap(page, toast.locator(".akaza-toast-close"));
  await expect(toast).toBeHidden();

  const previewTrigger = section(page, "hover-preview-card").getByRole("button", { name: "Interactive release preview" });
  await tap(page, previewTrigger);
  const preview = page.getByRole("dialog", { name: "Release preview" });
  await expect(preview).toBeVisible();
  await tap(page, previewTrigger);
  await expect(preview).toBeHidden();
});

test("touch pointer position updates slider value", async ({ page }) => {
  const sliderRoot = section(page, "slider").locator(".akaza-slider").first();
  const track = sliderRoot.locator(".akaza-slider-track");
  const slider = sliderRoot.getByRole("slider", { name: "Volume" });
  await tap(page, track);
  expect(Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThan(40);
});

test("touch drag updates slider and dismisses a swipe-enabled drawer", async ({ browserName, page }) => {
  if (browserName !== "chromium") return;

  const sliderRoot = section(page, "slider").locator(".akaza-slider").first();
  const track = sliderRoot.locator(".akaza-slider-track");
  const slider = sliderRoot.getByRole("slider", { name: "Volume" });
  const initial = Number(await slider.getAttribute("aria-valuenow"));
  await dragTouch(page, track, 120, 0, { x: 0.25, y: 0.5 });
  expect(Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThan(initial);

  const drawerTrigger = section(page, "drawer").getByRole("button", { name: "Open bottom" });
  await tap(page, drawerTrigger);
  const drawer = page.locator('.akaza-drawer[data-akaza-side="bottom"]');
  await expect(drawer).toBeVisible();
  await page.waitForTimeout(400);
  await dragTouch(page, drawer, 0, 140, { x: 0.5, y: 0.25 });
  await expect(drawer).toBeHidden();
});
