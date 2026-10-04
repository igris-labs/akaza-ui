---
title: useDataTable
description: Reactive table data, selection, sorting, filtering, pagination, and column state.
navigation:
  icon: i-lucide-table-2
---

`useDataTable` provides the same Vue-native controller used by [DataTable](/components/data-table), without rendering a table. Use it for custom markup or a data workflow that needs table state outside a component.

If you already render `DataTable`, use its slot controller or exposed `table` instead of creating a second controller. A new `useDataTable()` call is an independent instance, not a lookup of an existing component.

## Usage

Pass reactive data and columns, plus a stable row key. Destructure the returned refs when using them at the top level of a template; they unwrap there automatically.

```vue
<script setup lang="ts">
import type { DataTableColumn } from "akaza-ui";
import { useDataTable } from "akaza-ui";
import { ref } from "vue";

interface Person {
  id: string;
  name: string;
  email: string;
}

const data = ref<Person[]>([
  { id: "ada", name: "Ada Lovelace", email: "ada@example.com" },
  { id: "grace", name: "Grace Hopper", email: "grace@example.com" },
]);
const columns: DataTableColumn<Person>[] = [
  { accessor: "name", header: "Name" },
  { accessor: "email", header: "Email" },
];
const table = useDataTable({ data, columns, rowKey: "id" });
const { rows, globalFilter, columns: visibleColumns } = table;
</script>

<template>
  <label>
    Search people
    <input
      :value="globalFilter"
      @input="table.setGlobalFilter(($event.target as HTMLInputElement).value, $event)"
    >
  </label>
  <table>
    <caption>People</caption>
    <thead>
      <tr>
        <th
          v-for="column in visibleColumns"
          :key="column.id"
          scope="col"
          :aria-sort="column.sorted === 'asc' ? 'ascending' : column.sorted === 'desc' ? 'descending' : 'none'"
        >
          <button type="button" @click="table.toggleSorting(column.id, $event)">
            {{ column.definition.header }}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td v-for="cell in table.getRowCells(row)" :key="cell.column.id">{{ cell.value }}</td>
      </tr>
      <tr v-if="!rows.length"><td colspan="2">No people found.</td></tr>
    </tbody>
  </table>
</template>
```

These columns use string headers. For grouped headers or custom renderers, use the controller's `headerGroups` and context helpers, or let DataTable render the structure through its slots.

## Examples

### Application-owned models

Supply refs when filters, selection, or pagination must also drive other controls. Use controller actions when changes should go through callbacks and cancellation.

```ts
import type { DataTablePaginationState, DataTableSelection } from "akaza-ui";
import { useDataTable } from "akaza-ui";
import { ref } from "vue";

const selection = ref<DataTableSelection>([]);
const pagination = ref<DataTablePaginationState>({ page: 1, pageSize: 20 });

const table = useDataTable({
  data,
  columns,
  rowKey: "id",
  selectionMode: "multiple",
  selection,
  paginate: true,
  pagination,
});
```

`data` and `columns` are the inputs from Usage. Pages are one-based. `selectedRows` contains matching loaded row instances; selection IDs may also include rows absent from a server page.

### Reactive inputs

Pass refs or getters for replaceable collections and reactive options. Do not capture a current `.value` if you expect later replacements to be observed.

```ts
const table = useDataTable({
  data: () => response.value?.items ?? [],
  columns: () => configuredColumns.value,
  rowKey: "id",
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
  rowCount: () => response.value?.total,
  pagination,
});
```

Your application fetches the page and reacts to model changes. The controller does not make requests. Manual flags prevent it from reprocessing results already sorted, filtered, or paginated by the server. See [server-controlled data](/components/data-table#server-controlled-data) for the component workflow.

### Cancel a change

Callbacks run before action-driven commits. Call `details.cancel()` to reject one. Direct model assignments are application-owned and do not invoke these callbacks.

```ts
const table = useDataTable({
  data,
  columns,
  rowKey: "id",
  paginate: true,
  pagination,
  onPaginationChange(_next, details) {
    if (saving.value) details.cancel();
  },
});
```

Callbacks receive the proposed value and `{ reason, event?, cancel }`. `onResetChange` receives only the details object. Use the optional native event argument on actions to preserve the originating interaction.

## API Reference

### Signature

```ts
useDataTable<T extends object>(options: UseDataTableOptions<T>): DataTableController<T>;
```

### Inputs and behavior options

`MaybeRefOrGetter<T>` means a plain value, ref, computed ref, or getter. Function-valued options such as `rowKey` and `getSubRows` are callbacks, not reactive getters.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `MaybeRefOrGetter<readonly T[]>` | Required | Current loaded rows. |
| `columns` | `MaybeRefOrGetter<readonly DataTableColumn<T>[]>` | Required | Definitions; see [column shape](/components/data-table#column-shape). |
| `rowKey` | `keyof T & string` or `(row, index) => string \| number` | Required | Unique stable key. Do not use a display index for changing datasets. |
| `sortingMode` | `MaybeRefOrGetter<'single' \| 'multiple'>` | `single` | Number of retained sort descriptors; multiple sorting uses a modified sort event. |
| `manualSorting` | `MaybeRefOrGetter<boolean>` | `false` | Do not sort data locally. |
| `manualFiltering` | `MaybeRefOrGetter<boolean>` | `false` | Do not filter data locally. |
| `paginate` | `MaybeRefOrGetter<boolean>` | `false` | Enable client pagination. |
| `manualPagination` | `MaybeRefOrGetter<boolean>` | `false` | Treat loaded rows as a server page; enables pagination state. |
| `rowCount` | `MaybeRefOrGetter<number \| undefined>` | Loaded row count | Total count for manual pagination. |
| `selectionMode` | `MaybeRefOrGetter<'none' \| 'single' \| 'multiple'>` | `none` | Enable selection actions. |
| `selectAllScope` | `MaybeRefOrGetter<'page' \| 'filtered'>` | `page` | Scope for select-all actions. Server mode can only act on loaded rows. |
| `isRowSelectable` | `(row: T) => boolean` | All rows | Allow selection per row. |
| `isRowExpandable` | `(row: T) => boolean` | Has child rows | Allow expansion per row, including application-owned details. |
| `getSubRows` | `(row: T) => readonly T[] \| undefined` | - | Return child rows. |
| `columnResize` | `MaybeRefOrGetter<boolean \| DataTableColumnResizeOptions>` | `false` | Enable resize actions and their behavior options. |
| `dir` | `MaybeRefOrGetter<'ltr' \| 'rtl'>` | `ltr` | Logical direction for column behavior. |

`ui`, `loading`, `error`, `stickyHeader`, reorder handles, and row-click behavior are component/rendering options, not composable inputs.

### Model refs

Each model accepts an optional writable ref. Omitting it creates internal state. These refs are also returned by the controller.

| Option / return member | Type | Initial value when omitted |
| --- | --- | --- |
| `selection` | `Ref<DataTableSelection>` | `null` |
| `sorting` | `Ref<DataTableSorting[]>` | `[]` |
| `filters` | `Ref<DataTableFilters>` | `{}` |
| `globalFilter` | `Ref<string>` | `''` |
| `pagination` | `Ref<DataTablePaginationState>` | `{ page: 1, pageSize: 10 }` |
| `expanded` | `Ref<DataTableRowKey[]>` | `[]` |
| `columnVisibility` | `Ref<DataTableColumnVisibility>` | `{}`; definitions also contribute default visibility |
| `columnOrder` | `Ref<string[]>` | `[]` |
| `columnSizing` | `Ref<DataTableColumnSizing>` | `{}` |
| `columnPinning` | `Ref<DataTableColumnPinning>` | `{ start: [], end: [] }`; definitions also contribute default pins |
| `rowOrder` | `Ref<DataTableRowKey[]>` | `[]` |

### Change callbacks

`UseDataTableOptions` extends `DataTableChangeCallbacks`. Every model has its matching callback:

`onSelectionChange`, `onSortingChange`, `onFiltersChange`, `onGlobalFilterChange`, `onPaginationChange`, `onExpandedChange`, `onColumnVisibilityChange`, `onColumnOrderChange`, `onColumnSizingChange`, `onColumnPinningChange`, and `onRowOrderChange`.

Each uses `(nextValue, details) => void`. `onResetChange(details)` can cancel reset before any model changes.

### Derived state

| Member | Type | Description |
| --- | --- | --- |
| `columns` | Read-only ref of `DataTableColumnInstance<T>[]` | Current visible leaf columns in display order. |
| `headerGroups` | Read-only ref of `DataTableHeaderGroup<T>[]` | Grouped header rows, including spans and placeholders. |
| `rows` | Read-only ref of `DataTableRow<T>[]` | Display rows after enabled processing. |
| `selectedRows` | Read-only ref of `DataTableRow<T>[]` | Selected row instances currently loaded. |
| `filteredRowCount` | Read-only number ref | Number of loaded rows in the filtered row model. |
| `pageCount` | Read-only number ref | Page count; at least one, including empty results. |
| `page`, `pageSize` | Read-only number refs | Normalized current page and page size. |

### Actions

The actions below return `boolean`; rejected, canceled, or inapplicable operations can return `false`. Optional `event` arguments accept a native event.

| Method | Arguments | Description |
| --- | --- | --- |
| `setFilter` | `(columnId, value, event?)` | Set a column filter and reset the page when needed. |
| `clearFilter` | `(columnId, event?)` | Remove a column filter. |
| `setGlobalFilter` | `(value: string, event?)` | Set global search. |
| `toggleSorting` | `(columnId, event?)` | Cycle ascending, descending, and unsorted. |
| `toggleRow` | `(row, event?)` | Toggle a selectable row. |
| `toggleAllRows` | `(event?)` | Toggle selection for the configured scope in multiple mode. |
| `toggleExpanded` | `(row, event?)` | Toggle row details or children. |
| `setPage` | `(page: number, event?)` | Set a one-based page. |
| `setPageSize` | `(size: number, event?)` | Set page size and return to page one. |
| `setColumnVisible` | `(id, visible: boolean, event?)` | Show or hide a column. |
| `setColumnPinned` | `(id, side: false \| 'start' \| 'end', event?)` | Pin or unpin a column. |
| `resizeColumn` | `(id, size: number, event?)` | Apply a constrained width when resizing is enabled. |
| `moveColumn` | `(id, targetId, event?)` | Reorder columns by ID. |
| `moveRow` | `(id, targetId, event?)` | Reorder rows by stable key. |
| `reset` | `(event?)` | Clear selection, sorting, filters, expansion, sizing, and orders; return to page one while keeping page size, and restore definition-level visibility/pinning. |

### Lookup and render helpers

| Method | Return / behavior |
| --- | --- |
| `getColumn(id)` | Public column instance or `undefined`. |
| `getRow(id)` | Public loaded row instance or `undefined`. |
| `getRowCells(row)` | Visible cell contexts for a row. |
| `getCellContext(row, column)` | A `DataTableCellContext<T>`. |
| `getHeaderContext(header)` | A `DataTableHeaderContext<T>`. |
| `getHeaderAttrs(header)` | Consumer-supplied header attributes from the definition. |
| `getCellAttrs(context)` | Consumer-supplied cell attributes from the definition. |
| `getFooterAttrs(header)` | Consumer-supplied footer attributes from the definition. |
| `isAllRowsSelected()` | Whether the selectable scope is fully selected. |
| `isSomeRowsSelected()` | Whether the selectable scope is partially selected. |

Attribute helpers do not generate complete ARIA or table semantics. Supply those in custom markup. Row instances expose `original`, stable `id`, display `index`, `originalIndex`, state flags, `getValue`, `toggleSelected`, and `toggleExpanded`. Column instances expose the definition, sizing, visibility, sorting, filtering, and pinning state. None exposes the underlying table engine.

## Rendering, accessibility, and SSR

This composable owns data processing, not DOM. For custom tables, keep native table semantics, an accessible name or caption, `scope` on headers, sorting announcements, and labelled keyboard-operable controls. Pointer, touch, drag handles, focus, and visual feedback remain the renderer's responsibility. Use [DataTable](/components/data-table) when you want those interactions supplied for you.

Create the controller in component setup so its reactive effects follow that component's lifetime. Data fetching and persistence remain application-owned. Pass stable, unique keys across client and server pages; replacing data does not mean a display index becomes a stable identity.

## Related

- [DataTable component, column definitions, and slots](/components/data-table)
- [Pagination](/components/pagination)
