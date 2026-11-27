import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`CheckboxGroup keeps its rows in place when selection changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/components/checkbox-group");
    await expect(page.getByRole("button", { name: "Search documentation", exact: true }).filter({ visible: true })).toBeEnabled();
    const group = page.getByRole("group", { name: "Notification channels" });
    await group.scrollIntoViewIfNeeded();
    const boxes = () => group.locator(".akaza-checkbox-group-parent, .akaza-checkbox-group-item, .akaza-checkbox").evaluateAll(elements => elements.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return [x, y + window.scrollY, width, height];
    }));
    const before = await boxes();
    const sms = group.getByRole("checkbox", { name: "SMS", exact: true });
    await sms.click();
    await expect(sms).toBeChecked();
    expect(await boxes()).toEqual(before);
    const selectAll = group.getByRole("checkbox", { name: "Select all", exact: true });
    await selectAll.press("Space");
    await expect(selectAll).toBeChecked();
    expect(await boxes()).toEqual(before);
    await selectAll.click();
    await expect(sms).not.toBeChecked();
    expect(await boxes()).toEqual(before);
  });
}
