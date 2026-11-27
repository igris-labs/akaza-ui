import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { usePopup } from "@/composables/internal/sdk/usePopup";
import { installPopupTestEnvironment, settlePopup } from "../components/popover/popupTestEnvironment";

installPopupTestEnvironment();

beforeEach(() => {
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(window.innerWidth);
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(window.innerHeight);
});
afterEach(() => vi.restoreAllMocks());

function measure(element: HTMLElement, rect: DOMRect) {
  element.getBoundingClientRect = () => rect;
  Object.defineProperties(element, {
    offsetWidth: { configurable: true, get: () => rect.width },
    offsetHeight: { configurable: true, get: () => rect.height },
  });
}

async function reposition() {
  window.dispatchEvent(new Event("resize"));
  await settlePopup();
}

describe("sdk popup floating position", () => {
  function fixture(options: Partial<Parameters<typeof usePopup>[0]> = {}) {
    return mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null);
        const floating = ref<HTMLElement | null>(null);
        const arrow = ref<HTMLElement | null>(null);
        const active = ref(true);
        const side = ref<"bottom" | "right">("bottom");
        const align = ref<"start" | "end">("start");
        const matchWidth = ref(false);
        const teleport = ref(false);
        return { reference, floating, arrow, active, side, align, matchWidth, teleport, ...usePopup({
          kind: "popover", trigger: () => reference.value, content: floating, open: active,
          side: () => side.value, align: () => align.value, arrow, initialFocus: "none",
          matchWidth: () => matchWidth.value, request: next => { active.value = next; },
          cssVarPrefix: "akaza-test", ...options,
        }) };
      },
      template: '<div><button ref="reference" v-bind="triggerAttrs">Anchor</button><Teleport to="body" :disabled="!teleport"><div v-if="present" ref="floating" v-bind="contentAttrs" :style="style">Popup<span ref="arrow" data-slot="akaza-popover-popup-arrow" /></div></Teleport></div>',
    }), { attachTo: document.body });
  }

  it("uses SDK opposite-side collision handling and aliases its geometry variables", async () => {
    const wrapper = fixture({ sideOffset: () => 6 });
    try {
      await settlePopup();
      measure(wrapper.vm.reference!, new DOMRect(20, window.innerHeight - 30, 120, 24));
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 180, 80));
      await reposition();
      expect(wrapper.vm.actualSide).toBe("top");
      expect(wrapper.vm.floating!.style.position).toBe("fixed");
      expect(wrapper.vm.floating!.style.top).toBe(`${window.innerHeight - 116}px`);
      expect(wrapper.vm.floating!.style.getPropertyValue("--akaza-test-anchor-width")).toBe("120px");
      expect(wrapper.vm.floating!.style.getPropertyValue("--akaza-test-transform-origin"))
        .toBe(wrapper.vm.floating!.style.getPropertyValue("--transform-origin"));
    } finally { wrapper.unmount(); }
  });

  it("uses SDK clamping for virtual pointer anchors and follows updated coordinates", async () => {
    const point = ref({ x: window.innerWidth - 20, y: window.innerHeight - 20 });
    const anchor = { getBoundingClientRect: () => new DOMRect(point.value.x, point.value.y, 0, 0) };
    const wrapper = fixture({ anchor: () => anchor, side: () => "right", sideOffset: () => 4, alignOffset: () => 4 });
    try {
      await settlePopup();
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 100, 80));
      await reposition();
      expect(wrapper.vm.actualSide).toBe("left");
      expect(wrapper.vm.actualAlign).toBe("start");
      expect(Number.parseFloat(wrapper.vm.floating!.style.left)).toBeGreaterThanOrEqual(8);
      expect(Number.parseFloat(wrapper.vm.floating!.style.top)).toBeLessThanOrEqual(window.innerHeight - 88);
      point.value = { x: 20, y: 20 };
      await settlePopup();
      expect(wrapper.vm.actualSide).toBe("right");
      expect(wrapper.vm.floating!.style.left).toBe("24px");
      expect(wrapper.vm.floating!.style.top).toBe("24px");
    } finally { wrapper.unmount(); }
  });

  it("updates reactive placement and match-width policy without a second coordinate writer", async () => {
    const wrapper = fixture();
    try {
      await settlePopup();
      measure(wrapper.vm.reference!, new DOMRect(80, 120, 100, 20));
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 40, 40));
      wrapper.vm.matchWidth = true;
      await reposition();
      expect(wrapper.vm.floating!.style.width).toBe("100px");
      expect(wrapper.vm.floating!.style.left).toBe("80px");
      expect(wrapper.vm.floating!.style.top).toBe("140px");
      expect(wrapper.vm.style).not.toHaveProperty("left");
      expect(wrapper.vm.style).not.toHaveProperty("top");
      wrapper.vm.side = "right";
      await settlePopup();
      expect(wrapper.vm.floating!.style.left).toBe("180px");
      expect(wrapper.vm.floating!.style.top).toBe("120px");
      wrapper.vm.align = "end";
      wrapper.vm.matchWidth = false;
      await settlePopup();
      expect(wrapper.vm.actualAlign).toBe("end");
      expect(wrapper.vm.floating!.style.top).toBe("100px");
      expect(wrapper.vm.floating!.style.width).toBe("");
    } finally { wrapper.unmount(); }
  });

  it("stops SDK observations on close and does not bind after early unmount", async () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      observe = observe;
      unobserve() {}
      disconnect = disconnect;
    });
    try {
      const wrapper = fixture();
      await settlePopup();
      expect(observe).toHaveBeenCalled();
      const content = wrapper.vm.floating!;
      wrapper.vm.active = false;
      await settlePopup();
      expect(disconnect).toHaveBeenCalled();
      const previous = content.style.cssText;
      measure(wrapper.vm.reference!, new DOMRect(100, 100, 40, 20));
      window.dispatchEvent(new Event("resize"));
      await settlePopup();
      expect(content.style.cssText).toBe(previous);
      wrapper.unmount();
      const pending = fixture();
      pending.unmount();
      observe.mockClear();
      await settlePopup();
      expect(observe).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });

  it("keeps fixed SDK coordinates when a live popup moves through Teleport", async () => {
    const wrapper = fixture();
    try {
      await settlePopup();
      measure(wrapper.vm.reference!, new DOMRect(150, 150, 100, 40));
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 80, 60));
      await reposition();
      expect(wrapper.vm.floating!.style.position).toBe("fixed");
      expect(wrapper.vm.floating!.style.left).toBe("150px");
      wrapper.vm.teleport = true;
      await settlePopup();
      await reposition();
      expect(wrapper.vm.floating!.parentElement).toBe(document.body);
      expect(wrapper.vm.floating!.style.left).toBe("150px");
      expect(wrapper.vm.floating!.style.top).toBe("190px");
    } finally { wrapper.unmount(); }
  });

  it("lets SDK position an arrow while preserving consumer transforms", async () => {
    const wrapper = fixture();
    try {
      await settlePopup();
      measure(wrapper.vm.reference!, new DOMRect(100, 100, 80, 20));
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 100, 60));
      measure(wrapper.vm.arrow!, new DOMRect(0, 0, 8, 8));
      wrapper.vm.floating!.style.transform = "scale(0.98)";
      wrapper.vm.arrow!.style.transform = "rotate(45deg)";
      await reposition();
      expect(wrapper.vm.arrow!.dataset.side).toBe("bottom");
      expect(Number.parseFloat(wrapper.vm.arrow!.style.left)).toBeGreaterThanOrEqual(0);
      expect(Number.parseFloat(wrapper.vm.arrow!.style.left)).toBeLessThanOrEqual(92);
      expect(wrapper.vm.arrow!.style.transform).toBe("rotate(45deg)");
      expect(wrapper.vm.floating!.style.transform).toBe("scale(0.98)");
    } finally { wrapper.unmount(); }
  });

  it("aliases SDK available size instead of calculating a second viewport constraint", async () => {
    const wrapper = fixture({ constrainSize: true });
    try {
      await settlePopup();
      measure(wrapper.vm.reference!, new DOMRect(100, 100, 80, 20));
      measure(wrapper.vm.floating!, new DOMRect(0, 0, 100, 60));
      await reposition();
      const style = wrapper.vm.floating!.style;
      expect(style.maxWidth).toBe(style.getPropertyValue("--available-width"));
      expect(style.maxHeight).toBe(style.getPropertyValue("--available-height"));
      expect(style.overflow).toBe("auto");
      expect(Number.parseFloat(style.maxWidth)).toBeGreaterThan(0);
    } finally { wrapper.unmount(); }
  });
});
