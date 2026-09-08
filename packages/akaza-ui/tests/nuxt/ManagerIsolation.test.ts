import { describe, expect, it } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
// @vitest-environment node
import { renderToString } from "vue/server-renderer";
import { useOverlay, useToast } from "@/index";

describe("sSR manager isolation", () => {
  it("isolates separate requests while sharing within one app", async () => {
    const captures: Array<{ toasts: number; overlays: number }> = [];
    const Overlay = defineComponent({ render: () => h("div") });
    const Child = defineComponent({ setup() {
      captures.push({ toasts: useToast().toasts.value.length, overlays: useOverlay().overlays.length });
      return () => h("div");
    } });
    const app = (populate: boolean) => createSSRApp(defineComponent({ setup() {
      if (populate) {
        useToast().add({ title: "private" });
        useOverlay().create(Overlay).open();
      }
      return () => h(Child);
    } }));
    await renderToString(app(true));
    await renderToString(app(false));
    expect(captures).toEqual([{ toasts: 1, overlays: 1 }, { toasts: 0, overlays: 0 }]);
  });
});
