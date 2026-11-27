import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Listbox } from "@/components/listbox";
import { Tree } from "@/components/tree";

it("batch 11 hydrates bounded collection windows with stable IDs, mounted ARIA and native form ownership", async () => {
  const options = Array.from({ length: 100 }, (_, value) => ({ value, label: `Item ${value}` }));
  const View = defineComponent({
    setup() {
      const selected = ref(99);
      return () => h("form", [
        h(Listbox, {
          options, modelValue: selected.value, name: "choice", required: true, ariaLabel: "List",
          virtualize: true, virtualHeight: 80, virtualItemHeight: 20, overscan: 2,
          "onUpdate:modelValue": value => { selected.value = value as number; },
        }),
        h(Tree, {
          items: options, itemKey: "value", ariaLabel: "Tree", transition: false,
          virtualize: { height: 80, itemHeight: 20, overscan: 2 },
        }, {
          item: ({ item }: { item: { value: number } }) => h("input", { type: "checkbox", name: "tree-slot", value: item.value, checked: item.value === 0 }),
        }),
      ]);
    },
  });
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  for (const role of ["option", "treeitem"]) {
    const rows = root.querySelectorAll(`[role="${role}"]`);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(5);
  }
  root.querySelectorAll<HTMLElement>('[role="listbox"], [role="tree"]').forEach(element => {
    Object.defineProperty(element, "clientHeight", { value: 80, configurable: true });
  });
  const app = createSSRApp(View);
  const warn = vi.fn();
  app.config.warnHandler = warn;
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    const hydratedIds = [...root.querySelectorAll("[id]")].map(element => element.id);
    expect(hydratedIds.filter(id => ids.includes(id))).toEqual(ids);
    expect(new Set(hydratedIds).size).toBe(hydratedIds.length);
    for (const role of ["option", "treeitem"]) {
      const count = root.querySelectorAll(`[role="${role}"]`).length;
      expect(count).toBeGreaterThanOrEqual(4);
      expect(count).toBeLessThanOrEqual(4 + 2 * 2 + 1);
    }
    expect(root.querySelector("[data-slot]")).toBeNull();
    const list = root.querySelector<HTMLElement>('[role="listbox"]')!;
    list.scrollTo = vi.fn((options: ScrollToOptions) => {
      list.scrollTop = options.top ?? 0;
      list.dispatchEvent(new Event("scroll"));
    });
    Object.defineProperty(list, "clientHeight", { value: 80 });
    list.focus();
    await nextTick();
    expect(list.scrollTop).toBe(1980);
    expect(document.getElementById(list.getAttribute("aria-activedescendant")!)?.textContent).toContain("Item 99");
    list.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    await nextTick();
    expect(list.scrollTop).toBe(0);
    list.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    await nextTick();
    const data = new FormData(root.querySelector("form")!);
    expect(data.getAll("choice")).toEqual(["0"]);
    expect(data.getAll("tree-slot")).toEqual(["0"]);
    expect(root.querySelectorAll('.akaza-tree input[type="hidden"]')).toHaveLength(0);
    list.scrollTop = 400;
    list.dispatchEvent(new Event("scroll"));
    await nextTick();
    expect(list.scrollTop).toBe(400);
    expect(list.hasAttribute("aria-activedescendant")).toBe(false);
  } finally {
    app.unmount();
    root.remove();
    error.mockRestore();
  }
});
