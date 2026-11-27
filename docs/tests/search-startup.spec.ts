import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  for (const path of ["/", "/components/dialog"]) {
    test(`search waits for startup and opens on its first click at ${path} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (/hydration|Failed to resolve component/.test(message.text())) errors.push(message.text());
      });

      let releaseStartup!: () => void;
      const startup = new Promise<void>((resolve) => {
        releaseStartup = resolve;
      });
      await page.route("**/_nuxt/**", async (route) => {
        if (route.request().resourceType() === "script") await startup;
        await route.continue();
      });

      await page.goto(path, { waitUntil: "commit" });
      const trigger = page
        .getByRole("button", { name: "Search documentation", exact: true })
        .filter({ visible: true });
      try {
        // Visible SSR markup must not advertise an action before its handlers exist.
        await expect(trigger).toBeVisible();
        await expect(trigger).toBeDisabled();
      } finally {
        releaseStartup();
      }

      await expect(trigger).toBeEnabled();
      await trigger.click();
      const search = page.getByRole("dialog", { name: "Search documentation" });
      await expect(search).toBeVisible();
      await expect(search.getByRole("combobox")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(search).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.keyboard.press("Control+k");
      await expect(search).toBeVisible();
      await expect(search.getByRole("combobox")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(search).toBeHidden();
      expect(errors).toEqual([]);
    });
  }
}
