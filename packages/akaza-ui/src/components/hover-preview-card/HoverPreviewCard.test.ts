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
});
