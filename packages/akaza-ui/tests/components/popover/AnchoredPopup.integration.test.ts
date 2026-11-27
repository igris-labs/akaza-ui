import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { HoverPreviewCard } from "@/components/hover-preview-card";
import { Popover } from "@/components/popover";
import { Tooltip } from "@/components/tooltip";
import HoverPreviewCardSection from "../../../../../playground/src/sections/hover-preview-card/HoverPreviewCardSection.vue";
import PopoverSection from "../../../../../playground/src/sections/popover/PopoverSection.vue";
import TooltipSection from "../../../../../playground/src/sections/tooltip/TooltipSection.vue";
import { installPopupTestEnvironment, keyboardFocus, pointer } from "./popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("anchored popup consumers", () => {
  it("does not bind SSR listeners with DOM globals present", async () => {
    const listen = vi.spyOn(document, "addEventListener");
    const windowListen = vi.spyOn(window, "addEventListener");
    const measure = vi.spyOn(Element.prototype, "getBoundingClientRect");
    const html = await renderToString(createSSRApp({
      render: () => h("main", [
        h(Popover, { modelValue: true, teleport: false }, { trigger: () => h("button", "Options"), content: () => "Options content" }),
        h(Tooltip, { modelValue: true, teleport: false }, { trigger: () => h("button", "Help"), content: () => "Help content" }),
        h(HoverPreviewCard, { modelValue: true, teleport: false }, { trigger: () => h("button", "Profile"), content: () => "Profile content" }),
      ]),
    }));
    expect(html).toContain("Options content");
    expect(html).toContain("Help content");
    expect(html).toContain("Profile content");
    expect(listen).not.toHaveBeenCalled();
    expect(windowListen).not.toHaveBeenCalled();
    expect(measure).not.toHaveBeenCalled();
  });

  it("wires the playground Popover event reason and nested child action", async () => {
    vi.useFakeTimers();
    const wrapper = mount(PopoverSection, { attachTo: document.body });
    await wrapper.vm.$nextTick();
    const button = (text: string) => wrapper.findAll("button").find(button => button.text() === text)!;
    await button("Open & watch events").trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("opened · reason: trigger");
    await button("Close (programmatic)").trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("closed · reason: programmatic");
    await button("Parent popover").trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    const childTrigger = [...document.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Child popover")!;
    childTrigger.click();
    await vi.advanceTimersByTimeAsync(40);
    const childAction = [...document.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Apply child")!;
    childAction.click();
    await vi.advanceTimersByTimeAsync(40);
    expect(childTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(button("Parent popover").attributes("aria-expanded")).toBe("true");
  });

  it("binds actual playground tooltip ARIA without duplicate focus handlers", async () => {
    vi.useFakeTimers();
    const wrapper = mount(TooltipSection, { attachTo: document.body });
    await wrapper.vm.$nextTick();
    const trigger = wrapper.findAll<HTMLButtonElement>("button").find(button => button.text() === "Controlled tooltip")!;
    keyboardFocus(trigger.element);
    await vi.advanceTimersByTimeAsync(40);
    const tooltip = document.getElementById(trigger.attributes("aria-describedby"))!;
    expect(tooltip.getAttribute("role")).toBe("tooltip");
    expect(tooltip.textContent).toBe("Hover, focus, or toggle externally");
    expect(wrapper.text()).toContain("open: true");
    const toggle = wrapper.findAll("button").find(button => button.text() === "Toggle externally")!;
    await toggle.trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("open: false");
  });

  it("wires the playground hover cancellation and custom close action", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCardSection, { attachTo: document.body });
    await wrapper.vm.$nextTick();
    const trigger = wrapper.findAll<HTMLButtonElement>("button").find(button => button.text() === "Interactive release preview")!;
    pointer(trigger.element, "pointerdown", "touch");
    await trigger.trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("opened: trigger");
    await wrapper.get("input[type=checkbox]").setValue(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("closed: escape (blocked)");
    expect(wrapper.text()).toContain("open: true");
    const close = [...document.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Close preview")!;
    close.click();
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.text()).toContain("closed: done");
    expect(wrapper.text()).toContain("open: false");
  });
});
