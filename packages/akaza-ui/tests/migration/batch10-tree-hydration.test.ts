import type { TreeKey, TreeSelection } from "@/components/tree";
import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Tree } from "@/components/tree";

it("batch 10 hydrates stable IDs and typed keys, then navigates and selects without SDK DOM ownership", async () => {
  const View = defineComponent({
    setup() {
      const selected = ref<TreeSelection>("1");
      const expanded = ref<TreeKey[]>([1]);
      return () => h(Tree, {
        items: [{ id: 1 as TreeKey, label: "Number", children: [
          { id: "1" as TreeKey, label: "String" },
          { id: "last" as TreeKey, label: "Last" },
        ] }],
        itemKey: "id", expanded: expanded.value, modelValue: selected.value,
        "onUpdate:modelValue": (value: TreeSelection) => { selected.value = value; },
        "onUpdate:expanded": (value: TreeKey[]) => { expanded.value = value; },
        ariaLabel: "Hydrated tree", transition: false,
      });
    },
  });
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  const app = createSSRApp(View);
  const warning = vi.fn();
  app.config.warnHandler = warning;
  try {
    app.mount(root);
    await nextTick();
    expect(warning).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(root.querySelector("[data-slot]")).toBeNull();
    const rows = root.querySelectorAll<HTMLElement>('[role="treeitem"]');
    expect(rows[1]!.getAttribute("aria-selected")).toBe("true");
    rows[1]!.focus();
    rows[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(rows[2]);
    rows[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    await nextTick();
    expect(rows[2]!.getAttribute("aria-selected")).toBe("true");
    expect(rows[1]!.getAttribute("aria-selected")).toBe("false");
  } finally {
    app.unmount();
    root.remove();
  }
});
