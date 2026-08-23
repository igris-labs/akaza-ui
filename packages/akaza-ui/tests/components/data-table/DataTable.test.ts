import type { DataTableColumn, DataTablePaginationState, DataTableRowKey } from "@/components/data-table";
import { mount } from "@vue/test-utils";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { createDataTableColumnHelper, DataTable } from "@/components/data-table";

interface Person {
  id: number;
  name: string;
  role: string;
  age: number;
  children?: Person[];
}

const people: Person[] = [
  { id: 1, name: "Ada Lovelace", role: "Engineer", age: 36 },
  { id: 2, name: "Grace Hopper", role: "Admiral", age: 85 },
  { id: 3, name: "Margaret Hamilton", role: "Engineer", age: 33 },
];

const columns: DataTableColumn<Person>[] = [
  { id: "select", type: "selection", header: "Select", size: 44 },
  { accessor: "name", header: "Name", sortable: true },
  { accessor: "role", header: "Role", filterable: true },
  { accessor: "age", header: "Age", sortable: true },
];

describe("data table", () => {
  it("renders native table semantics, render functions, named slots, and styling hooks", () => {
    const renderColumns: DataTableColumn<Person>[] = [
      { accessor: "name", header: () => h("strong", "Person") },
      {
        accessor: "role",
        header: "Role",
        cell: ({ value }) => h("em", String(value)),
        ui: { column: "role-column", header: "role-header", cell: "role-cell" },
      },
    ];
    const wrapper = mount(DataTable<Person>, {
      props: { data: people, columns: renderColumns, rowKey: "id", caption: "Team" },
      slots: {
        "name-cell": ({ value }: { value: string }) => h("span", { class: "person-name" }, value),
      },
      attrs: { class: "consumer-root" },
    });

    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.classes()).toContain("consumer-root");
    expect(wrapper.get("table caption").text()).toBe("Team");
    expect(wrapper.get("th strong").text()).toBe("Person");
    expect(wrapper.findAll(".person-name")[0]!.text()).toBe("Ada Lovelace");
    expect(wrapper.findAll(".role-cell em")[0]!.text()).toBe("Engineer");
    expect(wrapper.get(".role-header").attributes("data-akaza-column")).toBe("role");
    expect(wrapper.findAll("tbody tr.akaza-data-table-row")).toHaveLength(3);
  });

  it("sorts rows while selection remains attached to stable row keys", async () => {
    const wrapper = mount(defineComponent({
      components: { DataTable },
      setup() {
        const selection = ref<DataTableRowKey[]>([1]);
        return { columns, people, selection };
      },
      template: `
        <DataTable
          v-model:selection="selection"
          :data="people"
          :columns="columns"
          row-key="id"
          selection-mode="multiple"
        />
      `,
    }));

    const nameSort = wrapper.get("th[data-akaza-column='name'] button");
    await nameSort.trigger("click");
    await nameSort.trigger("click");

    const names = wrapper.findAll("tbody tr.akaza-data-table-row td[data-akaza-column='name']").map((cell) => cell.text());
    expect(names).toEqual(["Margaret Hamilton", "Grace Hopper", "Ada Lovelace"]);
    expect(wrapper.get("tr[data-akaza-row-key='1']").attributes("data-akaza-selected")).toBe("true");
    expect((wrapper.vm as unknown as { selection: DataTableRowKey[] }).selection).toEqual([1]);
  });

  it("filters through the Vue-native controller and paginates client rows", async () => {
    const wrapper = mount(defineComponent({
      components: { DataTable },
      setup() {
        const pagination = ref({ page: 1, pageSize: 1 });
        const filter = ref("");
        function updateFilter(table: { setGlobalFilter: (value: string, event?: Event) => boolean }, event: Event) {
          table.setGlobalFilter((event.target as HTMLInputElement).value, event);
        }
        return { columns, filter, pagination, people, updateFilter };
      },
      template: `
        <DataTable
          v-model:global-filter="filter"
          v-model:pagination="pagination"
          :data="people"
          :columns="columns"
          row-key="id"
          paginate
        >
          <template #toolbar="{ table }">
            <input aria-label="Filter people" @input="updateFilter(table, $event)">
          </template>
        </DataTable>
      `,
    }));

    expect(wrapper.findAll("tbody tr.akaza-data-table-row")).toHaveLength(1);
    await wrapper.get(".akaza-pagination-next").trigger("click");
    await Promise.resolve();
    await nextTick();
    expect(wrapper.findComponent({ name: "Pagination" }).emitted("value-change")?.[0]?.[0]).toBe(2);
    expect(wrapper.getComponent(DataTable).emitted("pagination-change")?.[0]?.[0]).toEqual({ page: 2, pageSize: 1 });
    expect((wrapper.vm as unknown as { pagination: DataTablePaginationState }).pagination).toEqual({ page: 2, pageSize: 1 });
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Grace Hopper");

    await wrapper.get("input[aria-label='Filter people']").setValue("Hamilton");
    await nextTick();
    await Promise.resolve();
    await nextTick();
    expect((wrapper.vm as unknown as { filter: string }).filter).toBe("Hamilton");
    expect((wrapper.vm as unknown as { pagination: DataTablePaginationState }).pagination.page).toBe(1);
    expect(wrapper.getComponent(DataTable).props("globalFilter")).toBe("Hamilton");
    expect(wrapper.getComponent(DataTable).props("pagination")).toEqual({ page: 1, pageSize: 1 });
    const exposed = wrapper.getComponent(DataTable).vm as unknown as {
      table: {
        globalFilter: { value: string };
        pagination: { value: DataTablePaginationState };
      };
    };
    expect(exposed.table.globalFilter.value).toBe("Hamilton");
    expect(exposed.table.pagination.value.page).toBe(1);
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Margaret Hamilton");
  });

  it("supports grouped headers, expansion, and cancelable selection", async () => {
    const onSelectionChange = vi.fn((_value, details) => details.cancel());
    const groupedColumns: DataTableColumn<Person>[] = [
      { id: "expand", type: "expander", header: "Details" },
      {
        id: "identity",
        header: "Identity",
        children: [
          { accessor: "name", header: "Name" },
          { accessor: "role", header: "Role" },
        ],
      },
      { id: "select", type: "selection", header: "Select" },
    ];
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns: groupedColumns,
        rowKey: "id",
        selectionMode: "multiple",
        isRowExpandable: () => true,
        onSelectionChange,
      },
      slots: {
        expanded: ({ row }: { row: { original: Person } }) => h("div", { class: "details" }, row.original.name),
      },
    });

    expect(wrapper.findAll("thead tr")).toHaveLength(2);
    expect(wrapper.get("th[data-akaza-column='identity']").attributes("colspan")).toBe("2");
    await wrapper.findAll(".akaza-data-table-expansion-trigger")[0]!.trigger("click");
    expect(wrapper.get(".details").text()).toBe("Ada Lovelace");

    const selectionControl = wrapper.findAll("tbody .akaza-data-table-selection-control")[0]!;
    await selectionControl.trigger("click");
    expect(onSelectionChange).toHaveBeenCalledOnce();
    expect((selectionControl.element as HTMLInputElement).checked).toBe(false);
    expect(wrapper.get("tr[data-akaza-row-key='1']").attributes("data-akaza-selected")).toBeUndefined();
  });

  it("resizes columns and reorders columns and rows with the keyboard", async () => {
    const reorderColumns: DataTableColumn<Person>[] = [
      { id: "reorder", type: "reorder", header: "Order", size: 40 },
      { accessor: "name", header: "Name", resizable: true },
      { accessor: "role", header: "Role" },
    ];
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns: reorderColumns,
        rowKey: "id",
        columnResize: true,
        columnReorder: true,
        rowReorder: true,
      },
    });

    const resize = wrapper.get("th[data-akaza-column='name'] .akaza-data-table-resize-handle");
    await resize.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:columnSizing")?.[0]?.[0]).toMatchObject({ name: 160 });

    const columnHandle = wrapper.get("th[data-akaza-column='name'] .akaza-data-table-column-reorder-handle");
    await columnHandle.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("update:columnOrder")?.[0]?.[0]).toEqual(["reorder", "role", "name"]);

    const rowHandle = wrapper.findAll(".akaza-data-table-reorder-handle")[0]!;
    await rowHandle.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("update:rowOrder")?.[0]?.[0]).toEqual([2, 1, 3]);
  });

  it("requires explicit ids for display and function-accessor columns", () => {
    expect(() => mount(DataTable<Person>, {
      props: {
        data: people,
        columns: [{ header: "Missing id" }],
        rowKey: "id",
      },
    })).toThrow("requires an id");
  });

  it("reacts to programmatic model changes without exposing the table engine", async () => {
    const wrapper = mount(defineComponent({
      components: { DataTable },
      setup() {
        const filter = ref("");
        const pagination = ref({ page: 1, pageSize: 1 });
        function applyFilter() {
          filter.value = "Hamilton";
          pagination.value = { page: 1, pageSize: 1 };
        }
        return { applyFilter, columns, filter, pagination, people };
      },
      template: `
        <button class="next-page" @click="pagination = { page: 2, pageSize: 1 }">Next</button>
        <button class="filter" @click="applyFilter">Filter</button>
        <DataTable
          v-model:global-filter="filter"
          v-model:pagination="pagination"
          :data="people"
          :columns="columns"
          row-key="id"
          paginate
        />
      `,
    }));

    await wrapper.get(".next-page").trigger("click");
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Grace Hopper");

    await wrapper.get(".filter").trigger("click");
    await nextTick();
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Margaret Hamilton");
  });

  it("calls each column renderer once and forwards footer attributes", () => {
    const cell = vi.fn(({ value }) => h("span", String(value)));
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people.slice(0, 1),
        columns: [{
          accessor: "name",
          header: "Name",
          cell,
          footer: "One member",
          attrs: { footer: { "data-summary": "members" } },
        }],
        rowKey: "id",
      },
    });

    expect(cell).toHaveBeenCalledOnce();
    expect(wrapper.get(".akaza-data-table-footer-cell").attributes("data-summary")).toBe("members");
  });

  it("keeps number and string row keys distinct in DOM and selection state", () => {
    const rows = [
      { id: 1 as DataTableRowKey, name: "Number" },
      { id: "1" as DataTableRowKey, name: "String" },
    ];
    const wrapper = mount(DataTable<(typeof rows)[number]>, {
      props: {
        data: rows,
        columns: [{ accessor: "name", header: "Name" }],
        rowKey: "id",
        selection: [1],
        selectionMode: "multiple",
      },
    });

    const renderedRows = wrapper.findAll(".akaza-data-table-row");
    expect(renderedRows[0]!.attributes("data-akaza-row-id")).toMatch(/-row-number-1$/);
    expect(renderedRows[1]!.attributes("data-akaza-row-id")).toMatch(/-row-string-1$/);
    expect(renderedRows[0]!.attributes("data-akaza-selected")).toBe("true");
    expect(renderedRows[1]!.attributes("data-akaza-selected")).toBeUndefined();
  });

  it("clamps stale pagination when the available data shrinks", async () => {
    const wrapper = mount(defineComponent({
      components: { DataTable },
      setup() {
        const data = ref(people);
        const pagination = ref({ page: 3, pageSize: 1 });
        return { columns, data, pagination };
      },
      template: `
        <button class="shrink" @click="data = data.slice(0, 1)">Shrink</button>
        <DataTable
          v-model:pagination="pagination"
          :data="data"
          :columns="columns"
          row-key="id"
          paginate
        />
      `,
    }));

    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Margaret Hamilton");
    await wrapper.get(".shrink").trigger("click");
    await nextTick();
    expect((wrapper.vm as unknown as { pagination: DataTablePaginationState }).pagination.page).toBe(1);
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Ada Lovelace");
  });

  it("applies initial state to columns added after mount and reads replaced function props", async () => {
    const dynamicColumns = ref<DataTableColumn<Person>[]>([{ accessor: "name", header: "Name" }]);
    const selectable = ref(true);
    const wrapper = mount(defineComponent({
      components: { DataTable },
      setup() {
        return { columns: dynamicColumns, people, selectable };
      },
      template: `
        <button class="add" @click="columns = [...columns, { accessor: 'role', header: 'Role', hidden: true, pinned: 'end' }]">Add</button>
        <button class="disable" @click="selectable = false">Disable</button>
        <DataTable
          :data="people"
          :columns="columns"
          row-key="id"
          selection-mode="multiple"
          :is-row-selectable="() => selectable"
        />
      `,
    }));

    await wrapper.get(".add").trigger("click");
    const component = wrapper.getComponent(DataTable);
    const exposed = component.vm as unknown as {
      table: { columnPinning: { value: { end: string[] } }; getColumn: (id: string) => { visible: boolean } };
    };
    expect(exposed.table.getColumn("role").visible).toBe(false);
    expect(exposed.table.columnPinning.value.end).toContain("role");

    await wrapper.get(".disable").trigger("click");
    expect(component.get("tr[data-akaza-row-key='1']").attributes("data-akaza-disabled")).toBe("true");
  });

  it("rejects duplicate columns, duplicate rows, invalid keys, and circular hierarchies", () => {
    expect(() => mount(DataTable<Person>, {
      props: {
        data: people,
        columns: [{ accessor: "name" }, { id: "name", accessor: "role" }],
        rowKey: "id",
      },
    })).toThrow("column id \"name\" is duplicated");

    expect(() => mount(DataTable<Person>, {
      props: { data: [people[0]!, { ...people[1]!, id: 1 }], columns, rowKey: "id" },
    })).toThrow("rowKey \"1\" is duplicated");

    expect(() => mount(DataTable<Person>, {
      props: { data: people, columns, rowKey: () => Number.NaN },
    })).toThrow(TypeError);

    const parent = { ...people[0]!, children: [] as Person[] };
    parent.children.push(parent);
    expect(() => mount(DataTable<Person>, {
      props: { data: [parent], columns, rowKey: "id", getSubRows: row => row.children },
    })).toThrow("circular row hierarchy");
  });

  it("keeps built-in controls when generic slots customize their content", () => {
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people.slice(0, 1),
        columns: [{ id: "select", type: "selection" }, { accessor: "name", sortable: true }],
        rowKey: "id",
        selectionMode: "multiple",
      },
      slots: {
        header: ({ column }: { column: { id: string } }) => `Header ${column.id}`,
        cell: ({ value }: { value: unknown }) => `Cell ${String(value)}`,
      },
    });

    expect(wrapper.get("thead .akaza-data-table-selection-control").exists()).toBe(true);
    expect(wrapper.get("th[data-akaza-column='name'] .akaza-data-table-sort-trigger").text()).toContain("Header name");
    expect(wrapper.get("td[data-akaza-column='select'] .akaza-data-table-selection-control").exists()).toBe(true);
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Cell Ada Lovelace");
  });

  it("renders slot-only footers and native row headers", () => {
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people.slice(0, 1),
        columns: [{ accessor: "name", rowHeader: true }, { accessor: "role" }],
        rowKey: "id",
      },
      slots: {
        "name-footer": () => "Members",
      },
    });

    expect(wrapper.get("tbody th[data-akaza-column='name']").attributes("scope")).toBe("row");
    expect(wrapper.get("tfoot td[data-akaza-column='name']").text()).toBe("Members");
  });

  it("uses native disabled controls and one radio group for single selection", () => {
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns: [{ id: "select", type: "selection" }, { accessor: "name" }],
        rowKey: "id",
        selectionMode: "single",
        isRowSelectable: row => row.id !== 1,
      },
    });

    const radios = wrapper.findAll<HTMLInputElement>("tbody input[type='radio']");
    expect(radios[0]!.element.disabled).toBe(true);
    expect(new Set(radios.map(radio => radio.attributes("name"))).size).toBe(1);
    expect(wrapper.get("tr[data-akaza-row-key='1']").attributes("aria-disabled")).toBeUndefined();
  });

  it("preserves empty and null filters until clearFilter is called", () => {
    const wrapper = mount(DataTable<Person>, {
      props: { data: people, columns, rowKey: "id" },
    });
    const exposed = wrapper.vm as unknown as {
      table: {
        filters: { value: Record<string, unknown> };
        clearFilter: (id: string) => boolean;
        setFilter: (id: string, value: unknown) => boolean;
      };
    };

    expect(exposed.table.setFilter("role", "")).toBe(true);
    expect(exposed.table.filters.value).toHaveProperty("role", "");
    expect(exposed.table.setFilter("role", null)).toBe(true);
    expect(exposed.table.filters.value).toHaveProperty("role", null);
    expect(exposed.table.clearFilter("role")).toBe(true);
    expect(exposed.table.filters.value).not.toHaveProperty("role");
  });

  it("filters numeric accessors with the default text matcher", async () => {
    const wrapper = mount(DataTable<Person>, {
      props: { data: people, columns, rowKey: "id" },
    });
    const exposed = wrapper.vm as unknown as {
      table: { setFilter: (id: string, value: unknown) => boolean };
    };

    expect(exposed.table.setFilter("age", "85")).toBe(true);
    await nextTick();
    expect(wrapper.findAll(".akaza-data-table-row")).toHaveLength(1);
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Grace Hopper");
  });

  it("normalizes unsafe controlled engine state without mutating public models", () => {
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns: [{ id: "select", type: "selection" }, { accessor: "name" }],
        rowKey: "id",
        selectionMode: "single",
        selection: [1, 2],
        rowOrder: [2, 2, 1, 3],
        columnSizing: { name: Number.NaN },
        columnPinning: { start: ["name"], end: ["name", "missing"] },
      },
    });

    expect(wrapper.findAll("tbody .akaza-data-table-row")).toHaveLength(3);
    expect(wrapper.findAll<HTMLInputElement>("tbody input:checked")).toHaveLength(1);
    expect(wrapper.findAll("tbody .akaza-data-table-row")[0]!.attributes("data-akaza-row-key")).toBe("2");
    expect(wrapper.get("col[data-akaza-column='name']").attributes("style")).toContain("width: 150px");
    expect(wrapper.get("th[data-akaza-column='name']").attributes("data-akaza-pinned")).toBe("start");
    expect(wrapper.props("selection")).toEqual([1, 2]);
  });

  it("uses string errors, custom state labels, and safe object formatting", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const wrapper = mount(DataTable<{ id: number; value: object }>, {
      props: {
        data: [{ id: 1, value: circular }],
        columns: [{ accessor: "value" }],
        rowKey: "id",
      },
    });
    expect(wrapper.get("tbody .akaza-data-table-cell").text()).toBe("[object Object]");

    const error = mount(DataTable<Person>, {
      props: { data: [], columns, rowKey: "id", error: "Network unavailable" },
    });
    expect(error.get(".akaza-data-table-error-cell").text()).toBe("Network unavailable");

    const empty = mount(DataTable<Person>, {
      props: { data: [], columns, rowKey: "id", labels: { empty: "Nothing here" } },
    });
    expect(empty.get(".akaza-data-table-empty-cell").text()).toBe("Nothing here");
  });

  it("makes filter page resets and reset transactions cancelable", async () => {
    const cancelPageReset = vi.fn((_value, details) => {
      if (details.reason === "filter-reset") details.cancel();
    });
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns,
        rowKey: "id",
        paginate: true,
        pagination: { page: 2, pageSize: 1 },
        onPaginationChange: cancelPageReset,
      },
    });
    const exposed = wrapper.vm as unknown as {
      reset: () => boolean;
      setFilter: (id: string, value: unknown) => boolean;
    };

    expect(exposed.setFilter("role", "Engineer")).toBe(false);
    expect(wrapper.emitted("update:filters")).toBeUndefined();
    expect(wrapper.emitted("update:pagination")).toBeUndefined();

    await wrapper.setProps({
      onResetChange: details => details.cancel(),
      selection: [1],
    });
    expect(exposed.reset()).toBe(false);
    expect(wrapper.emitted("reset-change")).toHaveLength(1);
    expect(wrapper.emitted("update:selection")).toBeUndefined();
  });

  it("keeps built-in pagination controlled when its outer change is canceled", async () => {
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns,
        rowKey: "id",
        paginate: true,
        pagination: { page: 1, pageSize: 1 },
        onPaginationChange: (_value, details) => details.cancel(),
      },
    });

    await wrapper.get(".akaza-pagination-next").trigger("click");
    expect(wrapper.get("td[data-akaza-column='name']").text()).toBe("Ada Lovelace");
    expect(wrapper.emitted("update:pagination")).toBeUndefined();
  });

  it("keeps fit resizing width stable and blocks reorder while sorted", async () => {
    const resizeColumns: DataTableColumn<Person>[] = [
      { id: "reorder", type: "reorder", size: 40 },
      { accessor: "name", size: 150, minSize: 100 },
      { accessor: "role", size: 150, minSize: 100 },
    ];
    const wrapper = mount(DataTable<Person>, {
      props: {
        data: people,
        columns: resizeColumns,
        rowKey: "id",
        columnResize: { behavior: "fit" },
        rowReorder: true,
        sorting: [{ id: "name", direction: "ascending" }],
      },
    });
    const exposed = wrapper.vm as unknown as {
      table: { resizeColumn: (id: string, size: number) => boolean };
    };

    expect(exposed.table.resizeColumn("name", 170)).toBe(true);
    await nextTick();
    expect(wrapper.emitted("update:columnSizing")?.[0]?.[0]).toMatchObject({ name: 170, role: 130 });
    expect(wrapper.get("table").attributes("style")).toContain("width: 340px");
    expect(wrapper.findAll<HTMLButtonElement>(".akaza-data-table-reorder-handle")[0]!.element.disabled).toBe(true);
    await wrapper.findAll(".akaza-data-table-reorder-handle")[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.emitted("update:rowOrder")).toBeUndefined();
  });

  it("offers typed accessor values without exposing the table engine", () => {
    const column = createDataTableColumnHelper<Person>().accessor("age", {
      cell: ({ value }) => {
        expectTypeOf(value).toEqualTypeOf<number>();
        return String(value);
      },
    });
    expect(column.accessor).toBe("age");
  });
});
