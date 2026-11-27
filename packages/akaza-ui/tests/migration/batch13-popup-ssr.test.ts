// @vitest-environment node
import { partAttrs, partPresent } from "@ui-sdk/core/testing";
import { describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h, onMounted, Teleport, useId } from "vue";
import { renderToString } from "vue/server-renderer";
import { batch13Dialog } from "./batch13-popup-fixture";

async function renderPopup(open: boolean, target: string | false = false) {
  const instances: ReturnType<typeof batch13Dialog>[] = [];
  const mounted = vi.fn();
  const context: { teleports?: Record<string, string> } = {};
  const View = defineComponent({
    setup() {
      const instance = batch13Dialog({ id: `batch13-${useId()}`, open });
      instances.push(instance);
      onMounted(mounted);
      const trigger = instance.part("trigger", {});
      const content = instance.part("content", {});
      return () => h("div", [
        h("button", partAttrs(trigger), "Open"),
        h(Teleport, { to: target || "body", disabled: target === false }, [
          partPresent(content) ? h("section", { ...partAttrs(content), role: "dialog", "aria-label": "Proof" }, "Server popup") : null,
        ]),
      ]);
    },
  });
  try {
    const html = await renderToString(createSSRApp(View), context);
    expect(mounted).not.toHaveBeenCalled();
    return { html, teleports: context.teleports };
  } finally {
    instances.forEach(instance => instance.destroy());
  }
}

describe("batch 13 Core popup + Vue SSR isolation", () => {
  it("renders initially-open and closed snapshots without DOM globals or client binds", async () => {
    expect(typeof document).toBe("undefined");
    const open = await renderPopup(true);
    const closed = await renderPopup(false);
    expect(open.html).toContain('role="dialog"');
    expect(open.html).toContain('aria-expanded="true"');
    expect(closed.html).not.toContain('role="dialog"');
    expect(closed.html).toContain('aria-expanded="false"');
  });

  it("keeps IDs/output deterministic across repeated and concurrent SSR apps", async () => {
    const first = await renderPopup(true);
    const simultaneous = await Promise.all(Array.from({ length: 5 }, () => renderPopup(true)));
    simultaneous.forEach(result => expect(result).toEqual(first));
    expect(await renderPopup(true)).toEqual(first);
  });

  it.each(["body", "#batch13-target"])("leaves Teleport target %s in Vue's SSR context", async target => {
    const result = await renderPopup(true, target);
    expect(result.html).not.toContain("Server popup");
    expect(result.teleports?.[target]).toContain('role="dialog"');
    expect(result.teleports?.[target]).toContain("Server popup");
  });
});
