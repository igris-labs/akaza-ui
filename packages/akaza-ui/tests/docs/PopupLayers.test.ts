import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const popups = ["select", "combobox", "menu", "context-menu", "menubar", "popover", "tooltip", "hover-preview-card", "navigation-menu", "date-field", "date-range-field", "date-range-picker"];

it.each(popups)("keeps the %s docs wrapper on Akaza's dynamic floating layer", component => {
  const styles = readFileSync(resolve(__dirname, `../../../../docs/app/components/ui/${component}/index.ts`), "utf8");
  expect(styles).not.toMatch(/\bz-50\b/);
});
