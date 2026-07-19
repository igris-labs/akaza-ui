import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { useFloatingPosition } from "./floatingPosition";

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
  });
});
