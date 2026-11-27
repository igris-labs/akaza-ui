import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { Drawer } from "@/components/drawer";
import { Toast } from "@/components/toast";
import { createToastManager } from "@/composables/toast";
import DrawerSection from "../../../../playground/src/sections/drawer/DrawerSection.vue";
import ToastSection from "../../../../playground/src/sections/toast/ToastSection.vue";
import { geometry, pointer, pointerFrames } from "./batch21b-pointer-fixture";

enableAutoUnmount(afterEach);
beforeEach(() => { pointerFrames(); });
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("batch21h public examples", () => {
  it("keeps a canceled swipe open and accepts the next swipe in the actual Drawer playground", async () => {
    const wrapper = mount(DrawerSection, { attachTo: document.body });
    const drawer = wrapper.findAllComponents(Drawer).find(component => component.props("title") === "Event details demo")!;
    await wrapper.get('input[type="checkbox"]').setValue(true);
    await drawer.get("button").trigger("click");
    await flushPromises();
    const panel = geometry(document.querySelector('.akaza-drawer[role="dialog"]')!);
    pointer(panel, "pointerdown");
    pointer(document, "pointerup", { clientX: 120 });
    await flushPromises();
    expect(document.querySelector(".akaza-drawer")).not.toBeNull();
    expect(panel.style.getPropertyValue("--drawer-swipe-movement-x")).toBe("");
    expect(wrapper.text()).toContain("close - reason: swipe");
    await wrapper.get('input[type="checkbox"]').setValue(false);
    pointer(panel, "pointerdown");
    pointer(document, "pointerup", { clientX: 120 });
    await flushPromises();
    expect(document.querySelector(".akaza-drawer")).toBeNull();
  });

  it("runs a custom Toast action without closing and retains its slot close handler", async () => {
    const wrapper = mount(ToastSection, { attachTo: document.body });
    const show = wrapper.findAll("button").find(button => button.text() === "Show custom toast")!;
    await show.trigger("click");
    const custom = wrapper.findAllComponents(Toast).find(component => component.props("position") === "top-right")!;
    const region = document.querySelector('.akaza-toast-viewport[data-akaza-side="top"]')!;
    const action = [...region.querySelectorAll("button")].find(button => button.textContent?.trim() === "Inspect")!;
    action.click();
    await flushPromises();
    expect(custom.props("manager")?.toasts.value).toHaveLength(1);
    (region.querySelector('[aria-label="Dismiss custom notification"]') as HTMLButtonElement).click();
    await flushPromises();
    expect(custom.props("manager")?.toasts.value[0]?.state).toBe("closing");
    custom.props("manager")?.remove(custom.props("manager")!.toasts.value[0]!.id);
  });

  it("keeps SSR markup and hydration free of SDK pointer and native top-layer side effects", async () => {
    const manager = createToastManager();
    manager.add({ title: "Saved", priority: "low", duration: 0 });
    const App = { render: () => h("main", [h(Toast, { manager, teleport: false }), h(Drawer, { modelValue: false, title: "Preview", teleport: false })]) };
    const html = await renderToString(createSSRApp(App));
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('role="region"');
    expect(html).not.toContain("popover=");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const warn = vi.spyOn(console, "error");
    const app = createSSRApp(App);
    app.mount(container);
    try {
      await nextTick();
      const toast = geometry(container.querySelector(".akaza-toast")!);
      pointer(toast, "pointerdown");
      pointer(document, "pointerup", { clientX: 50 });
      await nextTick();
      expect(manager.toasts.value[0]?.state).toBe("closing");
      expect(warn).not.toHaveBeenCalled();
      manager.remove(manager.toasts.value[0]!.id);
    } finally {
      app.unmount();
    }
  });

  it("documents persistent popup presentation and final/cancel gesture contracts", () => {
    const docs = (name: string) => readFileSync(resolve(__dirname, `../../../../docs/content/3.components/${name}.md`), "utf8");
    expect(docs("toast")).toContain("browser's top layer when supported");
    expect(docs("toast")).toContain("remains usable while a modal is open");
    expect(docs("toast")).toContain("final pointer coordinates");
    expect(docs("drawer")).toContain("refused controlled changes snap back");
    expect(docs("drawer")).toContain("100px");
  });
});
