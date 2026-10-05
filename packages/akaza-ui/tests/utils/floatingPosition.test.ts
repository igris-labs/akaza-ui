import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { useFloatingPosition } from "@/utils/floatingPosition";

describe("floating position", () => {
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
