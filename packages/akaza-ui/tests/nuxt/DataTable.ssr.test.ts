import type { DataTableColumn } from "@/components/data-table";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { DataTable } from "@/components/data-table";

interface Row {
  id: number;
  name: string;
}

describe("data table SSR", () => {
  it("renders deterministic native table markup", async () => {
    const columns: DataTableColumn<Row>[] = [
      { id: "select", type: "selection" },
      { accessor: "name", rowHeader: true },
    ];
    const app = createSSRApp(() => h(DataTable<Row>, {
      ariaLabel: "SSR members",
      columns,
      data: [{ id: 1, name: "Ada" }],
      rowKey: "id",
      selectionMode: "single",
    }));

    const html = await renderToString(app);
    expect(html).toContain('<table aria-label="SSR members"');
    expect(html).toContain('<th scope="row"');
    expect(html).toContain('type="radio"');
    expect(html).not.toContain("@tanstack");
  });
});
