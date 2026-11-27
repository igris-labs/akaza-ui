import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { Accordion } from "@/components/accordion";
import { Menu } from "@/components/menu";
import "./panel-motion";

it("hydrates Accordion and open Menu with stable heading IDs and native focus", async () => {
  const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
  const View = defineComponent({
    setup() {
      const open = ref(true);
      return () => h("div", [
        h(Accordion, { items, modelValue: "a" }),
        h(Menu, { items, modelValue: open.value, teleport: false, "onUpdate:modelValue": value => { open.value = value; } }),
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
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
    expect([...root.querySelectorAll("[id]")].map(element => element.id)).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    expect(root.querySelectorAll('[role="heading"][aria-level="3"]')).toHaveLength(2);
    expect(root.querySelector('[data-slot="akaza-menu-popup-content"]')).not.toBeNull();
    const triggers = root.querySelectorAll<HTMLButtonElement>(".akaza-accordion-trigger");
    triggers[0]!.focus();
    triggers[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(triggers[1]);
    expect([...triggers].map(trigger => trigger.tabIndex)).toEqual([0, 0]);
    const commands = root.querySelectorAll<HTMLElement>('[role="menuitem"]');
    commands[0]!.focus();
    commands[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(commands[1]);
    expect(commands[1]!.tabIndex).toBe(0);
    expect(commands[0]!.tabIndex).toBe(-1);
  } finally {
    app.unmount();
    root.remove();
  }
});
