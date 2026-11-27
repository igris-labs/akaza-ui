import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccordionSection from "../../../../playground/src/sections/accordion/AccordionSection.vue";
import CollapsibleSection from "../../../../playground/src/sections/collapsible/CollapsibleSection.vue";
import "./panel-motion";

vi.mock("akaza-ui", async () => ({
  ...await import("@/components/accordion"),
  ...await import("@/components/collapsible"),
}));

const mounted: Array<{ unmount: () => void }> = [];
beforeEach(() => { vi.useFakeTimers(); });
afterEach(async () => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  await vi.runAllTimersAsync();
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe.each(["accordion", "collapsible"] as const)("%s panel examples", kind => {
  it("shows retained drafts and unmount-on-exit drafts using actual components", async () => {
    const wrapper = mount(kind === "accordion" ? AccordionSection : CollapsibleSection, { attachTo: document.body });
    mounted.push(wrapper);
    const demo = wrapper.get(`[data-panel-lifecycle=${kind}]`);
    const panels = demo.findAll<HTMLElement>("[role=region]");
    const triggers = demo.findAll("button");
    expect(panels).toHaveLength(2);
    expect(panels.every(panel => panel.classes().includes(`panel-lifecycle-${kind}`))).toBe(true);
    expect(panels.every(panel => panel.attributes("hidden") !== undefined && panel.attributes("inert") !== undefined)).toBe(true);
    const retained = demo.get<HTMLInputElement>(`input[aria-label="Retained ${kind} draft"]`);
    expect(demo.find(`input[aria-label="Unmounted ${kind} draft"]`).exists()).toBe(false);
    await triggers[0]!.trigger("click");
    await vi.runAllTimersAsync();
    await retained.setValue("edited draft");
    await triggers[0]!.trigger("click");
    await vi.runAllTimersAsync();
    expect(panels[0]!.attributes("hidden")).toBeDefined();
    await triggers[0]!.trigger("click");
    await vi.runAllTimersAsync();
    expect(demo.get(`input[aria-label="Retained ${kind} draft"]`).element).toBe(retained.element);
    expect(retained.element.value).toBe("edited draft");
    await triggers[1]!.trigger("click");
    await vi.runAllTimersAsync();
    const lazy = demo.get<HTMLInputElement>(`input[aria-label="Unmounted ${kind} draft"]`);
    await lazy.setValue("temporary draft");
    await triggers[1]!.trigger("click");
    await vi.runAllTimersAsync();
    expect(demo.find(`input[aria-label="Unmounted ${kind} draft"]`).exists()).toBe(false);
    await triggers[1]!.trigger("click");
    await vi.runAllTimersAsync();
    const remounted = demo.get<HTMLInputElement>(`input[aria-label="Unmounted ${kind} draft"]`);
    expect(remounted.element).not.toBe(lazy.element);
    expect(remounted.element.value).toBe("Reset on close");
    expect(demo.findAll("[role=region]").map(panel => panel.element)).toEqual(panels.map(panel => panel.element));
  });

  it("documents SDK completion, dimensions, CSS hooks and default retention without adding forceMount", () => {
    const doc = readFileSync(resolve(__dirname, `../../../../docs/content/3.components/${kind}.md`), "utf8");
    expect(doc).toContain("bindPanel");
    expect(doc).toContain(`--akaza-${kind}-content-height`);
    expect(doc).toContain(`--akaza-${kind}-content-width`);
    expect(doc).toContain("data-starting-style");
    expect(doc).toContain("data-ending-style");
    expect(doc).toContain("after");
    expect(doc).toContain("There is no `forceMount` prop");
    expect(doc).toContain("prefers-reduced-motion: reduce");
    expect(doc).not.toContain("Only in DOM when open");
  });
});
