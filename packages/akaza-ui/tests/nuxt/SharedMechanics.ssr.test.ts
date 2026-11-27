// @vitest-environment node
import { expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { usePopup } from "@/composables/internal/sdk/usePopup";
import { nextEnabledIndex } from "@/utils/nextEnabledIndex";
import { useRangeFieldState } from "@/utils/useRangeFieldState";
import { useSegmentFocus } from "@/utils/useSegmentFocus";

it("initializes shared interaction mechanics during SSR without DOM access", async () => {
  const measure = vi.fn(() => { throw new Error("Server render must not measure DOM"); });
  const updateValidity = vi.fn();
  const component = defineComponent({
    setup() {
      const root = ref<HTMLElement | null>(null);
      const position = usePopup({
        kind: "popover", open: ref(true), content: root,
        anchor: () => ({ getBoundingClientRect: measure }),
        side: () => "right", align: () => "start", cssVarPrefix: "akaza-test", request: vi.fn(),
      });
      const firstIndex = nextEnabledIndex([false, true], -1, 1, true, value => !value);
      const range = useRangeFieldState({ root, children: () => [undefined], updateValidity });
      useSegmentFocus({ parts: () => ["month", "year"] });
      return () => h("span", `${firstIndex}/${range.childFilled.value}/${position.actualSide.value}`);
    },
  });
  expect(await renderToString(createSSRApp(component))).toBe("<span>1/false/right</span>");
  await nextTick();
  expect(measure).not.toHaveBeenCalled();
  expect(updateValidity).not.toHaveBeenCalled();
});

it("does not bind, observe, measure, or read DOM during popup SSR with DOM globals present", async () => {
  const accessDOM = vi.fn(() => { throw new Error("SSR must not access DOM globals"); });
  const dom = new Proxy({}, { get: accessDOM });
  vi.stubGlobal("document", dom);
  vi.stubGlobal("window", dom);
  vi.stubGlobal("MutationObserver", accessDOM);
  vi.stubGlobal("ResizeObserver", accessDOM);
  const measure = vi.fn(() => { throw new Error("SSR must not measure popup anchors"); });
  const request = vi.fn();
  const component = defineComponent({
    setup() {
      const popup = usePopup({
        kind: "dialog", open: ref(true), content: ref(null),
        trigger: measure, anchor: measure, request,
      });
      return () => popup.present.value ? h("div", { ...popup.contentAttrs.value, "aria-label": "Task" }, "Popup") : null;
    },
  });
  try {
    const first = await renderToString(createSSRApp(component));
    expect(first).toContain('role="dialog"');
    expect(first).toContain('data-slot="akaza-dialog-popup-content"');
    expect(await renderToString(createSSRApp(component))).toBe(first);
    await nextTick();
    expect(accessDOM).not.toHaveBeenCalled();
    expect(measure).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
});
