// @vitest-environment node
import type { TreeKey } from "@/components/tree";
import { expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { Tree } from "@/components/tree";

it("batch 10 renders isolated hierarchy, mixed state and lazy branches without browser globals", async () => {
  const items = [{ id: 1 as TreeKey, label: "Number", children: [
    { id: "1" as TreeKey, label: "String" },
    { id: "other" as TreeKey, label: "Other" },
  ] }];
  const render = (selected: TreeKey[]) => renderToString(createSSRApp({
    render: () => h("form", [
      h(Tree, {
        items, itemKey: "id", expanded: [1], modelValue: selected,
        selectionMode: "multiple", selectionPropagation: "both", ariaLabel: "Typed keys",
      }),
      h(Tree, {
        items: [{ id: "lazy", label: "Remote" }], itemKey: "id",
        expanded: ["lazy"], hasChildren: () => true, loadingKeys: ["lazy"], ariaLabel: "Remote tree",
      }),
      h(Tree, {
        items: Array.from({ length: 100 }, (_, id) => ({ id, label: `Item ${id}` })),
        itemKey: "id", virtualize: { itemHeight: 20, height: 80, overscan: 2 }, ariaLabel: "Virtual tree",
      }),
    ]),
  }));
  const first = await render(["1"]);
  const second = await render([1]);
  expect(await render(["1"])).toBe(first);
  expect(first).toContain('aria-level="2" aria-posinset="2" aria-setsize="2"');
  expect(first).toContain('data-akaza-indeterminate="true"');
  expect(second).not.toContain('data-akaza-indeterminate="true"');
  expect(first).toContain('aria-busy="true"');
  expect(first).toContain("Loading Remote...");
  expect(first).not.toContain("data-slot");
  expect(first).not.toContain('type="hidden"');
  expect((first.match(/role="treeitem"/g) ?? []).length).toBeLessThan(15);
  const ids = [...first.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
  expect(new Set(ids).size).toBe(ids.length);
});
