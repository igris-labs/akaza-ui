// @vitest-environment node
import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { useFloatingPosition } from "@/utils/floatingPosition";
import { useRangeFieldState } from "@/utils/useRangeFieldState";
import { useRovingFocus } from "@/utils/useRovingFocus";
import { useSegmentFocus } from "@/utils/useSegmentFocus";

it("initializes shared interaction mechanics during SSR without DOM access", async () => {
  const measure = vi.fn(() => { throw new Error("Server render must not measure DOM"); });
  const updateValidity = vi.fn();
  const component = defineComponent({
    setup() {
      const root = ref<HTMLElement | null>(null);
      const position = useFloatingPosition({
        reference: ref({ getBoundingClientRect: measure }), floating: root,
        active: true, side: "right", align: "start", strategy: "fixed", cssVarPrefix: "akaza-test",
      });
      const roving = useRovingFocus({ items: [false, true], isDisabled: value => !value, loop: true });
      const range = useRangeFieldState({ root, children: () => [undefined], updateValidity });
      useSegmentFocus({ parts: () => ["month", "year"] });
      return () => h("span", `${roving.firstIndex.value}/${range.childFilled.value}/${position.actualSide.value}`);
    },
  });
  expect(await renderToString(createSSRApp(component))).toBe("<span>1/false/right</span>");
  await nextTick();
  expect(measure).not.toHaveBeenCalled();
  expect(updateValidity).not.toHaveBeenCalled();
});
