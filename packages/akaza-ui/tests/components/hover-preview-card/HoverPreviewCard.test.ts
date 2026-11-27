import type { AkazaChangeEventDetails } from "@/types";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { HoverPreviewCard } from "@/components/hover-preview-card";
import { installPopupTestEnvironment, keyboardFocus, pointer } from "../popover/popupTestEnvironment";

enableAutoUnmount(afterEach);
installPopupTestEnvironment();
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("hover preview card", () => {
  it("stays open when focus moves from trigger into content", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { openDelay: 0, closeDelay: 0, teleport: false },
      slots: {
        trigger: '<button class="trigger" v-bind="triggerProps">Profile</button>',
        content: '<button class="content-action">Follow</button>',
      },
    });
    await wrapper.vm.$nextTick();
    const trigger = wrapper.find<HTMLButtonElement>(".trigger");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    trigger.element.focus();
    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.vm.$nextTick();
    const action = wrapper.find<HTMLButtonElement>(".content-action");
    action.element.focus();
    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".akaza-hover-preview-card-content").attributes("style")).not.toContain("visibility: hidden");
    expect(wrapper.find(".akaza-hover-preview-card-content").isVisible()).toBe(true);
  });

  it("closes immediately on Escape without reopening from restored focus", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { modelValue: true, openDelay: 50, closeDelay: 1000, teleport: false },
      slots: {
        trigger: '<button class="trigger">Profile</button>',
        content: "Preview",
      },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find(".trigger").element);
    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
    wrapper.unmount();
  });

  it("maps delayed pointer requests to hover and preserves cancellation", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn((_open: boolean, details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false, openDelay: 100, onOpenChange },
      slots: { trigger: '<button class="trigger" v-bind="triggerProps">Profile</button>', content: "Preview" },
    });
    await nextTick();
    const event = pointer(wrapper.get(".trigger").element, "pointerenter");
    await vi.advanceTimersByTimeAsync(99);
    expect(onOpenChange).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: "hover", event }));
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
  });

  it("keeps force-mounted content hidden and inert until accepted, without moving focus", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false, forceMount: true, openDelay: 0, ariaLabel: "Profile preview", arrow: true },
      slots: { trigger: '<button class="trigger" v-bind="triggerProps">Profile</button>', content: '<button class="action">Follow</button>' },
    });
    await nextTick();
    const content = wrapper.get(".akaza-hover-preview-card-content");
    expect(content.isVisible()).toBe(false);
    expect(content.attributes("inert")).toBeDefined();
    expect(content.attributes("aria-hidden")).toBe("true");
    expect(content.get(".akaza-hover-preview-card-arrow").attributes("data-slot")).toBe("akaza-hover-popup-arrow");
    expect(content.get(".akaza-hover-preview-card-arrow").attributes("aria-hidden")).toBe("true");

    const trigger = wrapper.get<HTMLButtonElement>(".trigger");
    keyboardFocus(trigger.element);
    await vi.advanceTimersByTimeAsync(40);
    expect(content.isVisible()).toBe(true);
    expect(content.attributes("inert")).toBeUndefined();
    expect(content.attributes("role")).toBe("dialog");
    expect(content.attributes("aria-label")).toBe("Profile preview");
    expect(document.activeElement).toBe(trigger.element);
    trigger.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(content.element.isConnected).toBe(true);
    expect(content.isVisible()).toBe(false);
    expect(content.attributes("inert")).toBeDefined();
  });

  it("tracks forceMount changes while closed without opening the card", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false },
      slots: { trigger: '<button class="trigger">Profile</button>', content: "Preview" },
    });
    await nextTick();
    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
    await wrapper.setProps({ forceMount: true });
    await vi.advanceTimersByTimeAsync(40);
    const content = wrapper.get(".akaza-hover-preview-card-content");
    expect(content.isVisible()).toBe(false);
    expect(content.attributes("inert")).toBeDefined();
    expect(content.attributes("data-akaza-state")).toBe("closed");
    expect(wrapper.emitted("open-change")).toBeUndefined();
    await wrapper.setProps({ forceMount: false });
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
    expect(wrapper.emitted("open-change")).toBeUndefined();
  });

  it.each(["touch", "pen"])("toggles once for %s without hijacking mouse clicks", async pointerType => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false },
      slots: { trigger: '<button class="trigger" v-bind="triggerProps">Profile</button>', content: "Preview" },
    });
    await nextTick();
    const trigger = wrapper.get(".trigger");
    pointer(trigger.element, "pointerdown", pointerType);
    await trigger.trigger("click");
    expect(wrapper.emitted("open-change")).toHaveLength(1);
    expect(wrapper.emitted("open-change")![0]).toEqual([true, expect.objectContaining({ reason: "trigger", event: expect.any(MouseEvent) })]);
    await trigger.trigger("click");
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
    pointer(trigger.element, "pointerdown", "mouse");
    await trigger.trigger("click");
    expect(wrapper.emitted("open-change")).toHaveLength(2);
  });

  it("respects openOnClick=false while leaving the native trigger click intact", async () => {
    vi.useFakeTimers();
    const click = vi.fn();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false, openOnClick: false },
      slots: { trigger: '<button class="trigger">Profile</button>', content: "Preview" },
    });
    await nextTick();
    const trigger = wrapper.get(".trigger");
    trigger.element.addEventListener("click", click);
    pointer(trigger.element, "pointerdown", "touch");
    await trigger.trigger("click");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.emitted("open-change")).toBeUndefined();
    expect(click).toHaveBeenCalledOnce();
  });

  it("does not commit a pending hover open after disabling or unmounting", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { teleport: false, openDelay: 100, onOpenChange },
      slots: { trigger: '<button class="trigger">Profile</button>', content: "Preview" },
    });
    await nextTick();
    pointer(wrapper.get(".trigger").element, "pointerenter");
    await wrapper.setProps({ disabled: true });
    await vi.advanceTimersByTimeAsync(200);
    expect(onOpenChange).not.toHaveBeenCalled();
    await wrapper.setProps({ disabled: false });
    pointer(wrapper.get(".trigger").element, "pointerenter");
    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(200);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps an accepted-open card visible when Escape is canceled or refused", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn((_open: boolean, details: AkazaChangeEventDetails) => details.cancel());
    const wrapper = mount(HoverPreviewCard, {
      attachTo: document.body,
      props: { modelValue: true, "onUpdate:modelValue": vi.fn(), teleport: false, onOpenChange: cancel },
      slots: { trigger: '<button class="trigger">Profile</button>', content: '<button class="action">Follow</button>' },
    });
    await nextTick();
    wrapper.get<HTMLButtonElement>(".action").element.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(cancel).toHaveBeenCalledOnce();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(document.activeElement).toBe(wrapper.get(".action").element);
    await wrapper.setProps({ onOpenChange: vi.fn() });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await vi.advanceTimersByTimeAsync(40);
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    expect(wrapper.get(".akaza-hover-preview-card-content").isVisible()).toBe(true);
    expect(document.activeElement).toBe(wrapper.get(".action").element);
  });
});
