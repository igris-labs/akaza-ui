// @vitest-environment node
import type { DataTableColumn } from "@/components/data-table";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { DataTable } from "@/components/data-table";

const rows = [{ id: 1, name: "Number" }, { id: "1", name: "String" }];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
  { id: "order", type: "reorder", resizable: false, reorderable: false },
  { accessor: "name", header: "Name", size: 140, minSize: 100, maxSize: 200 },
];

function render() {
  return renderToString(createSSRApp(() => h(DataTable<(typeof rows)[number]>, {
    data: rows,
    columns,
    rowKey: "id",
    dir: "rtl",
    rowReorder: true,
    columnReorder: true,
    columnResize: { update: "end" },
    ariaLabel: "Server table",
    columnSizing: { name: 160 },
    rowOrder: ["1", 1],
    ui: { resizeHandle: "resize-hook", liveRegion: "live-hook" },
  }, {
    "resize-handle": () => "Resize content",
    "reorder-handle": () => "Move content",
  })));
}

describe("batch 16 DataTable SSR isolation", () => {
  it("renders deterministic gesture handles, slots, classes and distinct keys without DOM globals", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const html = await render();
    expect(await render()).toBe(html);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('aria-label="Server table"');
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-valuenow="160"');
    expect(html).toContain('aria-valuemin="100"');
    expect(html).toContain('aria-valuemax="200"');
    expect(html).toContain("resize-hook akaza-data-table-resize-handle");
    expect(html).toContain("live-hook akaza-data-table-live-region");
    expect(html).toContain("Resize content");
    expect(html).toContain("Move content");
    expect(html.indexOf("-row-string-1")).toBeLessThan(html.indexOf("-row-number-1"));
    expect(html).not.toMatch(/data-slot|--drag-|@ui-sdk|@tanstack/);
  });

  it("keeps one component-owned polite atomic region and non-submitting reorder buttons", async () => {
    const html = await render();
    expect(html.match(/aria-live="polite"/g)).toHaveLength(1);
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain("2 results");
    const buttons = html.match(/<button\b[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(4);
    expect(buttons.every(button => button.includes('type="button"'))).toBe(true);
  });
});
