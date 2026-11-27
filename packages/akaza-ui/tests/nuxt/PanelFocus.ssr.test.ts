// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Accordion, ContextMenu, Menu, Menubar } from "@/index";

it("renders accordion headings and isolated open menu tab stops without browser globals", async () => {
  const items = [{ value: "a", label: "Alpha" }, { value: "skip", label: "Disabled", disabled: true }, { value: "b", label: "Beta" }];
  const render = () => renderToString(createSSRApp({
    render: () => h("div", [
      h(Accordion, { items, headingLevel: 2 }),
      h(Menu, { items, modelValue: true, teleport: false }),
      h(ContextMenu, { items, modelValue: true, teleport: false }),
      h(Menubar, { items: [{ value: "file", label: "File", children: items }], modelValue: "file", teleport: false }),
    ]),
  }));
  const html = await render();
  expect((html.match(/role="heading" aria-level="2"/g) ?? [])).toHaveLength(3);
  expect((html.match(/role="menuitem" tabindex="0"/g) ?? [])).toHaveLength(3);
  expect(html).toContain('data-slot="akaza-menu-popup-content"');
  expect(await render()).toBe(html);
});
