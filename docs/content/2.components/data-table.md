---
title: Data Table
description: Semantic tables with sorting, filtering, selection, pagination, expansion, and resizing.
navigation:
  icon: i-lucide-table-2
  badge:
    label: NEW
    color: success
---

`DataTable` renders typed columns and row data as a semantic HTML table. Akaza manages structure and interaction state. Your application supplies data, cell content, and styles.

It supports sorting, filtering, selection, pagination, grouped headers, expandable rows, and pinned columns. It renders a native `table` and keeps standard table reading behavior for screen readers.

## Anatomy

- **`#toolbar`**: Search, filters, view controls, and bulk actions above the table.
- **`#caption`**: Visible or visually hidden table caption.
- **`#[column.id]-header`**: Header content for one column.
- **`#header`**: Generic fallback for every header.
- **`#sort-indicator`**: Sort direction indicator.
- **`#[column.id]-cell`**: Cell content for one column, such as `#name-cell`.
- **`#cell`**: Generic fallback for every body cell.
- **`#expanded`**: Detail row rendered after an expanded data row.
- **`#[column.id]-footer`**: Footer content for one column.
- **`#footer`**: Generic fallback for every footer cell.
- **`#pagination`**: Replaces the built-in Pagination composition.
- **`#loading`**, **`#error`**, **`#empty`**: Complete table-body states.
- **`#expansion-trigger`**, **`#reorder-handle`**, **`#column-reorder-handle`**, **`#resize-handle`**: Interaction control content.

Data Table generates the native table structure, controls, state rows, paginator, and result count. Generic `#header` and `#cell` slots keep built-in controls. A column slot replaces that part, including any selection, sorting, expansion, or reorder control it contained.

## Usage

::component-preview
  :::examples-data-table-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { DataTableColumn, DataTableRowKey } from "akaza-ui";
import { DataTable } from "akaza-ui";
import { ref } from "vue";

interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "invited";
}

const rows: User[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", status: "active" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", status: "invited" },
];

const columns: DataTableColumn<User>[] = [
  { id: "select", type: "selection", size: 44 },
  { accessor: "name", header: "Member", sortable: true },
  { accessor: "status", header: "Status", sortable: true },
  { id: "actions", type: "display", header: "" },
];

const selection = ref<DataTableRowKey[]>([]);
</script>

<template>
  <DataTable
    v-model:selection="selection"
    :data="rows"
    :columns="columns"
    row-key="id"
    selection-mode="multiple"
  >
    <template #name-cell="{ row }">
      <strong>{{ row.original.name }}</strong>
      <small>{{ row.original.email }}</small>
    </template>

    <template #actions-cell="{ row }">
      <button type="button" @click.stop="openUser(row.original)">Open</button>
    </template>
  </DataTable>
</template>
```
::

## Examples

### Custom headers and cells

Use `#[id]-header` and `#[id]-cell` for the clearest template-first API. Each cell receives the row, column, resolved value, indexes, and table controller.

```vue
<DataTable :data="users" :columns="columns" row-key="id">
  <template #name-header="{ column, toggleSorting }">
    <button type="button" @click="toggleSorting">{{ column.definition.header }}</button>
  </template>

  <template #name-cell="{ row }">
    <Avatar :src="row.original.avatar" />
    <span>{{ row.original.firstName }} {{ row.original.lastName }}</span>
  </template>

  <template #status-cell="{ value }">
    <StatusBadge :status="value" />
  </template>
</DataTable>
```

Column render functions are also supported when definitions belong in TypeScript. Slot precedence is specific named slot, generic slot, column render function, then formatted accessor value. Use `createDataTableColumnHelper<T>()` when a render function needs its accessor value inferred instead of `unknown`.

```ts
import { createDataTableColumnHelper } from "akaza-ui";

const column = createDataTableColumnHelper<User>();

const columns = [
  column.accessor("name", {
    header: ({ column }) => h("span", { class: "min-w-48" }, column.id),
    cell: ({ row }) => h(UserSummary, { user: row.original }),
    ui: { header: "min-w-48", cell: "font-medium" },
    attrs: { cell: ({ row }) => ({ "data-user-id": row.id }) },
  }),
];
```

### Sorting and filtering

Sorting and filters are Vue models. Use controller methods in the toolbar so all changes use the same cancelable event path.

```vue
<DataTable
  v-model:sorting="sorting"
  v-model:filters="filters"
  v-model:global-filter="search"
  :data="users"
  :columns="columns"
  row-key="id"
  sorting-mode="multiple"
>
  <template #toolbar="{ table }">
    <input
      :value="search"
      type="search"
      @input="table.setGlobalFilter($event.target.value, $event)"
    >
    <button type="button" @click="table.setFilter('status', 'active', $event)">
      Active only
    </button>
    <button type="button" @click="table.clearFilter('status', $event)">
      All statuses
    </button>
  </template>
</DataTable>
```

Hold Shift, Control, or Command while activating headers to retain existing sorts in `multiple` mode.

`undefined` clears a column filter; `null`, `false`, `0`, and `""` remain available to custom `filter` functions. The default case-insensitive text matcher treats empty values as no filter. Prefer `clearFilter(id)` when intent should be explicit. An accepted filter or sort change resets pagination to page 1 as one transaction. Canceling either paired change event cancels the whole transaction.

### Selection and bulk actions

Add a `selection` column and choose `single` or `multiple`. Selection stores stable `rowKey` values, so sorting and filtering never attach state to the wrong row.

```vue
<DataTable
  v-model:selection="selectedIds"
  :data="users"
  :columns="columns"
  row-key="id"
  selection-mode="multiple"
  selection-behavior="row"
  :is-row-selectable="row => !row.locked"
  select-all-scope="filtered"
>
  <template #toolbar="{ table }">
    <button :disabled="!table.selectedRows.value.length" @click="archive(selectedIds)">
      Archive selected
    </button>
  </template>
</DataTable>
```

`selectionBehavior="control"` changes selection only through checkboxes or radios. `"row"` also selects from non-interactive row space; links, buttons, inputs, and editable controls remain independent.

Disabled rows render disabled native selection controls. In manual pagination, `selectedRows` can resolve only keys present in the currently supplied page; keep bulk selection data in application state when selections span server pages.

### Pagination

Set `paginate` for client pagination. The bundled paginator is styled through the `pagination*` UI keys or replaced through `#pagination`.

```vue
<DataTable
  v-model:pagination="pagination"
  :data="users"
  :columns="columns"
  row-key="id"
  paginate
>
  <template #pagination="{ page, pageCount, setPage }">
    <button :disabled="page === 1" @click="setPage(page - 1)">Previous</button>
    <span>Page {{ page }} of {{ pageCount }}</span>
    <button :disabled="page === pageCount" @click="setPage(page + 1)">Next</button>
  </template>
</DataTable>
```

When filtering or a smaller data set removes the current page, DataTable clamps `v-model:pagination` to the last available page. `page` and `pageSize` accept finite numbers only.

### Server-controlled data

Enable manual modes when supplied `data` is already processed by an API. Akaza updates models but does not sort, filter, or slice rows again. Change events fire before model commits so `details.cancel()` can reject a change; do not fetch from those events. Observe committed Vue state instead, and cancel stale requests.

```vue
<script setup lang="ts">
const sorting = ref([]);
const filters = ref({});
const pagination = ref({ page: 1, pageSize: 25 });
const query = computed(() => ({
  sorting: sorting.value,
  filters: filters.value,
  pagination: pagination.value,
}));

watch(query, async (value, _previous, onCleanup) => {
  const request = new AbortController();
  onCleanup(() => request.abort());
  response.value = await fetchRows(value, request.signal);
}, { immediate: true });
</script>

<template>
  <DataTable
  v-model:sorting="sorting"
  v-model:filters="filters"
  v-model:pagination="pagination"
  :data="response.rows"
  :columns="columns"
  :row-count="response.total"
  row-key="id"
  manual-sorting
  manual-filtering
  manual-pagination
  />
</template>
```

`rowCount` is the total server result count, not current page length. `selectAllScope="filtered"`, `filteredRowCount`, and client-side selected-row resolution cover loaded rows only in manual modes. Use globally stable `rowKey` values across every page.

### Grouped headers and details

Nested column definitions generate proper `colspan`, `rowspan`, and `scope` values. An `expander` column controls detail rows.

```ts
const columns = [
  { id: "expand", type: "expander", header: "" },
  {
    id: "identity",
    header: "Identity",
    children: [
      { accessor: "name", header: "Name" },
      { accessor: "email", header: "Email" },
    ],
  },
];
```

```vue
<DataTable
  v-model:expanded="expandedIds"
  :data="users"
  :columns="columns"
  row-key="id"
  :is-row-expandable="row => Boolean(row.auditLog.length)"
>
  <template #expanded="{ row }">
    <AuditLog :entries="row.original.auditLog" />
  </template>
</DataTable>
```

Use `getSubRows` instead when data is hierarchical and child records should become ordinary nested table rows.

Set `rowHeader: true` on the identifying column to render its body cells as native `<th scope="row">` elements.

### Column layout

Sizing, order, visibility, and pinning use separate models. Pointer and keyboard input update those models.

```vue
<DataTable
  v-model:column-sizing="columnSizing"
  v-model:column-order="columnOrder"
  v-model:column-visibility="columnVisibility"
  v-model:column-pinning="columnPinning"
  :data="users"
  :columns="columns"
  row-key="id"
  sticky-header
  column-reorder
  :column-resize="{ behavior: 'fit', update: 'change', keyboardStep: 12 }"
>
  <template #toolbar="{ table }">
    <button @click="table.setColumnVisible('email', false, $event)">Hide email</button>
    <button @click="table.setColumnPinned('name', 'start', $event)">Pin name</button>
  </template>
</DataTable>
```

Column sizes use pixels and a fixed table layout. `expand` changes total table width. `fit` transfers width to an adjacent column. Pinned headers sit above pinned body and footer cells. Consumer `min-width` and `width` rules can override calculated sizes.

Row reorder is available only for flat, unsorted rows. Sorting or hierarchical depth disables native reorder buttons and controller moves, avoiding ambiguous source order. Filtered and paginated moves still operate on stable row keys in the full supplied array.

### Loading, error, and empty states

State rows preserve the table structure and span every visible column. Replace their content without rebuilding the table.

```vue
<DataTable :data="rows" :columns="columns" row-key="id" :loading="pending" :error="error">
  <template #loading>Loading members...</template>
  <template #error="{ error }">{{ getMessage(error) }}</template>
  <template #empty>No members match these filters.</template>
</DataTable>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model:selection` | `rowKey \| rowKey[] \| null` | `null` | Selected stable row keys. |
| `v-model:sorting` | `DataTableSorting[]` | `[]` | Ordered sort descriptors. |
| `v-model:filters` | `Record<string, unknown>` | `{}` | Per-column filter values. |
| `v-model:globalFilter` | `string` | `""` | Global search text. |
| `v-model:pagination` | `{ page, pageSize }` | `{ page: 1, pageSize: 10 }` | One-based page state. |
| `v-model:expanded` | `rowKey[]` | `[]` | Expanded row keys. |
| `v-model:columnVisibility` | `Record<string, boolean>` | `{}` | Column visibility overrides. |
| `v-model:columnOrder` | `string[]` | `[]` | Leaf column order. |
| `v-model:columnSizing` | `Record<string, number>` | `{}` | Column widths in pixels. |
| `v-model:columnPinning` | `{ start: string[], end: string[] }` | empty sides | Pinned leaf columns. |
| `v-model:rowOrder` | `rowKey[]` | `[]` | User-controlled row order. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `readonly T[]` | required | Rows supplied to the table. |
| `columns` | `readonly DataTableColumn<T>[]` | required | Typed column definitions. |
| `rowKey` | `keyof T \| (row, index) => string \| number` | required | Stable row identity. |
| `caption` | `string` | — | Native table caption text. |
| `ariaLabel` | `string` | — | Accessible table label when no caption is used. |
| `ariaLabelledby` | `string` | — | ID of an external table label. |
| `ariaDescribedby` | `string` | — | IDs describing the table. |
| `loading` | `boolean` | `false` | Renders loading state and `aria-busy`. |
| `error` | `boolean \| string \| Error` | `false` | Renders error state. |
| `emptyLabel` | `string` | `"No results."` | Default empty-state text. |
| `errorLabel` | `string` | `"Unable to load results."` | Default non-Error message. |
| `sortingMode` | `"single" \| "multiple"` | `"single"` | Number of retained sort descriptors. |
| `manualSorting` | `boolean` | `false` | Disables client sorting. |
| `manualFiltering` | `boolean` | `false` | Disables client filtering. |
| `paginate` | `boolean` | `false` | Enables client pagination. |
| `manualPagination` | `boolean` | `false` | Treats supplied data as an API page. |
| `rowCount` | `number` | — | Total server row count for manual pagination. |
| `showPagination` | `boolean` | `true` | Shows built-in or slotted pagination. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` | Selection behavior. |
| `selectionBehavior` | `"control" \| "row"` | `"control"` | Whether non-interactive row clicks select. |
| `selectAllScope` | `"page" \| "filtered"` | `"page"` | Rows affected by select all. |
| `isRowSelectable` | `(row) => boolean` | all rows | Disables selection per row. |
| `isRowExpandable` | `(row) => boolean` | rows with children | Enables detail expansion per row. |
| `getSubRows` | `(row) => readonly T[]` | — | Returns hierarchical child rows. |
| `columnResize` | `boolean \| DataTableColumnResizeOptions` | `false` | Enables pointer/touch/keyboard resizing. |
| `columnReorder` | `boolean` | `false` | Enables pointer/touch/keyboard column reorder handles. |
| `rowReorder` | `boolean` | `false` | Enables pointer/touch/keyboard row reorder handles. |
| `stickyHeader` | `boolean` | `false` | Keeps headers at the viewport top. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Logical direction for sizing and pinning. |
| `labels` | `DataTableLabels` | English labels | Accessible control and state labels. |
| `rowAttrs` | `HTMLAttributes \| (row) => HTMLAttributes` | — | Native attributes/classes for every row. |
| `ui` | `DataTableUi` | — | Classes for structural parts. |

### Column Shape

| Key | Type | Description |
|-----|------|-------------|
| `id` | `string` | Stable column ID. Required without a string accessor. |
| `type` | `"data" \| "display" \| "selection" \| "expander" \| "reorder"` | Column behavior. |
| `accessor` | `keyof T \| (row, index) => value` | Resolves a data value. |
| `header` | `string \| (context) => VNodeChild` | Default header content. |
| `cell` | `(context) => VNodeChild` | Default cell renderer. |
| `footer` | `string \| (context) => VNodeChild` | Footer content. |
| `children` | `DataTableColumn<T>[]` | Nested grouped columns. |
| `sortable` | `boolean` | Enables header sorting. Defaults to true for accessor columns. |
| `compare` | `(a, b, rowA, rowB) => number` | Custom client comparator. |
| `filterable` | `boolean` | Includes column in filters/global search. |
| `filter` | `(value, filterValue, row) => boolean` | Custom client filter. |
| `size`, `minSize`, `maxSize` | `number` | Width constraints in pixels. |
| `resizable`, `reorderable` | `boolean` | Disables an enabled table-level interaction per column. |
| `pinned` | `"start" \| "end" \| false` | Initial logical pin side. |
| `hidden` | `boolean` | Initial visibility. |
| `rowHeader` | `boolean` | Renders body cells as `<th scope="row">`. |
| `ui` | `{ column, header, cell, footer }` | Classes for this whole column or one section. |
| `attrs` | `{ header, cell, footer }` | Native attributes or context callbacks. |
| `metadata` | `Record<string, unknown>` | Application metadata returned on the definition. |

### Emits

Every model emits its `update:*` event after an accepted change. The paired `*-change` event fires first with `(value, details)`; `details.cancel()` prevents the model update.

| Event | Description |
|-------|-------------|
| `selection-change` | Selection changed. |
| `sorting-change` | Sort descriptors changed. |
| `filters-change` | Column filters changed. |
| `global-filter-change` | Global filter changed. |
| `pagination-change` | Page or page size changed. |
| `expanded-change` | Expanded row keys changed. |
| `column-visibility-change` | Visibility map changed. |
| `column-order-change` | Leaf column order changed. |
| `column-sizing-change` | Width map changed. |
| `column-pinning-change` | Pin sides changed. |
| `row-order-change` | Row order changed. |
| `reset-change` | Atomic reset requested. Canceling it preserves every model. |
| `row-click` | Native row click with row and cancelable details. |
| `row-contextmenu` | Native row context-menu event with row details. |
| `cell-click` | Native cell click with cell context and details. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `toolbar` | `table` | Controls above the viewport. |
| `caption` | — | Native caption content. |
| `[column.id]-header` | header context | Specific header renderer. |
| `header` | header context | Generic header renderer. |
| `sort-indicator` | `column`, `sorted` | Sort direction content. |
| `[column.id]-cell` | cell context | Specific cell renderer. |
| `cell` | cell context | Generic cell renderer. |
| `expanded` | `row`, `table` | Detail row content. |
| `[column.id]-footer` | `column`, `table` | Specific footer content. |
| `footer` | `column`, `table` | Generic footer content. |
| `pagination` | `table`, `page`, `pageSize`, `pageCount`, `setPage`, `setPageSize` | Replaces default paginator. |
| `loading` | `table` | Loading row content. |
| `error` | `error`, `table` | Error row content. |
| `empty` | `table` | Empty row content. |
| `expansion-trigger` | `row` | Expand/collapse control content. |
| `reorder-handle` | `row` | Row drag handle content. |
| `column-reorder-handle` | `column` | Column drag handle content. |
| `resize-handle` | `column` | Resize handle content. |

### Controller

`#toolbar`, cell/header contexts, `#pagination`, `useDataTable()`, and the exposed `table` property use the same Vue-native controller.

| Member | Description |
|--------|-------------|
| `columns`, `headerGroups`, `rows`, `selectedRows` | Read-only computed table structures. |
| `filteredRowCount`, `pageCount`, `page`, `pageSize` | Read-only result and pagination state. |
| model refs | The eleven public model refs listed above. |
| `getColumn(id)`, `getRow(id)` | Looks up wrapped public instances. |
| `getRowCells(row)` | Returns visible cell contexts. |
| `setFilter(id, value, event?)`, `clearFilter(id, event?)`, `setGlobalFilter(value, event?)` | Updates filters. |
| `toggleSorting(id, event?)` | Cycles ascending, descending, and none. |
| `toggleRow(row, event?)`, `toggleAllRows(event?)` | Updates selection. |
| `isAllRowsSelected()`, `isSomeRowsSelected()` | Selection summary for controls. |
| `toggleExpanded(row, event?)` | Updates detail/child visibility. |
| `setPage(page, event?)`, `setPageSize(size, event?)` | Updates pagination. |
| `setColumnVisible(id, visible, event?)` | Updates visibility. |
| `setColumnPinned(id, side, event?)` | Updates logical pinning. |
| `resizeColumn(id, size, event?)` | Applies width constraints and resize behavior. |
| `moveColumn(id, targetId, event?)`, `moveRow(id, targetId, event?)` | Reorders by stable IDs. |
| `reset(event?)` | Atomically restores model defaults and definition-level visibility/pinning. Returns `false` when canceled. |

The component instance exposes `getColumn`, `getRow`, `setFilter`, `clearFilter`, `setGlobalFilter`, `setPage`, `setPageSize`, and `reset`.

### UI Options

| Key | Description |
|-----|-------------|
| `root`, `toolbar`, `viewport`, `table`, `caption`, `colgroup`, `col` | Outer table structure. |
| `thead`, `headerRow`, `headerCell`, `headerContent` | Header structure. |
| `sortTrigger`, `sortIndicator`, `resizeHandle`, `columnReorderHandle` | Header controls. |
| `tbody`, `row`, `cell`, `cellContent` | Body structure. |
| `selectionControl`, `expansionTrigger`, `reorderHandle` | Row controls. |
| `expandedRow`, `expandedCell` | Expanded detail row. |
| `loadingRow`, `loadingCell`, `errorRow`, `errorCell`, `emptyRow`, `emptyCell` | Body states. |
| `tfoot`, `footerRow`, `footerCell` | Footer structure. |
| `pagination` | Paginator wrapper. |
| `paginationRoot`, `paginationList`, `paginationItem` | Nested Pagination structure. |
| `paginationFirst`, `paginationPrevious`, `paginationPage`, `paginationEllipsis`, `paginationNext`, `paginationLast` | Nested Pagination controls. |
| `liveRegion` | Visually hidden result announcement. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-data-table` | `data-akaza-state="loading\|error\|ready\|empty"`, `data-akaza-loading`, `data-akaza-error`, `data-akaza-sticky-header` |
| `toolbar` | `akaza-data-table-toolbar` | — |
| `viewport` | `akaza-data-table-viewport` | Native overflow viewport. |
| `table` | `akaza-data-table-table` | `aria-busy` |
| `caption` | `akaza-data-table-caption` | — |
| `colgroup`, `col` | `akaza-data-table-colgroup`, `akaza-data-table-col` | `data-akaza-column`, `data-akaza-pinned` |
| `thead` | `akaza-data-table-thead` | `data-akaza-sticky` |
| `headerRow` | `akaza-data-table-header-row` | `data-akaza-depth` |
| `headerCell` | `akaza-data-table-header-cell` | `data-akaza-column`, `data-akaza-sortable`, `data-akaza-state`, `data-akaza-pinned`, `aria-sort` |
| `headerContent` | `akaza-data-table-header-content` | — |
| `sortTrigger`, `sortIndicator` | `akaza-data-table-sort-trigger`, `akaza-data-table-sort-indicator` | Native button attrs. |
| `resizeHandle` | `akaza-data-table-resize-handle` | separator role and value ARIA. |
| `columnReorderHandle` | `akaza-data-table-column-reorder-handle` | Native button attrs. |
| `tbody` | `akaza-data-table-tbody` | — |
| `row` | `akaza-data-table-row` | `data-akaza-row-key`, `data-akaza-row-index`, `data-akaza-depth`, `data-akaza-state`, `data-akaza-selected`, `data-akaza-expanded`, `data-akaza-disabled` |
| `cell` | `akaza-data-table-cell` | `data-akaza-column`, `data-akaza-column-index`, `data-akaza-pinned` |
| `cellContent` | `akaza-data-table-cell-content` | — |
| row controls | `akaza-data-table-selection-control`, `akaza-data-table-expansion-trigger`, `akaza-data-table-reorder-handle` | Native input/button ARIA. |
| expanded parts | `akaza-data-table-expanded-row`, `akaza-data-table-expanded-cell` | `data-akaza-state="expanded"` |
| state parts | `akaza-data-table-loading-*`, `akaza-data-table-error-*`, `akaza-data-table-empty-*` | matching `data-akaza-state` on rows. |
| footer parts | `akaza-data-table-tfoot`, `akaza-data-table-footer-row`, `akaza-data-table-footer-cell` | column/pinning attrs on cells. |
| `pagination` | `akaza-data-table-pagination` | — |
| nested pagination keys | `akaza-pagination-*` | See [Pagination](/components/pagination#styling-hooks). |
| `liveRegion` | `akaza-data-table-live-region` | `aria-live="polite"`. |

Plain `class` applies to the outer root. Use `ui.table`, section keys, or per-column `ui` and `attrs` for granular control. DataTable ships only behavior-critical layout for overflow, sizing, sticky/pinned positioning, resize targets, and the live region.

### Keyboard

| Control | Key | Behavior |
|---------|-----|----------|
| sort header | `Enter` / `Space` | Cycles sort direction through its native button. |
| selection control | `Space` | Selects a row or the configured select-all scope. |
| expansion control | `Enter` / `Space` | Opens or closes row details/children. |
| resize separator | `ArrowLeft` / `ArrowRight` | Changes width by `keyboardStep`, respecting RTL. |
| resize separator | `Home` | Restores the definition width or 150px. |
| column reorder handle | `ArrowLeft` / `ArrowRight` | Moves the column one visible position. |
| row reorder handle | `ArrowUp` / `ArrowDown` | Moves the row one visible position. |
| pagination | `Tab`, `Enter`, `Space` | Uses native Pagination button/link behavior. |

Pointer dragging and touch Pointer Events use the same resize and reorder actions. The table does not add spreadsheet-style arrow navigation to ordinary data cells; native table reading and normal document tab order remain intact.
