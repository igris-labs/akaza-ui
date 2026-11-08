// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";

it.each([true, false])("renders an initially open Drawer with modal=%s during SSR", async modal => {
  const app = createSSRApp(defineComponent({
    setup: () => () => h(Drawer, { modelValue: true, modal, teleport: false, title: "Preview" }, {
      body: () => h("button", "Action"),
    }),
  }));
  const html = await renderToString(app);
  await nextTick();
  expect(html).toContain('role="dialog"');
  expect(html.includes('aria-modal="true"')).toBe(modal);
  expect(html.includes('class="akaza-drawer-overlay"')).toBe(modal);
});

it("keeps the native Select in server markup and collects its popup in a portal target", async () => {
  const context: { teleports?: Record<string, string> } = {};
  const html = await renderToString(createSSRApp(Select, {
    open: true, teleport: "#select-popup", ariaLabel: "Project", name: "project",
    options: [{ value: "a", label: "Alpha" }],
  }), context);
  await nextTick();
  expect(html).toContain('name="project"');
  expect(html).not.toContain('class="akaza-select-content"');
  expect(context.teleports?.["#select-popup"]).toContain('role="listbox"');
  expect(context.teleports?.["#select-popup"]).toContain("Alpha");
});
