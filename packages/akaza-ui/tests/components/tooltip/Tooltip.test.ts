import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { Tooltip } from "@/components/tooltip";
import { installPopupTestEnvironment, keyboardFocus, pointer } from "../popover/popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const slots = {
  trigger: '<button class="trigger" v-bind="triggerProps">Help</button>',
  content: "Help text",
};

describe("tooltip SDK ownership", () => {
  it("keeps closed tooltip markup hidden and associated before focus", async () => {
    const wrapper = mount(Tooltip, { props: { teleport: false, transition: false }, slots });
    await nextTick();
    expect(wrapper.get("[role=tooltip]").attributes("hidden")).toBeDefined();
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");
    const tooltipId = wrapper.get("[role=tooltip]").attributes("id");
    expect(wrapper.get(".trigger").attributes("aria-describedby")).toBe(tooltipId);
    expect(wrapper.get(".akaza-tooltip-trigger").attributes("aria-describedby")).toBe(tooltipId);
  });

  it("opens on keyboard focus without moving focus and dismisses Escape without the close delay", async () => {
    vi.useFakeTimers();
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { teleport: false, transition: false, delayDuration: 500, closeDelay: 1000, arrow: true },
      slots,
    });
    await nextTick();
    const trigger = wrapper.get<HTMLButtonElement>(".trigger");
    keyboardFocus(trigger.element);
    await vi.advanceTimersByTimeAsync(40);

    const content = wrapper.get("[role=tooltip]");
    expect(content.attributes("data-akaza-state")).toBe("open");
    expect(trigger.attributes("aria-describedby")).toBe(content.attributes("id"));
    expect(content.find(".akaza-tooltip-arrow").exists()).toBe(true);
    expect(content.get(".akaza-tooltip-arrow").attributes("data-slot")).toBe("akaza-tooltip-popup-arrow");
    expect(content.get(".akaza-tooltip-arrow").attributes("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(trigger.element);

    trigger.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(content.attributes("data-akaza-state")).toBe("closed");
    expect(content.attributes("hidden")).toBeDefined();
    expect(trigger.attributes("aria-describedby")).toBe(content.attributes("id"));
    expect(wrapper.get(".akaza-tooltip-trigger").attributes("aria-describedby")).toBe(content.attributes("id"));
    expect(document.activeElement).toBe(trigger.element);
    await vi.advanceTimersByTimeAsync(1000);
    expect(content.attributes("data-akaza-state")).toBe("closed");
  });

  it("uses reactive SDK hover delays and cancels a pending open on leave", async () => {
    vi.useFakeTimers();
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { teleport: false, transition: false, delayDuration: 200, closeDelay: 150 },
      slots,
    });
    await nextTick();
    const trigger = wrapper.get(".trigger").element;
    await vi.advanceTimersByTimeAsync(2000);
    pointer(trigger, "pointerenter");
    await vi.advanceTimersByTimeAsync(100);
    pointer(trigger, "pointerleave");
    await vi.advanceTimersByTimeAsync(300);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");

    await wrapper.setProps({ delayDuration: 50, closeDelay: 80 });
    pointer(trigger, "pointerenter");
    await vi.advanceTimersByTimeAsync(49);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");
    await vi.advanceTimersByTimeAsync(2);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("open");
    pointer(trigger, "pointerleave");
    await vi.advanceTimersByTimeAsync(79);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("open");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");
  });

  it("does not open a disabled tooltip or disable its action button", async () => {
    vi.useFakeTimers();
    const click = vi.fn();
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { teleport: false, transition: false, disabled: true, delayDuration: 0 },
      slots,
    });
    await nextTick();
    wrapper.get(".trigger").element.addEventListener("click", click);
    keyboardFocus(wrapper.get<HTMLButtonElement>(".trigger").element);
    pointer(wrapper.get(".trigger").element, "pointerenter");
    await wrapper.get(".trigger").trigger("click");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");
    expect(wrapper.get(".trigger").attributes("disabled")).toBeUndefined();
    expect(click).toHaveBeenCalledOnce();
  });

  it("keeps a controlled tooltip open when its parent refuses Escape", async () => {
    vi.useFakeTimers();
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { modelValue: true, "onUpdate:modelValue": vi.fn(), teleport: false, transition: false },
      slots,
    });
    await nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(50);
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("open");
    expect(wrapper.get(".trigger").attributes("aria-describedby")).toBe(wrapper.get("[role=tooltip]").attributes("id"));
  });

  it("leaves focus on an external control during programmatic closing", async () => {
    vi.useFakeTimers();
    const wrapper = mount(Tooltip, { attachTo: document.body, props: { modelValue: true, teleport: false, transition: false }, slots });
    await nextTick();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    await wrapper.setProps({ modelValue: false });
    await vi.advanceTimersByTimeAsync(40);
    expect(document.activeElement).toBe(outside);
    expect(wrapper.get("[role=tooltip]").attributes("data-akaza-state")).toBe("closed");
  });
});
