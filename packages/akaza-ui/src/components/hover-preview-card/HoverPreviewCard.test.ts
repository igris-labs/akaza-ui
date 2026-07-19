import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HoverPreviewCard } from ".";

afterEach(() => vi.useRealTimers());

describe("hover preview card", () => {
  it("stays open when focus moves from trigger into content", async () => {
    vi.useFakeTimers();
    const wrapper = mount(HoverPreviewCard, {
      props: { openDelay: 0, closeDelay: 0, teleport: false },
      slots: {
        trigger: '<button class="trigger">Profile</button>',
        content: '<button class="content-action">Follow</button>',
      },
    });
    const trigger = wrapper.find(".trigger");

    await trigger.trigger("focusin");
    vi.runAllTimers();
    await wrapper.vm.$nextTick();
    const action = wrapper.find(".content-action");
    await wrapper.find(".akaza-hover-preview-card-trigger").trigger("focusout", {
      relatedTarget: action.element,
    });
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

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

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find(".trigger").element);
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".akaza-hover-preview-card-content").exists()).toBe(false);
    wrapper.unmount();
  });
});
