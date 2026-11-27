// @vitest-environment node
import { expect, it } from "vitest";
import { createSSRApp, effectScope, h, shallowRef } from "vue";
import { renderToString } from "vue/server-renderer";
import { Listbox } from "@/components/listbox";
import { Tree } from "@/components/tree";
import { useCollectionVirtualizer } from "@/composables/internal/sdk/useCollectionVirtualizer";

it("batch 11 records the SDK bounded SSR window without accessing browser globals", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
  const scope = effectScope();
  const rows = Array.from({ length: 10_000 }, (_, id) => ({ id }));
  try {
    const sdk = scope.run(() => useCollectionVirtualizer({
      rows: () => rows, key: row => String(row.id),
      itemHeight: () => 20, overscan: () => 2, enabled: () => true, viewport: shallowRef(null),
    }))!;
    const initial = sdk.rows.value;
    expect(initial.length).toBeGreaterThan(0);
    expect(initial.length).toBeLessThanOrEqual(5);
    expect(sdk.size.value).toBe(200_000);
    sdk.scrollTo(9999);
    expect(sdk.rows.value).toBe(initial);
  } finally {
    scope.stop();
  }
});

it("renders deterministic bounded SDK windows and offscreen native Listbox values", async () => {
  expect(typeof document).toBe("undefined");
  const options = Array.from({ length: 10_000 }, (_, value) => ({ value, label: `Item ${value}` }));
  const render = (value: number) => renderToString(createSSRApp({
    render: () => h("form", [
      h(Listbox, { options, modelValue: value, name: "choice", virtualize: true, virtualItemHeight: 20, overscan: 2, ariaLabel: "List" }),
      h(Tree, { items: options, itemKey: "value", modelValue: value, virtualize: { itemHeight: 20, height: 80, overscan: 2 }, ariaLabel: "Tree" }),
    ]),
  }));
  const first = await render(9999);
  expect(await render(9999)).toBe(first);
  expect(await render(4)).toContain('name="choice" value="4"');
  expect(first).toContain('name="choice" value="9999"');
  for (const role of ["option", "treeitem"]) {
    const count = [...first.matchAll(new RegExp(`role="${role}"`, "g"))].length;
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
  }
  expect(first).not.toContain("aria-activedescendant=");
  expect(first).not.toContain("data-slot");
});
