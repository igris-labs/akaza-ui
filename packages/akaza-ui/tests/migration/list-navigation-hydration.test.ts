import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { ColorSwatchPicker } from "@/components/color-swatch-picker";
import { Listbox } from "@/components/listbox";

it("hydrates virtual-focus lists without SDK IDs, duplicate IDs, or a second value owner", async () => {
  const View = defineComponent({
    setup() {
      const selected = ref("a");
      const color = ref("#ff0000");
      return () => h("form", [
        h(Listbox, {
          options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
          modelValue: selected.value, name: "choice", ariaLabel: "Choice",
          "onUpdate:modelValue": value => { selected.value = value as string; },
        }),
        h(ColorSwatchPicker, {
          items: ["red", "lime"], modelValue: color.value, name: "color", format: "hsl", ariaLabel: "Palette",
          "onUpdate:modelValue": value => { color.value = value as string; },
        }),
      ]);
    },
  });
  const root = document.createElement("div");
  root.innerHTML = await renderToString(createSSRApp(View));
  document.body.append(root);
  const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
  const app = createSSRApp(View);
  const warn = vi.fn();
  app.config.warnHandler = warn;
  try {
    app.mount(root);
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelector("[data-slot]")).toBeNull();
    for (const list of root.querySelectorAll<HTMLElement>('[role="listbox"]')) {
      list.focus();
      list.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
      await nextTick();
      expect(document.activeElement).toBe(list);
      expect(root.querySelector(`[id="${list.getAttribute("aria-activedescendant")}"]`)).not.toBeNull();
      list.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      await nextTick();
    }
    const data = new FormData(root.querySelector("form")!);
    expect(data.get("choice")).toBe("b");
    expect(data.get("color")).toMatch(/^hsl\(120 /);
  } finally {
    app.unmount();
    root.remove();
  }
});
