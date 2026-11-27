<script setup lang="ts" generic="T extends object">
import type { CSSProperties, VNodeChild } from "vue";
import type {
  DataTableCellContext,
  DataTableColumnInstance,
  DataTableColumnPinning,
  DataTableColumnSizing,
  DataTableColumnVisibility,
  DataTableFilters,
  DataTableHeader,
  DataTableHeaderGroup,
  DataTablePaginationState,
  DataTableProps,
  DataTableRow,
  DataTableRowKey,
  DataTableSelection,
  DataTableSlots,
  DataTableSorting,
} from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { PaginationUi } from "../pagination";
import { bindDrag } from "@ui-sdk/core";
import { computed, onBeforeUnmount, useAttrs, useId, useSlots } from "vue";
import { useDataTable } from "../../composables/data-table";
import { createChangeDetails as changeDetails } from "../../utils/changeEvent";
import { Pagination } from "../pagination";
import DataTableRender from "./DataTableRender";
import { useTableReorder } from "./useTableReorder";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  loading: false,
  error: false,
  emptyLabel: "No results.",
  errorLabel: "Unable to load results.",
  sortingMode: "single",
  manualSorting: false,
  manualFiltering: false,
  paginate: false,
  manualPagination: false,
  showPagination: true,
  selectionMode: "none",
  selectionBehavior: "control",
  selectAllScope: "page",
  columnResize: false,
  columnReorder: false,
  rowReorder: false,
  stickyHeader: false,
  dir: "ltr",
});

const emit = defineEmits<{
  "selection-change": [value: DataTableSelection, details: AkazaChangeEventDetails];
  "sorting-change": [value: DataTableSorting[], details: AkazaChangeEventDetails];
  "filters-change": [value: DataTableFilters, details: AkazaChangeEventDetails];
  "global-filter-change": [value: string, details: AkazaChangeEventDetails];
  "pagination-change": [value: DataTablePaginationState, details: AkazaChangeEventDetails];
  "expanded-change": [value: DataTableRowKey[], details: AkazaChangeEventDetails];
  "column-visibility-change": [value: DataTableColumnVisibility, details: AkazaChangeEventDetails];
  "column-order-change": [value: string[], details: AkazaChangeEventDetails];
  "column-sizing-change": [value: DataTableColumnSizing, details: AkazaChangeEventDetails];
  "column-pinning-change": [value: DataTableColumnPinning, details: AkazaChangeEventDetails];
  "row-order-change": [value: DataTableRowKey[], details: AkazaChangeEventDetails];
  "reset-change": [details: AkazaChangeEventDetails];
  "row-click": [row: DataTableRow<T>, details: AkazaChangeEventDetails];
  "row-contextmenu": [row: DataTableRow<T>, details: AkazaChangeEventDetails];
  "cell-click": [context: DataTableCellContext<T>, details: AkazaChangeEventDetails];
}>();

defineSlots<DataTableSlots<T>>();

const selection = defineModel<DataTableSelection>("selection", { default: null });
const sorting = defineModel<DataTableSorting[]>("sorting", { default: () => [] });
const filters = defineModel<DataTableFilters>("filters", { default: () => ({}) });
const globalFilter = defineModel<string>("globalFilter", { default: "" });
const pagination = defineModel<DataTablePaginationState>("pagination", {
  default: () => ({ page: 1, pageSize: 10 }),
});
const expanded = defineModel<DataTableRowKey[]>("expanded", { default: () => [] });
const columnVisibility = defineModel<DataTableColumnVisibility>("columnVisibility", { default: () => ({}) });
const columnOrder = defineModel<string[]>("columnOrder", { default: () => [] });
const columnSizing = defineModel<DataTableColumnSizing>("columnSizing", { default: () => ({}) });
const columnPinning = defineModel<DataTableColumnPinning>("columnPinning", {
  default: () => ({ start: [], end: [] }),
});
const rowOrder = defineModel<DataTableRowKey[]>("rowOrder", { default: () => [] });
const attrs = useAttrs();
const slots = useSlots();
const instanceId = `akaza-data-table-${useId().replace(/:/g, "")}`;
const selectionGroupName = `${instanceId}-selection`;

const table = useDataTable<T>({
  data: () => props.data,
  columns: () => props.columns,
  rowKey: (row, index) => typeof props.rowKey === "function" ? props.rowKey(row, index) : row[props.rowKey] as DataTableRowKey,
  sortingMode: () => props.sortingMode,
  manualSorting: () => props.manualSorting,
  manualFiltering: () => props.manualFiltering,
  paginate: () => props.paginate,
  manualPagination: () => props.manualPagination,
  rowCount: () => props.rowCount,
  selectionMode: () => props.selectionMode,
  selectAllScope: () => props.selectAllScope,
  isRowSelectable: row => props.isRowSelectable?.(row) ?? true,
  isRowExpandable: row => props.isRowExpandable?.(row) ?? Boolean(props.getSubRows?.(row)?.length),
  getSubRows: row => props.getSubRows?.(row),
  columnResize: () => props.columnResize,
  dir: () => props.dir,
  selection,
  sorting,
  filters,
  globalFilter,
  pagination,
  expanded,
  columnVisibility,
  columnOrder,
  columnSizing,
  columnPinning,
  rowOrder,
  onSelectionChange: (value, details) => emit("selection-change", value, details),
  onSortingChange: (value, details) => emit("sorting-change", value, details),
  onFiltersChange: (value, details) => emit("filters-change", value, details),
  onGlobalFilterChange: (value, details) => emit("global-filter-change", value, details),
  onPaginationChange: (value, details) => emit("pagination-change", value, details),
  onExpandedChange: (value, details) => emit("expanded-change", value, details),
  onColumnVisibilityChange: (value, details) => emit("column-visibility-change", value, details),
  onColumnOrderChange: (value, details) => emit("column-order-change", value, details),
  onColumnSizingChange: (value, details) => emit("column-sizing-change", value, details),
  onColumnPinningChange: (value, details) => emit("column-pinning-change", value, details),
  onRowOrderChange: (value, details) => emit("row-order-change", value, details),
  onResetChange: details => emit("reset-change", details),
});

const labels = computed(() => ({
  selectAll: props.labels?.selectAll ?? "Select all rows",
  selectRow: props.labels?.selectRow ?? ((index: number) => `Select row ${index + 1}`),
  expandRow: props.labels?.expandRow ?? ((index: number) => `Expand row ${index + 1}`),
  collapseRow: props.labels?.collapseRow ?? ((index: number) => `Collapse row ${index + 1}`),
  sortAscending: props.labels?.sortAscending ?? ((label: string) => `Sort ${label} ascending`),
  sortDescending: props.labels?.sortDescending ?? ((label: string) => `Sort ${label} descending`),
  clearSort: props.labels?.clearSort ?? ((label: string) => `Clear ${label} sorting`),
  resizeColumn: props.labels?.resizeColumn ?? ((label: string) => `Resize ${label} column`),
  reorderColumn: props.labels?.reorderColumn ?? ((label: string) => `Reorder ${label} column`),
  reorderRow: props.labels?.reorderRow ?? ((index: number) => `Reorder row ${index + 1}`),
  loading: props.labels?.loading ?? "Loading results",
  empty: props.labels?.empty ?? props.emptyLabel,
  error: props.labels?.error ?? props.errorLabel,
}));
const visibleHeaderGroups = computed<readonly DataTableHeaderGroup<T>[]>(() => table.headerGroups.value);
const state = computed(() => props.loading ? "loading" : props.error ? "error" : table.rows.value.length ? "ready" : "empty");
const hasFooter = computed(() => table.columns.value.some((column) => column.definition.footer !== undefined)
  || Boolean(slots.footer)
  || Object.keys(slots).some(name => name.endsWith("-footer")));
const showPagination = computed(() => props.showPagination && (props.paginate || props.manualPagination));
const tableWidth = computed(() => table.columns.value.reduce((total, column) => total + column.size, 0));
const nestedPaginationUi = computed<PaginationUi>(() => ({
  ...(props.ui?.paginationRoot && { root: props.ui.paginationRoot }),
  ...(props.ui?.paginationList && { list: props.ui.paginationList }),
  ...(props.ui?.paginationItem && { item: props.ui.paginationItem }),
  ...(props.ui?.paginationFirst && { first: props.ui.paginationFirst }),
  ...(props.ui?.paginationPrevious && { previous: props.ui.paginationPrevious }),
  ...(props.ui?.paginationPage && { page: props.ui.paginationPage }),
  ...(props.ui?.paginationEllipsis && { ellipsis: props.ui.paginationEllipsis }),
  ...(props.ui?.paginationNext && { next: props.ui.paginationNext }),
  ...(props.ui?.paginationLast && { last: props.ui.paginationLast }),
}));
const liveMessage = computed(() => {
  if (props.loading) return labels.value.loading;
  if (props.error) return labels.value.error;
  return `${table.filteredRowCount.value} result${table.filteredRowCount.value === 1 ? "" : "s"}`;
});

function columnLabel(column: DataTableColumnInstance<T>): string {
  return typeof column.definition.header === "string" ? column.definition.header : column.id;
}

function sortLabel(column: DataTableColumnInstance<T>): string {
  const label = columnLabel(column);
  if (column.sorted === "ascending") return labels.value.sortDescending(label);
  if (column.sorted === "descending") return labels.value.clearSort(label);
  return labels.value.sortAscending(label);
}

function renderHeader(header: DataTableHeader<T>): VNodeChild {
  const value = header.column.definition.header;
  if (typeof value === "function") return value(table.getHeaderContext(header));
  if (value !== undefined) return value;
  return columnLabel(header.column);
}

function renderCell(context: DataTableCellContext<T>): VNodeChild | undefined {
  return context.column.definition.cell?.(context);
}

function rowDomId(row: DataTableRow<T>): string {
  return `${instanceId}-row-${typeof row.id}-${encodeURIComponent(String(row.id))}`;
}

function renderFooter(column: DataTableColumnInstance<T>): VNodeChild | undefined {
  const value = column.definition.footer;
  const header = table.headerGroups.value.flatMap((group) => group.headers).find((item) => item.column.id === column.id);
  if (typeof value === "function" && header) return value(table.getHeaderContext(header));
  return typeof value === "function" ? undefined : value;
}

function footerAttributes(column: DataTableColumnInstance<T>) {
  const header = table.headerGroups.value
    .flatMap((group) => group.headers)
    .find((item) => item.column.id === column.id);
  return header ? table.getFooterAttrs(header) : {};
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function errorMessage(): string {
  if (props.error instanceof Error) return props.error.message;
  if (typeof props.error === "string" && props.error) return props.error;
  return labels.value.error;
}

function rowAttributes(row: DataTableRow<T>) {
  return typeof props.rowAttrs === "function" ? props.rowAttrs(row) : props.rowAttrs ?? {};
}

function pinStyle(column: DataTableColumnInstance<T>): CSSProperties | undefined {
  if (!column.pinned) return undefined;
  return {
    position: "sticky",
    [column.pinned === "start" ? "insetInlineStart" : "insetInlineEnd"]: `${column.pinOffset}px`,
  };
}

function setIndeterminate(element: unknown, value: boolean) {
  if (element instanceof HTMLInputElement) element.indeterminate = value;
}

function toggleAllFromControl(event: MouseEvent) {
  const control = event.currentTarget as HTMLInputElement;
  if (table.toggleAllRows(event)) return;
  queueMicrotask(() => {
    control.checked = table.isAllRowsSelected();
    control.indeterminate = table.isSomeRowsSelected();
  });
}

function toggleRowFromControl(row: DataTableRow<T>, event: MouseEvent) {
  const control = event.currentTarget as HTMLInputElement;
  if (table.toggleRow(row, event)) return;
  queueMicrotask(() => {
    control.checked = row.selected;
  });
}

function onRowClick(row: DataTableRow<T>, event: MouseEvent) {
  const change = changeDetails("pointer", event);
  emit("row-click", row, change.details);
  if (change.canceled() || event.defaultPrevented || props.selectionBehavior !== "row") return;
  const target = event.target as Element | null;
  if (target?.closest("a,button,input,select,textarea,label,summary,[contenteditable]:not([contenteditable=false]),[role],[tabindex]:not([tabindex='-1'])")) return;
  table.toggleRow(row, event);
}

function onRowContextmenu(row: DataTableRow<T>, event: MouseEvent) {
  emit("row-contextmenu", row, changeDetails("pointer", event).details);
}

function onCellClick(context: DataTableCellContext<T>, event: MouseEvent) {
  emit("cell-click", context, changeDetails("pointer", event).details);
}

function setPaginationPage(page: number, details: AkazaChangeEventDetails) {
  if (!table.setPage(page, details.event)) details.cancel();
}

const columnGestures = useTableReorder({
  keys: () => table.columns.value.map(column => column.id),
  disabled: key => !props.columnReorder || table.getColumn(key)?.definition.reorderable === false,
  label: key => { const column = table.getColumn(key); return column && columnLabel(column); },
  horizontal: true,
  rtl: () => props.dir === "rtl",
  move: (source, target, event) => table.moveColumn(source, target, event),
});
const reorderRows = computed(() => new Map(table.rows.value.filter(row => row.canReorder).map(row => [rowDomId(row), row])));
const rowGestures = useTableReorder({
  keys: () => [...reorderRows.value.keys()],
  disabled: key => !props.rowReorder || !reorderRows.value.get(key)?.canReorder,
  label: key => { const row = reorderRows.value.get(key); return row && labels.value.reorderRow(row.index); },
  move: (source, target, event) => {
    const sourceRow = reorderRows.value.get(source);
    const targetRow = reorderRows.value.get(target);
    return Boolean(sourceRow && targetRow && table.moveRow(sourceRow.id, targetRow.id, event));
  },
});

let stopResize: (() => void) | undefined;

function resizeOptions() {
  return typeof props.columnResize === "object" ? props.columnResize : {};
}

function startResize(column: DataTableColumnInstance<T>, event: PointerEvent) {
  if (stopResize || columnGestures.busy() || rowGestures.busy() || event.defaultPrevented
    || !props.columnResize || column.definition.resizable === false || event.button !== 0 || event.isPrimary === false) return;
  event.preventDefault();
  const startX = event.clientX;
  const startSize = column.size;
  const direction = props.dir === "rtl" ? -1 : 1;
  const endOnly = resizeOptions().update === "end";
  let lastRequested: number | undefined;
  function request(pointer: PointerEvent) {
    const size = startSize + (pointer.clientX - startX) * direction;
    if (size === lastRequested) return;
    lastRequested = size;
    table.resizeColumn(column.id, size, pointer);
  }
  stopResize = bindDrag(event.currentTarget as HTMLElement, event, {
    cancelOnEscape: true,
    onMove: sample => { if (!endOnly) request(sample.event); },
    onEnd: (release, canceled) => {
      stopResize = undefined;
      if (!canceled) request(release);
    },
  });
}

function resizeWithKeyboard(column: DataTableColumnInstance<T>, event: KeyboardEvent) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home") return;
  event.preventDefault();
  if (event.key === "Home") {
    table.resizeColumn(column.id, column.definition.size ?? 150, event);
    return;
  }
  const configuredStep = resizeOptions().keyboardStep;
  const step = Number.isFinite(configuredStep) && configuredStep! > 0 ? configuredStep! : 10;
  const direction = (event.key === "ArrowRight" ? 1 : -1) * (props.dir === "rtl" ? -1 : 1);
  table.resizeColumn(column.id, column.size + direction * step, event);
}


function startReorder(type: "column" | "row", key: string, event: PointerEvent) {
  const reorder = type === "column" ? columnGestures : rowGestures;
  const other = type === "column" ? rowGestures : columnGestures;
  if (!stopResize && !other.busy()) reorder.pointerdown(key, event);
}

onBeforeUnmount(() => stopResize?.());

defineExpose({
  table,
  getColumn: table.getColumn,
  getRow: table.getRow,
  reset: table.reset,
  clearFilter: table.clearFilter,
  setFilter: table.setFilter,
  setGlobalFilter: table.setGlobalFilter,
  setPage: table.setPage,
  setPageSize: table.setPageSize,
});
</script>

<template>
  <div
    v-bind="attrs"
    :class="ui?.root"
    class="akaza-data-table"
    :dir="dir"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-loading="loading || undefined"
    :data-akaza-error="Boolean(error) || undefined"
    :data-akaza-sticky-header="stickyHeader || undefined"
  >
    <div v-if="$slots.toolbar" :class="ui?.toolbar" class="akaza-data-table-toolbar">
      <slot name="toolbar" :table="table" />
    </div>

    <div :class="ui?.viewport" class="akaza-data-table-viewport">
      <table
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-busy="loading || undefined"
        :class="ui?.table"
        class="akaza-data-table-table"
        :style="{ width: `${tableWidth}px` }"
      >
        <caption v-if="caption || $slots.caption" :class="ui?.caption" class="akaza-data-table-caption">
          <slot name="caption">{{ caption }}</slot>
        </caption>

        <colgroup :class="ui?.colgroup" class="akaza-data-table-colgroup">
          <col
            v-for="column in table.columns.value"
            :key="column.id"
            :class="[ui?.col, column.definition.ui?.column]"
            class="akaza-data-table-col"
            :data-akaza-column="column.id"
            :data-akaza-pinned="column.pinned || undefined"
            :style="{ width: `${column.size}px` }"
          >
        </colgroup>

        <thead :class="ui?.thead" class="akaza-data-table-thead" :data-akaza-sticky="stickyHeader || undefined">
          <tr
            v-for="group in visibleHeaderGroups"
            :key="group.id"
            :class="ui?.headerRow"
            class="akaza-data-table-header-row"
            :data-akaza-depth="group.depth"
          >
            <th
              v-for="header in group.headers"
              :key="header.id"
              :ref="element => { if (!header.column.definition.children?.length) columnGestures.bind(header.column.id, element); }"
              v-bind="table.getHeaderAttrs(header)"
              :colspan="header.colSpan"
              :rowspan="header.rowSpan"
              :scope="header.column.definition.children?.length ? 'colgroup' : 'col'"
              :aria-sort="header.column.sorted || undefined"
              :class="[ui?.headerCell, header.column.definition.ui?.column, header.column.definition.ui?.header]"
              class="akaza-data-table-header-cell"
              :data-akaza-column="header.column.id"
              :data-akaza-sortable="header.column.sortable || undefined"
              :data-akaza-state="header.column.sorted || 'unsorted'"
              :data-state="header.column.sorted || 'unsorted'"
              :data-akaza-pinned="header.column.pinned || undefined"
              :data-akaza-grabbed="columnGestures.grabbed(header.column.id) || undefined"
              :data-akaza-drop-target="columnGestures.target(header.column.id) || undefined"
              :style="pinStyle(header.column)"
            >
              <div :class="ui?.headerContent" class="akaza-data-table-header-content">
                <slot :name="`${header.column.id}-header`" v-bind="table.getHeaderContext(header)">
                  <template v-if="header.column.definition.type === 'selection' && selectionMode === 'multiple'">
                    <input
                      :ref="(element) => setIndeterminate(element, table.isSomeRowsSelected())"
                      type="checkbox"
                      :checked="table.isAllRowsSelected()"
                      :aria-label="labels.selectAll"
                      :class="ui?.selectionControl"
                      class="akaza-data-table-selection-control"
                      @click.stop="toggleAllFromControl"
                    >
                  </template>
                  <button
                    v-else-if="header.column.sortable"
                    type="button"
                    :aria-label="sortLabel(header.column)"
                    :class="ui?.sortTrigger"
                    class="akaza-data-table-sort-trigger"
                    @click="table.toggleSorting(header.column.id, $event)"
                  >
                    <slot name="header" v-bind="table.getHeaderContext(header)">
                      <DataTableRender :content="renderHeader(header)" />
                    </slot>
                    <span :class="ui?.sortIndicator" class="akaza-data-table-sort-indicator" aria-hidden="true">
                      <slot name="sort-indicator" :column="header.column" :sorted="header.column.sorted">
                        {{ header.column.sorted === "ascending" ? "↑" : header.column.sorted === "descending" ? "↓" : "" }}
                      </slot>
                    </span>
                  </button>
                  <slot v-else name="header" v-bind="table.getHeaderContext(header)">
                    <DataTableRender :content="renderHeader(header)" />
                  </slot>
                </slot>

                <button
                  v-if="columnReorder && header.column.definition.reorderable !== false && !header.column.definition.children?.length"
                  type="button"
                  :aria-label="labels.reorderColumn(columnLabel(header.column))"
                  :aria-pressed="columnGestures.grabbed(header.column.id)"
                  :class="ui?.columnReorderHandle"
                  class="akaza-data-table-column-reorder-handle"
                  @pointerdown="startReorder('column', header.column.id, $event)"
                  @keydown="columnGestures.keydown(header.column.id, $event)"
                >
                  <slot name="column-reorder-handle" :column="header.column">⋮⋮</slot>
                </button>

                <span
                  v-if="columnResize && header.column.definition.resizable !== false && !header.column.definition.children?.length"
                  role="separator"
                  tabindex="0"
                  aria-orientation="vertical"
                  :aria-label="labels.resizeColumn(columnLabel(header.column))"
                  :aria-valuemin="header.column.minSize"
                  :aria-valuemax="header.column.maxSize"
                  :aria-valuenow="header.column.size"
                  :class="ui?.resizeHandle"
                  class="akaza-data-table-resize-handle"
                  @pointerdown="startResize(header.column, $event)"
                  @keydown="resizeWithKeyboard(header.column, $event)"
                  @dblclick="table.resizeColumn(header.column.id, header.column.definition.size ?? 150, $event)"
                >
                  <slot name="resize-handle" :column="header.column" />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody :class="ui?.tbody" class="akaza-data-table-tbody">
          <tr v-if="loading" :class="[ui?.loadingRow]" class="akaza-data-table-loading-row" data-akaza-state="loading">
            <td :colspan="Math.max(1, table.columns.value.length)" :class="ui?.loadingCell" class="akaza-data-table-loading-cell">
              <slot name="loading" :table="table">{{ labels.loading }}</slot>
            </td>
          </tr>
          <tr v-else-if="error" :class="ui?.errorRow" class="akaza-data-table-error-row" data-akaza-state="error">
            <td :colspan="Math.max(1, table.columns.value.length)" :class="ui?.errorCell" class="akaza-data-table-error-cell">
              <slot name="error" :error="error" :table="table">{{ errorMessage() }}</slot>
            </td>
          </tr>
          <tr v-else-if="!table.rows.value.length" :class="ui?.emptyRow" class="akaza-data-table-empty-row" data-akaza-state="empty">
            <td :colspan="Math.max(1, table.columns.value.length)" :class="ui?.emptyCell" class="akaza-data-table-empty-cell">
              <slot name="empty" :table="table">{{ labels.empty }}</slot>
            </td>
          </tr>
          <template v-for="row in table.rows.value" v-else :key="rowDomId(row)">
            <tr
              :ref="element => rowGestures.bind(rowDomId(row), element)"
              v-bind="rowAttributes(row)"
              :class="ui?.row"
              class="akaza-data-table-row"
              :data-akaza-row-key="String(row.id)"
              :data-akaza-row-id="rowDomId(row)"
              :data-akaza-row-index="row.index"
              :data-akaza-depth="row.depth"
              :data-akaza-state="row.selected ? 'selected' : 'unselected'"
              :data-state="row.selected ? 'selected' : 'unselected'"
              :data-akaza-selected="row.selected || undefined"
              :data-akaza-expanded="row.expanded || undefined"
              :data-akaza-disabled="row.disabled || undefined"
              :data-akaza-grabbed="rowGestures.grabbed(rowDomId(row)) || undefined"
              :data-akaza-drop-target="rowGestures.target(rowDomId(row)) || undefined"
              @click="onRowClick(row, $event)"
              @contextmenu="onRowContextmenu(row, $event)"
            >
              <component
                :is="context.column.definition.rowHeader ? 'th' : 'td'"
                v-for="context in table.getRowCells(row)"
                :key="context.column.id"
                v-bind="table.getCellAttrs(context)"
                :scope="context.column.definition.rowHeader ? 'row' : undefined"
                :class="[ui?.cell, context.column.definition.ui?.column, context.column.definition.ui?.cell]"
                class="akaza-data-table-cell"
                :data-akaza-column="context.column.id"
                :data-akaza-column-index="context.columnIndex"
                :data-akaza-pinned="context.column.pinned || undefined"
                :style="pinStyle(context.column)"
                @click="onCellClick(context, $event)"
              >
                <div :class="ui?.cellContent" class="akaza-data-table-cell-content">
                  <slot :name="`${context.column.id}-cell`" v-bind="context">
                    <input
                      v-if="context.column.definition.type === 'selection' && selectionMode !== 'none'"
                      :type="selectionMode === 'single' ? 'radio' : 'checkbox'"
                      :name="selectionMode === 'single' ? selectionGroupName : undefined"
                      :checked="context.row.selected"
                      :disabled="context.row.disabled"
                      :aria-label="labels.selectRow(context.row.index)"
                      :class="ui?.selectionControl"
                      class="akaza-data-table-selection-control"
                      @click.stop="toggleRowFromControl(context.row, $event)"
                    >
                    <button
                      v-else-if="context.column.definition.type === 'expander'"
                      type="button"
                      :disabled="!context.row.canExpand"
                      :aria-expanded="context.row.canExpand ? context.row.expanded : undefined"
                      :aria-controls="context.row.expanded && $slots.expanded ? `${rowDomId(context.row)}-details` : undefined"
                      :aria-label="context.row.expanded ? labels.collapseRow(context.row.index) : labels.expandRow(context.row.index)"
                      :class="ui?.expansionTrigger"
                      class="akaza-data-table-expansion-trigger"
                      @click.stop="table.toggleExpanded(context.row, $event)"
                    >
                      <slot name="expansion-trigger" :row="context.row">{{ context.row.expanded ? "−" : "+" }}</slot>
                    </button>
                    <button
                      v-else-if="context.column.definition.type === 'reorder' && rowReorder"
                      type="button"
                      :disabled="!context.row.canReorder"
                      :aria-label="labels.reorderRow(context.row.index)"
                      :aria-pressed="rowGestures.grabbed(rowDomId(context.row))"
                      :class="ui?.reorderHandle"
                      class="akaza-data-table-reorder-handle"
                      :data-akaza-disabled="!context.row.canReorder || undefined"
                      @click.stop
                      @pointerdown.stop="startReorder('row', rowDomId(context.row), $event)"
                      @keydown="rowGestures.keydown(rowDomId(context.row), $event)"
                    >
                      <slot name="reorder-handle" :row="context.row">⋮⋮</slot>
                    </button>
                    <slot v-else name="cell" v-bind="context">
                      <DataTableRender
                        v-if="context.column.definition.cell"
                        :render="() => renderCell(context)"
                      />
                      <template v-else>{{ formatValue(context.value) }}</template>
                    </slot>
                  </slot>
                </div>
              </component>
            </tr>
            <tr
              v-if="row.expanded && $slots.expanded"
              :id="`${rowDomId(row)}-details`"
              :class="ui?.expandedRow"
              class="akaza-data-table-expanded-row"
              data-akaza-state="expanded"
              :data-akaza-row-id="rowDomId(row)"
            >
              <td
                :colspan="Math.max(1, table.columns.value.length)"
                :class="ui?.expandedCell"
                class="akaza-data-table-expanded-cell"
              >
                <slot name="expanded" :row="row" :table="table" />
              </td>
            </tr>
          </template>
        </tbody>

        <tfoot v-if="hasFooter" :class="ui?.tfoot" class="akaza-data-table-tfoot">
          <tr :class="ui?.footerRow" class="akaza-data-table-footer-row">
            <td
              v-for="column in table.columns.value"
              :key="column.id"
              v-bind="footerAttributes(column)"
              :class="[ui?.footerCell, column.definition.ui?.column, column.definition.ui?.footer]"
              class="akaza-data-table-footer-cell"
              :data-akaza-column="column.id"
              :data-akaza-pinned="column.pinned || undefined"
              :style="pinStyle(column)"
            >
              <slot :name="`${column.id}-footer`" :column="column" :table="table">
                <slot name="footer" :column="column" :table="table">
                  <DataTableRender :content="renderFooter(column)" />
                </slot>
              </slot>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="showPagination" :class="ui?.pagination" class="akaza-data-table-pagination">
      <slot
        name="pagination"
        :table="table"
        :page="table.page.value"
        :page-size="table.pageSize.value"
        :page-count="table.pageCount.value"
        :set-page="table.setPage"
        :set-page-size="table.setPageSize"
      >
        <Pagination
          :model-value="table.page.value"
          :total="manualPagination ? (rowCount ?? data.length) : table.filteredRowCount.value"
          :items-per-page="table.pageSize.value"
          show-edges
          :ui="nestedPaginationUi"
          @value-change="setPaginationPage"
        />
      </slot>
    </div>

    <div :class="ui?.liveRegion" class="akaza-data-table-live-region" aria-live="polite" aria-atomic="true">
      {{ liveMessage }}
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-data-table-viewport {
    overflow: auto;
  }

  .akaza-data-table-table {
    border-spacing: 0;
    table-layout: fixed;
  }

  .akaza-data-table-header-cell,
  .akaza-data-table-cell,
  .akaza-data-table-footer-cell {
    box-sizing: border-box;
  }

  .akaza-data-table-header-cell[data-akaza-pinned],
  .akaza-data-table-cell[data-akaza-pinned],
  .akaza-data-table-footer-cell[data-akaza-pinned] {
    background: inherit;
    z-index: 1;
  }

  .akaza-data-table-thead[data-akaza-sticky] .akaza-data-table-header-cell {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .akaza-data-table-thead[data-akaza-sticky] .akaza-data-table-header-cell[data-akaza-pinned] {
    z-index: 3;
  }

  .akaza-data-table-header-content {
    position: relative;
  }

  .akaza-data-table-resize-handle {
    cursor: col-resize;
    inset-block: 0;
    inset-inline-end: 0;
    inline-size: 0.75rem;
    position: absolute;
    touch-action: none;
  }

  .akaza-data-table-column-reorder-handle,
  .akaza-data-table-reorder-handle {
    touch-action: none;
  }

  .akaza-data-table-live-region {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
}
</style>
