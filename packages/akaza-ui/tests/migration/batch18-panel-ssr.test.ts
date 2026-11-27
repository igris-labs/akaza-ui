// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Accordion } from "@/components/accordion";
import { Collapsible } from "@/components/collapsible";

it.each([
  { open: false, unmountOnHide: false },
  { open: false, unmountOnHide: true },
  { open: true, unmountOnHide: false },
  { open: true, unmountOnHide: true },
])("renders deterministic isolated panels without DOM: %j", async ({ open, unmountOnHide }) => {
  expect(typeof document).toBe("undefined");
  const render = () => renderToString(createSSRApp({
    render: () => h("main", [
      h(Accordion, {
        items: [{ value: "a", label: "Alpha", slot: "custom" }],
        modelValue: open ? "a" : "", unmountOnHide,
      }, {
        custom: ({ item, value, isOpen }) => h("input", { name: "accordion", value: `${item.label}:${value}:${isOpen}` }),
        content: () => h("p", "wrong fallback"),
      }),
      h(Collapsible, { modelValue: open, unmountOnHide }, {
        trigger: ({ isOpen }) => isOpen ? "Close details" : "Open details",
        content: ({ isOpen }) => h("input", { name: "collapsible", value: String(isOpen) }),
      }),
    ]),
  }));
  const html = await render();
  expect(await render()).toBe(html);
  expect(html.match(/role="region"/g)).toHaveLength(2);
  expect(html.match(/aria-expanded="true"/g) ?? []).toHaveLength(open ? 2 : 0);
  const regions = html.match(/<div\s[^>]*role="region"[^>]*>/g) ?? [];
  expect(regions.filter(region => region.includes('aria-hidden="true"'))).toHaveLength(open ? 0 : 2);
  expect(html.match(/ inert(?: |>)/g) ?? []).toHaveLength(open ? 0 : 2);
  expect(html.match(/<input/g) ?? []).toHaveLength(open || !unmountOnHide ? 2 : 0);
  expect(html).not.toContain("wrong fallback");
  expect(html).not.toContain("data-slot");
  expect(html).not.toContain("data-starting-style");
  expect(html).not.toContain("data-ending-style");
  expect(regions.filter(region => /\shidden[=\s>]/.test(region))).toHaveLength(open ? 0 : 2);
  expect(html).not.toContain("style=");
});
