import type { FieldContext, FieldControlState } from "@/components/field/context";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, nextTick, ref } from "vue";
import { createChangeDetails } from "@/utils/changeEvent";
import { clampNumber, snapToStep } from "@/utils/number";
import { useFieldControl } from "@/utils/useFieldControl";
import { useModalLifecycle } from "@/utils/useModalLifecycle";

describe("shared change details", () => {
  it("keeps cancellation isolated and preserves the originating event", () => {
    const event = new Event("click");
    const first = createChangeDetails("select", event);
    const second = createChangeDetails("clear");
    first.details.cancel();
    first.details.cancel();
    expect(first.canceled()).toBe(true);
    expect(second.canceled()).toBe(false);
    expect(first.details.event).toBe(event);
    expect(second.details).not.toHaveProperty("event");
  });
});

describe("shared numeric steps", () => {
  it("snaps decimals, scientific notation, and nonzero origins", () => {
    expect(snapToStep(0.31, 0.1)).toBe(0.3);
    expect(snapToStep(2.1e-7, 1e-7)).toBe(2e-7);
    expect(snapToStep(3.1e-7, 1e-7, 1e-8)).toBe(3.1e-7);
    expect(snapToStep(8, 3, 2)).toBe(8);
    expect(snapToStep(0.3, 0)).toBe(0.3);
    expect(snapToStep(0.3, -1)).toBe(0.3);
  });

  it("keeps optional bounds and clamping independent of snapping", () => {
    expect(clampNumber(8)).toBe(8);
    expect(clampNumber(8, undefined, 5)).toBe(5);
    expect(clampNumber(-3, 0)).toBe(0);
    expect(clampNumber(snapToStep(9, 4), 0, 7)).toBe(7);
  });
});

describe("shared Field bridge", () => {
  it("registers live interaction state, separates validity from reveal, and unregisters", () => {
    let registered: FieldControlState | undefined;
    const unregister = vi.fn();
    const field = {
      registerControl: (state: FieldControlState) => {
        registered = state;
        return unregister;
      },
    } as FieldContext;
    const touched = ref(false);
    const wrapper = mount(defineComponent({
      setup() {
        const bridge = useFieldControl(field);
        bridge.registerControl({ dirty: computed(() => touched.value), touched, filled: computed(() => false), focused: ref(false) });
        return bridge;
      },
      template: "<input required>",
    }));
    const input = wrapper.get("input").element;
    wrapper.vm.syncValidity(input, false);
    expect(registered!.validity.value?.valid).toBe(false);
    expect(registered!.invalid.value).toBe(false);
    touched.value = true;
    expect(registered!.dirty.value).toBe(true);
    wrapper.vm.syncValidity(input, true);
    expect(registered!.invalid.value).toBe(true);
    expect(registered!.validationMessage.value).not.toBe("");
    input.value = "Accepted";
    wrapper.vm.syncValidity(input, true);
    expect(registered!.invalid.value).toBe(false);
    expect(registered!.validationMessage.value).toBe("");
    wrapper.unmount();
    expect(unregister).toHaveBeenCalledOnce();
  });
});

describe("shared modal lifecycle", () => {
  function fixture() {
    return mount(defineComponent({
      setup() {
        const open = ref(true);
        const content = ref<HTMLElement | null>(null);
        const overlay = ref<HTMLElement | null>(null);
        useModalLifecycle({ open, content, overlay, onEscape: () => { open.value = false; } });
        return { open, content, overlay };
      },
      template: '<div><div v-if="open" ref="overlay"></div><div v-if="open" ref="content" tabindex="-1"><button>Inside</button></div></div>',
    }), { attachTo: document.body });
  }

  it("does not activate a queued open after unmount", async () => {
    const overflow = document.body.style.overflow;
    const wrapper = fixture();
    wrapper.unmount();
    await nextTick();
    expect(document.body.style.overflow).toBe(overflow);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("handles initially open state and restores body state after closing", async () => {
    const overflow = document.body.style.overflow;
    const wrapper = fixture();
    await nextTick();
    expect(document.body.style.overflow).toBe("hidden");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(wrapper.vm.open).toBe(false);
    expect(document.body.style.overflow).toBe(overflow);
    wrapper.unmount();
  });
});
