import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { getFloatingArrowStyle, useFloatingPosition } from "@/utils/floatingPosition";

describe("floating position", () => {
  function fixture(options: Partial<Parameters<typeof useFloatingPosition>[0]> = {}) {
    return mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null);
        const floating = ref<HTMLElement | null>(null);
        const active = ref(true);
        const strategy = ref<"absolute" | "fixed">("absolute");
        return { reference, floating, active, strategy, ...useFloatingPosition({
          reference, floating, active, side: "bottom", align: "start", strategy,
          cssVarPrefix: "akaza-test", ...options,
        }) };
      },
      template: '<div><button ref="reference">Anchor</button><div ref="floating" :style="style">Popup</div></div>',
    }));
  }

  it("tries ordered alternatives on another axis when neither vertical side fits", async () => {
    const wrapper = fixture({ fallbackSides: ["bottom", "top", "right", "left"] });
    wrapper.vm.reference!.getBoundingClientRect = () => DOMRect.fromRect({ x: 50, y: window.innerHeight / 2, width: 20, height: 20 });
    wrapper.vm.floating!.getBoundingClientRect = () => DOMRect.fromRect({ width: 100, height: window.innerHeight - 20 });
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.vm.actualSide).toBe("right");
    expect(wrapper.vm.floating!.style.left).toBe("70px");
    wrapper.unmount();
  });

  it("preserves an explicitly nonflipping caller's side and clamps its coordinates", async () => {
    const wrapper = fixture({ flip: false, collisionPadding: 4 });
    wrapper.vm.reference!.getBoundingClientRect = () => DOMRect.fromRect({ x: 50, y: window.innerHeight - 20, width: 20, height: 20 });
    wrapper.vm.floating!.getBoundingClientRect = () => DOMRect.fromRect({ width: 100, height: 80 });
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.vm.actualSide).toBe("bottom");
    expect(wrapper.vm.floating!.style.top).toBe(`${window.innerHeight - 84}px`);
    wrapper.unmount();
  });

  it("supports virtual pointer anchors and flips cross-axis alignment above the pointer", async () => {
    const pointer = ref({ x: window.innerWidth - 20, y: window.innerHeight - 20 });
    const reference = ref({ getBoundingClientRect: () => new DOMRect(pointer.value.x, pointer.value.y, 0, 0) });
    const wrapper = fixture({ reference, side: "right", strategy: "fixed", alignOffset: 4, sideOffset: 4, flipAlign: true });
    wrapper.vm.floating!.getBoundingClientRect = () => DOMRect.fromRect({ width: 100, height: 80 });
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.vm.actualSide).toBe("left");
    expect(wrapper.vm.actualAlign).toBe("end");
    expect(wrapper.vm.floating!.style.left).toBe(`${pointer.value.x - 104}px`);
    expect(wrapper.vm.floating!.style.top).toBe(`${pointer.value.y - 84}px`);
    pointer.value = { x: 20, y: 20 };
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.vm.actualSide).toBe("right");
    expect(wrapper.vm.actualAlign).toBe("start");
    expect(wrapper.vm.floating!.style.top).toBe("24px");
    wrapper.unmount();
  });

  it("converts absolute coordinates through scrolled offset parents and reacts to strategy changes", async () => {
    const wrapper = fixture();
    const parent = document.createElement("div");
    parent.scrollTop = 20;
    parent.scrollLeft = 7;
    parent.getBoundingClientRect = () => DOMRect.fromRect({ x: 40, y: 100 });
    let offsetParent: HTMLElement | null = parent;
    Object.defineProperty(wrapper.vm.floating!, "offsetParent", { get: () => offsetParent });
    wrapper.vm.reference!.getBoundingClientRect = () => DOMRect.fromRect({ x: 80, y: 120, width: 100, height: 20 });
    wrapper.vm.floating!.getBoundingClientRect = () => DOMRect.fromRect({ width: 40, height: 40 });
    wrapper.vm.update();
    await nextTick();
    expect(wrapper.vm.floating!.style.left).toBe("47px");
    expect(wrapper.vm.floating!.style.top).toBe("60px");
    offsetParent = null;
    wrapper.vm.strategy = "fixed";
    await nextTick();
    expect(wrapper.vm.floating!.style.position).toBe("fixed");
    expect(wrapper.vm.floating!.style.left).toBe("80px");
    expect(wrapper.vm.floating!.style.top).toBe("140px");
    wrapper.unmount();
  });

  it("removes listeners and observers when closed and when unmounted during pending setup", async () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    const remove = vi.spyOn(window, "removeEventListener");
    vi.stubGlobal("ResizeObserver", class {
      observe = observe;
      disconnect = disconnect;
    });
    try {
      const wrapper = fixture();
      await flushPromises();
      expect(observe).toHaveBeenCalled();
      wrapper.vm.active = false;
      await nextTick();
      expect(disconnect).toHaveBeenCalled();
      expect(remove).toHaveBeenCalledWith("scroll", wrapper.vm.update, { capture: true });
      wrapper.unmount();
      const pending = fixture();
      pending.unmount();
      observe.mockClear();
      await flushPromises();
      expect(observe).not.toHaveBeenCalled();
    } finally {
      remove.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it("measures after reactive Teleport changes move the popup to a different offset parent", async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null);
        const floating = ref<HTMLElement | null>(null);
        const teleport = ref(false);
        return { reference, floating, teleport, ...useFloatingPosition({
          reference, floating, active: true, side: "bottom", align: "start",
          strategy: () => teleport.value ? "fixed" : "absolute", cssVarPrefix: "akaza-test",
        }) };
      },
      template: '<div ref="reference"><Teleport to="body" :disabled="!teleport"><div ref="floating" :style="style">Popup</div></Teleport></div>',
    }), { attachTo: document.body });
    try {
      const root = wrapper.vm.reference!;
      const content = wrapper.vm.floating!;
      root.getBoundingClientRect = () => DOMRect.fromRect({ x: 150, y: 150, width: 100, height: 40 });
      content.getBoundingClientRect = () => DOMRect.fromRect({ width: 80, height: 60 });
      Object.defineProperty(content, "offsetParent", { get: () => root.contains(content) ? root : null });
      wrapper.vm.update();
      await nextTick();
      expect(content.style.left).toBe("0px");
      expect(content.style.top).toBe("40px");
      wrapper.vm.teleport = true;
      await nextTick();
      expect(content.parentElement).toBe(document.body);
      expect(content.style.position).toBe("fixed");
      expect(content.style.left).toBe("150px");
      expect(content.style.top).toBe("190px");
    } finally {
      wrapper.unmount();
    }
  });

  it("clamps arrow coordinates using untransformed viewport geometry", () => {
    const geometry = { reference: DOMRect.fromRect({ x: 0, y: 0, width: 20, height: 20 }), width: 100, height: 80, left: 40, top: 40 };
    expect(getFloatingArrowStyle(null, 8)).toEqual({});
    expect(getFloatingArrowStyle({ ...geometry, side: "bottom" }, 8)).toEqual({ left: "4px", top: "-4px" });
    expect(getFloatingArrowStyle({ ...geometry, side: "left" }, 8)).toEqual({ top: "4px", right: "-4px" });
    expect(getFloatingArrowStyle({ ...geometry, side: "top", reference: DOMRect.fromRect({ x: 500, width: 20 }) }, 8)).toEqual({ left: "88px", bottom: "-4px" });
  });

  it("flips, clamps, and exposes geometry variables", async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null);
        const floating = ref<HTMLElement | null>(null);
        const position = useFloatingPosition({
          reference,
          floating,
          active: true,
          side: "bottom",
          align: "start",
          sideOffset: 6,
          matchWidth: true,
          cssVarPrefix: "akaza-test",
        });
        return { reference, floating, ...position };
      },
      template: `
        <div>
          <button ref="reference">Trigger</button>
          <div ref="floating" class="popup" :style="style">Popup</div>
        </div>
      `,
    }));
    const reference = wrapper.find("button").element as HTMLElement;
    const floating = wrapper.find(".popup").element as HTMLElement;
    reference.getBoundingClientRect = () => DOMRect.fromRect({
      x: 20,
      y: window.innerHeight - 30,
      width: 120,
      height: 24,
    });
    floating.getBoundingClientRect = () => DOMRect.fromRect({ width: 180, height: 80 });

    (wrapper.vm as unknown as { update: () => void }).update();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as unknown as { actualSide: string }).actualSide).toBe("top");
    expect(floating.style.width).toBe("120px");
    expect(floating.style.getPropertyValue("--akaza-test-anchor-width")).toBe("120px");
    expect(Number.parseFloat(floating.style.left)).toBeGreaterThanOrEqual(8);
    wrapper.unmount();
  });

  it("constrains oversized fixed panels and ignores document scroll offsets", async () => {
    const scroll = vi.spyOn(window, "scrollY", "get").mockReturnValue(400);
    const wrapper = mount(defineComponent({
      setup() {
        const reference = ref<HTMLElement | null>(null);
        const floating = ref<HTMLElement | null>(null);
        return { reference, floating, ...useFloatingPosition({ reference, floating, active: true, side: "right", align: "start", strategy: "fixed", constrainSize: true, cssVarPrefix: "akaza-test" }) };
      },
      template: '<div><button ref="reference">Trigger</button><div ref="floating" class="popup" :style="style">Popup</div></div>',
    }));
    try {
      const reference = wrapper.get("button").element as HTMLElement;
      const floating = wrapper.get(".popup").element as HTMLElement;
      reference.getBoundingClientRect = () => DOMRect.fromRect({ x: window.innerWidth - 32, y: window.innerHeight - 32, width: 24, height: 24 });
      floating.getBoundingClientRect = () => DOMRect.fromRect({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
      (wrapper.vm as unknown as { update: () => void }).update();
      await flushPromises();
      expect(floating.style.position).toBe("fixed");
      expect(floating.style.left).toBe("8px");
      expect(floating.style.top).toBe("8px");
      expect(floating.style.maxWidth).toBe(`${window.innerWidth - 16}px`);
      expect(floating.style.maxHeight).toBe(`${window.innerHeight - 16}px`);
      expect(floating.style.overflow).toBe("auto");
    } finally {
      wrapper.unmount();
      scroll.mockRestore();
    }
  });
});
