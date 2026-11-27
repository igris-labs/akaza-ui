// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { HoverPreviewCard } from "@/components/hover-preview-card";
import { Popover } from "@/components/popover";
import { Tooltip } from "@/components/tooltip";

describe("anchored popup pure Vue SSR", () => {
  it.each([false, true])("renders deterministic inline state for open=%s without DOM globals", async open => {
    const render = () => renderToString(createSSRApp({
      render: () => h("main", [
        h(Popover, { modelValue: open, teleport: false, transition: false }, {
          trigger: ({ triggerProps }: { triggerProps: object }) => h("button", triggerProps, "Options"),
          content: () => "Popover content",
        }),
        h(Tooltip, { modelValue: open, teleport: false, transition: false, arrow: true }, {
          trigger: ({ triggerProps }: { triggerProps: object }) => h("button", triggerProps, "Help"),
          content: () => "Tooltip content",
        }),
        h(HoverPreviewCard, { modelValue: open, teleport: false, forceMount: true, arrow: true }, {
          trigger: ({ triggerProps }: { triggerProps: object }) => h("button", triggerProps, "Profile"),
          content: () => "Hover content",
        }),
      ]),
    }));
    const html = await render();
    expect(html).toBe(await render());
    expect(html).toContain(`data-akaza-state="${open ? "open" : "closed"}"`);
    expect(html).toContain("Tooltip content");
    expect(html).toContain("Hover content");
    expect(html).toContain('data-slot="akaza-tooltip-popup-arrow"');
    expect(html).toContain('data-slot="akaza-hover-popup-arrow"');
    const tooltipId = /data-slot="akaza-tooltip-popup-content" id="([^"]+)"/.exec(html)?.[1];
    expect(tooltipId).toBeTruthy();
    expect(html).toContain(`aria-describedby="${tooltipId}"`);
    expect(html.includes("Popover content")).toBe(open);
    if (!open) {
      expect(html).toContain("hidden");
      expect(html).toContain("inert");
      expect(html).toMatch(/<div[^>]*hidden[^>]*class="akaza-hover-preview-card-content"/);
    }
  });

  it("keeps custom teleport target output separate for each server request", async () => {
    const render = async () => {
      const context: { teleports?: Record<string, string> } = {};
      const html = await renderToString(createSSRApp({
        render: () => h(Popover, { modelValue: true, teleport: "#popup-target", transition: false }, {
          trigger: () => h("button", "Options"),
          content: () => "Teleported preview",
        }),
      }), context);
      return { html, teleports: context.teleports };
    };
    const first = await render();
    expect(first.html).not.toContain("Teleported preview");
    expect(first.teleports?.["#popup-target"]).toContain("Teleported preview");
    expect(await render()).toEqual(first);
  });
});
