import { describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { AppLayout } from "@/components/app-layout";
import { Sidebar } from "@/components/sidebar";

describe("application shell hydration", () => {
  it("hydrates desktop markup before switching to the mobile breakpoint", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const render = () => h(AppLayout, {}, {
      header: () => "Workspace",
      left: () => h(Sidebar, {}, { default: () => "Navigation" }),
      default: () => "Content",
    });
    const container = document.createElement("div");
    document.body.append(container);
    const client = createSSRApp({ render });
    try {
      container.innerHTML = await renderToString(createSSRApp({ render }));
      expect(container.querySelector("[data-akaza-mobile]")).toBeNull();
      client.mount(container);
      await nextTick();
      expect(container.querySelector(".akaza-sidebar-root")?.hasAttribute("data-akaza-mobile")).toBe(true);
      expect(container.querySelector(".akaza-sidebar-panel")).toBeNull();
      expect(warn.mock.calls.flat().filter(value => String(value).includes("Hydration"))).toEqual([]);
      expect(error.mock.calls.flat().filter(value => String(value).includes("Hydration"))).toEqual([]);
    } finally {
      client.unmount();
      container.remove();
      warn.mockRestore();
      error.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
