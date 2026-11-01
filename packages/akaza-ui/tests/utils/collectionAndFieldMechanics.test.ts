import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { createChangeDetails } from "@/utils/changeEvent";
import { rangeEndpointDetails, useRangeFieldState } from "@/utils/useRangeFieldState";
import { useRovingFocus } from "@/utils/useRovingFocus";
import { useSegmentFocus } from "@/utils/useSegmentFocus";

describe("roving index traversal", () => {
  it("skips disabled items, loops, and derives boundaries from current data", () => {
    const items = ref([{ disabled: false }, { disabled: true }, { disabled: false }]);
    const loop = ref(true);
    const roving = useRovingFocus({ items, isDisabled: item => item.disabled, loop });
    expect(roving.firstIndex.value).toBe(0);
    expect(roving.lastIndex.value).toBe(2);
    expect(roving.nextIndex(0, 1)).toBe(2);
    expect(roving.nextIndex(2, 1)).toBe(0);
    expect(roving.nextIndex(0, -1)).toBe(2);
    loop.value = false;
    expect(roving.nextIndex(2, 1)).toBe(-1);
    expect(roving.nextIndex(0, -1)).toBe(-1);
    items.value[0]!.disabled = true;
    expect(roving.firstIndex.value).toBe(2);
    items.value = [];
    expect(roving.lastIndex.value).toBe(-1);
    expect(roving.nextIndex(0, 1)).toBe(-1);
  });

  it("handles all-disabled and single-enabled collections without an infinite loop", () => {
    const roving = useRovingFocus({ items: [false, false], isDisabled: item => !item, loop: true });
    expect(roving.firstIndex.value).toBe(-1);
    expect(roving.nextIndex(0, 1)).toBe(-1);
    const single = useRovingFocus({ items: [true], isDisabled: item => !item, loop: true });
    expect(single.nextIndex(0, 1)).toBe(0);
    expect(single.nextIndex(0, 0)).toBe(-1);
  });

  it("keeps caller-owned activation policy reactive", () => {
    const current = ref(0);
    const roving = useRovingFocus({ items: [0, 1, 2], isDisabled: (_item, index) => index > current.value + 1, loop: false });
    expect(roving.lastIndex.value).toBe(1);
    current.value = 1;
    expect(roving.lastIndex.value).toBe(2);
    expect(roving.nextIndex(1, 1)).toBe(2);
  });
});

describe("segmented field focus", () => {
  it("follows changing locale order, includes non-input parts, clamps, and clears refs", () => {
    type Input = "month" | "day";
    type Part = Input | "period";
    const parts = ref<Part[]>(["month", "day", "period"]);
    const wrapper = mount(defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        return { root, ...useSegmentFocus<Input, Part>({
          parts: () => parts.value,
          focusOptions: { preventScroll: true },
          getExtraElement: part => part === "period" ? root.value?.querySelector("button") ?? null : null,
        }) };
      },
      template: '<div ref="root"><input :ref="el => setSegmentRef(el, \'month\')" name="month"><input :ref="el => setSegmentRef(el, \'day\')" name="day"><button>AM</button></div>',
    }), { attachTo: document.body });
    const month = wrapper.get<HTMLInputElement>('[name="month"]').element;
    const day = wrapper.get<HTMLInputElement>('[name="day"]').element;
    const button = wrapper.get("button").element;
    const focus = vi.spyOn(day, "focus");
    wrapper.vm.moveFocus("month", 1);
    expect(document.activeElement).toBe(day);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    wrapper.vm.moveFocus("day", 1);
    expect(document.activeElement).toBe(button);
    wrapper.vm.moveFocus("period", 1);
    expect(document.activeElement).toBe(button);
    parts.value = ["period", "day", "month"];
    wrapper.vm.moveFocus("day", 1);
    expect(document.activeElement).toBe(month);
    wrapper.vm.setSegmentRef(null, "day");
    wrapper.vm.moveFocus("period", 1);
    expect(document.activeElement).toBe(month);
    wrapper.vm.focusSegment("month");
    const refs = wrapper.vm.segmentRefs;
    wrapper.unmount();
    expect(refs.size).toBe(0);
  });
});

describe("range field coordination", () => {
  it("derives child state without revealing validation before interaction", async () => {
    const children = ref([{ invalid: false, filled: false }, { invalid: false, filled: false }]);
    const updateValidity = vi.fn();
    const wrapper = mount(defineComponent({
      setup() {
        const root = ref<HTMLElement | null>(null);
        return { root, ...useRangeFieldState({ root, children: () => children.value, updateValidity }) };
      },
      template: '<div ref="root" @focusin="onFocusin" @focusout="onFocusout" @input="onInput"><input><input></div>',
    }));
    expect(wrapper.vm.validationActive).toBe(false);
    expect(wrapper.vm.childFilled).toBe(false);
    children.value[0] = { invalid: true, filled: true };
    await nextTick();
    expect(wrapper.vm.childInvalid).toBe(true);
    expect(wrapper.vm.childFilled).toBe(true);
    expect(wrapper.vm.validationActive).toBe(false);
    const root = wrapper.get("div");
    await root.trigger("focusin");
    await root.trigger("focusout", { relatedTarget: wrapper.findAll("input")[1]!.element });
    expect(wrapper.vm.focused).toBe(true);
    expect(wrapper.vm.touched).toBe(false);
    await root.trigger("focusout", { relatedTarget: null });
    expect(wrapper.vm.focused).toBe(false);
    expect(wrapper.vm.touched).toBe(true);
    expect(wrapper.vm.validationActive).toBe(true);
    const calls = updateValidity.mock.calls.length;
    wrapper.unmount();
    children.value[0] = { invalid: false, filled: false };
    await nextTick();
    expect(updateValidity).toHaveBeenCalledTimes(calls);
  });

  it("forwards endpoint reasons and the original cancellation function", () => {
    const event = new Event("input");
    const original = createChangeDetails("input", event);
    const forwarded = rangeEndpointDetails("end", original.details);
    expect(forwarded.reason).toBe("end-input");
    expect(forwarded.event).toBe(event);
    expect(forwarded.cancel).toBe(original.details.cancel);
    forwarded.cancel();
    expect(original.canceled()).toBe(true);
    expect(rangeEndpointDetails("start", createChangeDetails("clear").details)).not.toHaveProperty("event");
  });
});
