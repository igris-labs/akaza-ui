import type { Column, ColumnDef, Header, Row } from "@tanstack/vue-table";
import type { HTMLAttributes, Ref } from "vue";
import type {
  DataTableCellContext,
  DataTableColumn,
  DataTableColumnInstance,
  DataTableColumnPinning,
  DataTableColumnSizing,
  DataTableColumnVisibility,
  DataTableController,
  DataTableFilters,
  DataTableHeader,
  DataTableHeaderContext,
  DataTableHeaderGroup,
  DataTablePaginationState,
  DataTableRow,
  DataTableRowKey,
  DataTableSelection,
  DataTableSorting,
  UseDataTableOptions,
} from "../../components/data-table";
import type { AkazaChangeEventDetails } from "../../types";
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";
import { computed, shallowRef, toValue, watch } from "vue";

const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

type EngineFeatures = typeof dataTableFeatures;
type EngineColumn<T extends object> = Column<EngineFeatures, T, unknown>;
type EngineHeader<T extends object> = Header<EngineFeatures, T, unknown>;
type EngineRow<T extends object> = Row<EngineFeatures, T>;

interface EngineColumnMeta<T> {
  definition: DataTableColumn<T>;
  sourceIndex: number;
}

function createDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  };
  return { details, canceled: () => canceled };
}

function encodeRowKey(key: DataTableRowKey): string {
  return typeof key === "number" ? `number:${key}` : `string:${encodeURIComponent(key)}`;
}

function decodeRowKey(id: string): DataTableRowKey {
  if (id.startsWith("number:")) return Number(id.slice(7));
  return decodeURIComponent(id.slice(7));
}

function moveItem<T>(items: readonly T[], source: T, target: T): T[] {
  const next = [...items];
  const sourceIndex = next.indexOf(source);
  const targetIndex = next.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return next;
  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, source);
  return next;
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function isDataTableRowKey(value: unknown): value is DataTableRowKey {
  return typeof value === "string" || typeof value === "number" && Number.isFinite(value);
}

function mergeAttrs(
  attrs: HTMLAttributes | ((context: never) => HTMLAttributes) | undefined,
  context: unknown,
): HTMLAttributes {
  return typeof attrs === "function" ? attrs(context as never) : attrs ?? {};
}

export function useDataTable<T extends object>(options: UseDataTableOptions<T>): DataTableController<T> {
  const selection = options.selection ?? shallowRef<DataTableSelection>(null);
  const sorting = options.sorting ?? shallowRef<DataTableSorting[]>([]);
  const filters = options.filters ?? shallowRef<DataTableFilters>({});
  const globalFilter = options.globalFilter ?? shallowRef("");
  const pagination = options.pagination ?? shallowRef<DataTablePaginationState>({ page: 1, pageSize: 10 });
  const expanded = options.expanded ?? shallowRef<DataTableRowKey[]>([]);
  const columnVisibility = options.columnVisibility ?? shallowRef<DataTableColumnVisibility>({});
  const columnOrder = options.columnOrder ?? shallowRef<string[]>([]);
  const columnSizing = options.columnSizing ?? shallowRef<DataTableColumnSizing>({});
  const columnPinning = options.columnPinning ?? shallowRef<DataTableColumnPinning>({ start: [], end: [] });
  const rowOrder = options.rowOrder ?? shallowRef<DataTableRowKey[]>([]);

  function resolveColumnId(column: DataTableColumn<T>, index: number): string {
    if (column.id) return column.id;
    if (typeof column.accessor === "string") return column.accessor;
    throw new Error(`DataTable column at index ${index} requires an id.`);
  }

  function validateColumnSize(id: string, key: "maxSize" | "minSize" | "size", value: number | undefined) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`DataTable column "${id}" has an invalid ${key}.`);
    }
  }

  function flattenDefinitions(
    definitions: readonly DataTableColumn<T>[],
    result: Array<{ definition: DataTableColumn<T>; id: string; depth: number; index: number }> = [],
    depth = 0,
    path = "columns",
    seen = new Set<string>(),
  ) {
    for (const [index, definition] of definitions.entries()) {
      const id = resolveColumnId(definition, index);
      if (seen.has(id)) throw new Error(`DataTable column id "${id}" is duplicated.`);
      seen.add(id);
      validateColumnSize(id, "size", definition.size);
      validateColumnSize(id, "minSize", definition.minSize);
      validateColumnSize(id, "maxSize", definition.maxSize);
      if (
        definition.minSize !== undefined
        && definition.maxSize !== undefined
        && definition.minSize > definition.maxSize
      ) {
        throw new Error(`DataTable column "${id}" has minSize greater than maxSize.`);
      }
      result.push({ definition, id, depth, index: result.length });
      if (definition.children?.length) {
        flattenDefinitions(definition.children, result, depth + 1, `${path}[${index}].children`, seen);
      }
    }
    return result;
  }

  const flattenedDefinitions = computed(() => flattenDefinitions(toValue(options.columns)));
  const leafDefinitions = computed(() => flattenedDefinitions.value.filter((item) => !item.definition.children?.length));
  const defaultColumnVisibility = computed(() => Object.fromEntries(
    leafDefinitions.value
      .filter(({ definition }) => definition.hidden)
      .map(({ id }) => [id, false]),
  ));
  const defaultColumnPinning = computed<DataTableColumnPinning>(() => ({
    start: leafDefinitions.value.filter(({ definition }) => definition.pinned === "start").map(({ id }) => id),
    end: leafDefinitions.value.filter(({ definition }) => definition.pinned === "end").map(({ id }) => id),
  }));

  const initializedColumnIds = new Set<string>();
  watch(leafDefinitions, (definitions) => {
    const nextVisibility = { ...columnVisibility.value };
    const nextPinning = {
      start: [...columnPinning.value.start],
      end: [...columnPinning.value.end],
    };
    let visibilityChanged = false;
    let pinningChanged = false;

    for (const { definition, id } of definitions) {
      if (initializedColumnIds.has(id)) continue;
      initializedColumnIds.add(id);
      if (definition.hidden && !(id in nextVisibility)) {
        nextVisibility[id] = false;
        visibilityChanged = true;
      }
      if (definition.pinned && !nextPinning.start.includes(id) && !nextPinning.end.includes(id)) {
        nextPinning[definition.pinned].push(id);
        pinningChanged = true;
      }
    }

    if (visibilityChanged) columnVisibility.value = nextVisibility;
    if (pinningChanged) columnPinning.value = nextPinning;
  }, { immediate: true });

  function getRowKey(row: T, index: number): DataTableRowKey {
    const key = typeof options.rowKey === "function" ? options.rowKey(row, index) : row[options.rowKey] as DataTableRowKey;
    if ((typeof key !== "string" && typeof key !== "number") || (typeof key === "number" && !Number.isFinite(key))) {
      throw new TypeError("DataTable rowKey must resolve to a finite number or string.");
    }
    return key;
  }

  function validateRowKeys(
    rows: readonly T[],
    keys = new Set<DataTableRowKey>(),
    ancestors = new Set<T>(),
  ) {
    for (const [index, row] of rows.entries()) {
      if (ancestors.has(row)) throw new Error("DataTable getSubRows returned a circular row hierarchy.");
      const key = getRowKey(row, index);
      if (keys.has(key)) throw new Error(`DataTable rowKey "${String(key)}" is duplicated.`);
      keys.add(key);
      const children = options.getSubRows?.(row);
      if (!children?.length) continue;
      ancestors.add(row);
      validateRowKeys(children, keys, ancestors);
      ancestors.delete(row);
    }
  }

  const orderedData = computed(() => {
    const data = [...toValue(options.data)];
    validateRowKeys(data);
    const configuredOrder = unique(rowOrder.value.filter(isDataTableRowKey));
    if (!configuredOrder.length) return data;
    const byKey = new Map(data.map((row, index) => [getRowKey(row, index), row]));
    const ordered = configuredOrder.flatMap((key) => byKey.has(key) ? [byKey.get(key)!] : []);
    const orderedKeys = new Set(configuredOrder);
    return [...ordered, ...data.filter((row, index) => !orderedKeys.has(getRowKey(row, index)))];
  });

  function mapColumn(definition: DataTableColumn<T>, sourceIndex: number): ColumnDef<EngineFeatures, T, unknown> {
    const id = resolveColumnId(definition, sourceIndex);
    const hasAccessor = definition.accessor !== undefined;
    const meta: EngineColumnMeta<T> = { definition, sourceIndex };
    const base: ColumnDef<EngineFeatures, T, unknown> = {
      id,
      header: id,
      meta,
      enableColumnFilter: definition.filterable ?? hasAccessor,
      enableGlobalFilter: definition.filterable ?? hasAccessor,
      enableHiding: definition.type !== "selection" && definition.type !== "reorder",
      enablePinning: definition.pinned !== false,
      enableSorting: definition.sortable ?? hasAccessor,
      ...(hasAccessor && !definition.filter && { filterFn: "includesString" as const }),
      ...(definition.minSize !== undefined && { minSize: definition.minSize }),
      ...(definition.maxSize !== undefined && { maxSize: definition.maxSize }),
      ...(definition.size !== undefined && { size: definition.size }),
      ...(definition.compare && {
        sortFn: (rowA, rowB, columnId) => definition.compare!(
          rowA.getValue(columnId),
          rowB.getValue(columnId),
          rowA.original,
          rowB.original,
        ),
      }),
      ...(definition.filter && {
        filterFn: (row, columnId, value) => definition.filter!(row.getValue(columnId), value, row.original),
      }),
    };

    if (definition.children?.length) {
      return {
        ...base,
        columns: definition.children.map((child, index) => mapColumn(child, index)),
      };
    }
    if (typeof definition.accessor === "function") return { ...base, accessorFn: definition.accessor };
    if (typeof definition.accessor === "string") return { ...base, accessorKey: definition.accessor };
    return base;
  }

  const engineColumns = computed<ColumnDef<EngineFeatures, T, unknown>[]>(() =>
    toValue(options.columns).map((column, index) => mapColumn(column, index)));
  const selectedKeys = computed(() => {
    const mode = toValue(options.selectionMode) ?? "none";
    if (mode === "none") return [];
    const keys = unique((Array.isArray(selection.value) ? selection.value : [selection.value])
      .filter(isDataTableRowKey));
    return mode === "single" ? keys.slice(0, 1) : keys;
  });
  const validExpandedKeys = computed(() => unique(expanded.value.filter(isDataTableRowKey)));
  const leafColumnIds = computed(() => new Set(leafDefinitions.value.map(({ id }) => id)));
  const normalizedColumnOrder = computed(() => unique(columnOrder.value).filter(id => leafColumnIds.value.has(id)));
  const normalizedColumnSizing = computed(() => Object.fromEntries(
    Object.entries(columnSizing.value).filter(([id, size]) => leafColumnIds.value.has(id)
      && Number.isFinite(size)
      && size >= 0),
  ));
  const normalizedColumnPinning = computed<DataTableColumnPinning>(() => {
    const start = unique(columnPinning.value.start).filter(id => leafColumnIds.value.has(id));
    const startIds = new Set(start);
    return {
      start,
      end: unique(columnPinning.value.end).filter(id => leafColumnIds.value.has(id) && !startIds.has(id)),
    };
  });
  const normalizedPagination = computed(() => ({
    page: Number.isFinite(pagination.value.page) ? Math.max(1, Math.floor(pagination.value.page)) : 1,
    pageSize: Number.isFinite(pagination.value.pageSize) ? Math.max(1, Math.floor(pagination.value.pageSize)) : 10,
  }));
  const engineState = computed(() => ({
    sorting: sorting.value.map((item) => ({ id: item.id, desc: item.direction === "descending" })),
    columnFilters: Object.entries(filters.value).map(([id, value]) => ({ id, value })),
    globalFilter: globalFilter.value,
    pagination: {
      pageIndex: normalizedPagination.value.page - 1,
      pageSize: normalizedPagination.value.pageSize,
    },
    expanded: Object.fromEntries(validExpandedKeys.value.map((key) => [encodeRowKey(key), true])),
    rowSelection: Object.fromEntries(selectedKeys.value.map((key) => [encodeRowKey(key), true as const])),
    columnVisibility: columnVisibility.value,
    columnOrder: normalizedColumnOrder.value,
    columnSizing: normalizedColumnSizing.value,
    columnPinning: normalizedColumnPinning.value,
  }));
  const paginationEnabled = computed(() => Boolean(toValue(options.paginate) || toValue(options.manualPagination)));

  const table = useTable<EngineFeatures, T>({
    features: dataTableFeatures,
    columns: engineColumns,
    data: orderedData,
    getRowId: (row, index) => encodeRowKey(getRowKey(row, index)),
    ...(options.getSubRows && { getSubRows: options.getSubRows }),
    getRowCanExpand: (row) => options.isRowExpandable?.(row.original) ?? row.subRows.length > 0,
    enableRowSelection: (row) => options.isRowSelectable?.(row.original) ?? true,
    enableMultiRowSelection: computed(() => toValue(options.selectionMode) === "multiple"),
    enableSorting: true,
    enableMultiSort: computed(() => toValue(options.sortingMode) === "multiple"),
    autoResetPageIndex: false,
    manualSorting: computed(() => Boolean(toValue(options.manualSorting))),
    manualFiltering: computed(() => Boolean(toValue(options.manualFiltering))),
    manualPagination: computed(() => !paginationEnabled.value || Boolean(toValue(options.manualPagination))),
    rowCount: computed(() => {
      const value = toValue(options.rowCount);
      return Number.isFinite(value) ? Math.max(0, value!) : undefined;
    }),
    globalFilterFn: "includesString",
    state: engineState,
  });

  function commit<TValue>(
    target: Ref<TValue>,
    next: TValue,
    reason: string,
    event: Event | undefined,
    callback: ((value: TValue, details: AkazaChangeEventDetails) => void) | undefined,
  ): boolean {
    const change = createDetails(reason, event);
    callback?.(next, change.details);
    if (change.canceled()) return false;
    target.value = next;
    return true;
  }

  function commitWithPageReset<TValue>(
    target: Ref<TValue>,
    next: TValue,
    reason: string,
    pageReason: string,
    event: Event | undefined,
    callback: ((value: TValue, details: AkazaChangeEventDetails) => void) | undefined,
  ): boolean {
    const change = createDetails(reason, event);
    callback?.(next, change.details);
    const shouldResetPage = pagination.value.page !== 1;
    const nextPagination = { ...pagination.value, page: 1 };
    const pageChange = createDetails(pageReason, event);
    if (shouldResetPage) options.onPaginationChange?.(nextPagination, pageChange.details);
    if (change.canceled() || pageChange.canceled()) return false;
    target.value = next;
    if (shouldResetPage) pagination.value = nextPagination;
    return true;
  }

  function getMeta(column: EngineColumn<T>): EngineColumnMeta<T> {
    return column.columnDef.meta as EngineColumnMeta<T>;
  }

  let controller: DataTableController<T>;

  function wrapColumn(column: EngineColumn<T>): DataTableColumnInstance<T> {
    const meta = getMeta(column);
    const sortedValue = column.getIsSorted();
    const pin = column.getIsPinned();
    return {
      id: column.id,
      definition: meta.definition,
      depth: column.depth,
      index: meta.sourceIndex,
      size: column.getSize(),
      minSize: meta.definition.minSize ?? 20,
      maxSize: meta.definition.maxSize ?? Number.MAX_SAFE_INTEGER,
      visible: column.getIsVisible(),
      sortable: column.getCanSort(),
      sorted: sortedValue === false ? false : sortedValue === "asc" ? "ascending" : "descending",
      sortIndex: column.getSortIndex(),
      filterable: column.getCanFilter(),
      filterValue: filters.value[column.id],
      pinned: pin,
      pinOffset: pin === false ? 0 : column.getStart(pin),
    };
  }

  function wrapRow(row: EngineRow<T>): DataTableRow<T> {
    const id = decodeRowKey(row.id);
    return {
      id,
      original: row.original,
      index: row.getDisplayIndex(),
      originalIndex: row.index,
      depth: row.depth,
      get selected() {
        return selectedKeys.value.includes(id);
      },
      get expanded() {
        return validExpandedKeys.value.includes(id);
      },
      get disabled() {
        return !(options.isRowSelectable?.(row.original) ?? true);
      },
      get canExpand() {
        return options.isRowExpandable?.(row.original) ?? row.subRows.length > 0;
      },
      get canReorder() {
        return row.depth === 0 && sorting.value.length === 0;
      },
      getValue: <TValue = unknown>(columnId: string) => row.getValue<TValue>(columnId),
      toggleSelected: (event?: Event) => controller.toggleRow(wrapRow(row), event),
      toggleExpanded: (event?: Event) => controller.toggleExpanded(wrapRow(row), event),
    };
  }

  function wrapHeader(header: EngineHeader<T>): DataTableHeader<T> {
    return {
      id: header.id,
      depth: header.depth,
      colSpan: header.colSpan,
      rowSpan: header.rowSpan,
      placeholder: header.isPlaceholder,
      column: wrapColumn(header.column),
    };
  }

  const columns = computed(() => {
    engineState.value;
    engineColumns.value;
    return table.getVisibleLeafColumns().map(wrapColumn);
  });
  const headerGroups = computed<DataTableHeaderGroup<T>[]>(() => {
    engineState.value;
    engineColumns.value;
    return table.getHeaderGroups().map((group) => ({
      id: group.id,
      depth: group.depth,
      headers: group.headers.filter((header) => header.rowSpan > 0).map(wrapHeader),
    }));
  });
  const rows = computed(() => {
    engineState.value;
    orderedData.value;
    return table.getRowModel().rows.map(wrapRow);
  });
  const selectedRows = computed(() => {
    engineState.value;
    orderedData.value;
    return table.getSelectedRowModel().rows.map(wrapRow);
  });
  const filteredRowCount = computed(() => {
    engineState.value;
    orderedData.value;
    return table.getFilteredRowModel().flatRows.length;
  });
  const pageCount = computed(() => {
    engineState.value;
    if (!paginationEnabled.value) return 1;
    const configuredRowCount = toValue(options.rowCount);
    const total = toValue(options.manualPagination)
      ? Number.isFinite(configuredRowCount) ? Math.max(0, configuredRowCount!) : orderedData.value.length
      : filteredRowCount.value;
    return Math.max(1, Math.ceil(total / normalizedPagination.value.pageSize));
  });
  const page = computed(() => Math.min(pageCount.value, normalizedPagination.value.page));
  const pageSize = computed(() => normalizedPagination.value.pageSize);

  watch([pageCount, normalizedPagination], ([count, next]) => {
    const normalized = { page: Math.min(count, next.page), pageSize: next.pageSize };
    if (pagination.value.page !== normalized.page || pagination.value.pageSize !== normalized.pageSize) {
      pagination.value = normalized;
    }
  }, { immediate: true });

  function getEngineRow(id: DataTableRowKey): EngineRow<T> | undefined {
    try {
      return table.getRow(encodeRowKey(id), true);
    } catch {
      return undefined;
    }
  }

  function getEngineColumn(id: string): EngineColumn<T> | undefined {
    return table.getColumn(id);
  }

  function getColumn(id: string): DataTableColumnInstance<T> | undefined {
    const column = getEngineColumn(id);
    return column ? wrapColumn(column) : undefined;
  }

  function getRow(id: DataTableRowKey): DataTableRow<T> | undefined {
    const row = getEngineRow(id);
    return row ? wrapRow(row) : undefined;
  }

  function getCellContext(
    row: DataTableRow<T>,
    column: DataTableColumnInstance<T>,
  ): DataTableCellContext<T> {
    return {
      table: controller,
      row,
      column,
      value: row.getValue(column.id),
      rowIndex: row.index,
      columnIndex: columns.value.findIndex((item) => item.id === column.id),
    };
  }

  function getHeaderContext(header: DataTableHeader<T>): DataTableHeaderContext<T> {
    return {
      table: controller,
      column: header.column,
      header,
      sorted: header.column.sorted,
      size: header.column.size,
      toggleSorting: (event?: Event) => controller.toggleSorting(header.column.id, event),
    };
  }

  function getRowCells(row: DataTableRow<T>): DataTableCellContext<T>[] {
    return columns.value.map((column) => getCellContext(row, column));
  }

  function setFilter(columnId: string, value: unknown, event?: Event): boolean {
    if (!getColumn(columnId)?.filterable) return false;
    const next = { ...filters.value };
    if (value === undefined) delete next[columnId];
    else next[columnId] = value;
    return commitWithPageReset(filters, next, "filter", "filter-reset", event, options.onFiltersChange);
  }

  function clearFilter(columnId: string, event?: Event): boolean {
    return setFilter(columnId, undefined, event);
  }

  function setGlobalFilter(value: string, event?: Event): boolean {
    return commitWithPageReset(
      globalFilter,
      value,
      "filter",
      "filter-reset",
      event,
      options.onGlobalFilterChange,
    );
  }

  function toggleSorting(columnId: string, event?: Event): boolean {
    const column = getColumn(columnId);
    if (!column?.sortable) return false;
    const existingIndex = sorting.value.findIndex((item) => item.id === columnId);
    const current = sorting.value[existingIndex];
    const direction = !current
      ? "ascending"
      : current.direction === "ascending" ? "descending" : false;
    const multiEvent = event instanceof KeyboardEvent || event instanceof MouseEvent
      ? event.shiftKey || event.ctrlKey || event.metaKey
      : false;
    const multiple = toValue(options.sortingMode) === "multiple" && multiEvent;
    const next = multiple ? [...sorting.value] : [];
    const nextIndex = next.findIndex((item) => item.id === columnId);
    if (nextIndex >= 0) next.splice(nextIndex, 1);
    if (direction) next.push({ id: columnId, direction });
    return commitWithPageReset(
      sorting,
      next,
      direction || "none",
      "sorting-reset",
      event,
      options.onSortingChange,
    );
  }

  function toggleRow(row: DataTableRow<T>, event?: Event): boolean {
    if (toValue(options.selectionMode) === "none" || row.disabled) return false;
    const selected = selectedKeys.value.includes(row.id);
    let next: DataTableSelection;
    if (toValue(options.selectionMode) === "single") next = selected ? null : row.id;
    else next = selected
      ? selectedKeys.value.filter((key) => key !== row.id)
      : [...selectedKeys.value, row.id];
    const changed = commit(selection, next, selected ? "deselect" : "select", event, options.onSelectionChange);
    return changed;
  }

  function selectableScopeRows(): DataTableRow<T>[] {
    const scope = toValue(options.selectAllScope) ?? "page";
    const engineRows = scope === "filtered" ? table.getFilteredRowModel().flatRows : table.getRowModel().rows;
    return engineRows.map(wrapRow).filter((row) => !row.disabled);
  }

  function isAllRowsSelected(): boolean {
    const scopeRows = selectableScopeRows();
    return scopeRows.length > 0 && scopeRows.every((row) => selectedKeys.value.includes(row.id));
  }

  function isSomeRowsSelected(): boolean {
    const scopeRows = selectableScopeRows();
    const count = scopeRows.filter((row) => selectedKeys.value.includes(row.id)).length;
    return count > 0 && count < scopeRows.length;
  }

  function toggleAllRows(event?: Event): boolean {
    if (toValue(options.selectionMode) !== "multiple") return false;
    const scopeRows = selectableScopeRows();
    const scopeKeys = new Set(scopeRows.map((row) => row.id));
    const next = isAllRowsSelected()
      ? selectedKeys.value.filter((key) => !scopeKeys.has(key))
      : unique([...selectedKeys.value, ...scopeKeys]);
    const changed = commit(selection, next, isAllRowsSelected() ? "deselect-all" : "select-all", event, options.onSelectionChange);
    return changed;
  }

  function toggleExpanded(row: DataTableRow<T>, event?: Event): boolean {
    if (!row.canExpand) return false;
    const isExpanded = validExpandedKeys.value.includes(row.id);
    const next = isExpanded ? validExpandedKeys.value.filter((key) => key !== row.id) : [...validExpandedKeys.value, row.id];
    const changed = commit(expanded, next, isExpanded ? "collapse" : "expand", event, options.onExpandedChange);
    return changed;
  }

  function setPage(value: number, event?: Event, reason = "page"): boolean {
    if (!Number.isFinite(value)) return false;
    const next = { ...pagination.value, page: Math.min(pageCount.value, Math.max(1, Math.floor(value))) };
    return commit(pagination, next, reason, event, options.onPaginationChange);
  }

  function setPageSize(value: number, event?: Event): boolean {
    if (!Number.isFinite(value)) return false;
    const next = { page: 1, pageSize: Math.max(1, Math.floor(value)) };
    return commit(pagination, next, "page-size", event, options.onPaginationChange);
  }

  function setColumnVisible(columnId: string, visible: boolean, event?: Event): boolean {
    const engineColumn = getEngineColumn(columnId);
    if (!engineColumn?.getCanHide()) return false;
    const next = { ...columnVisibility.value, [columnId]: visible };
    const changed = commit(
      columnVisibility,
      next,
      visible ? "show" : "hide",
      event,
      options.onColumnVisibilityChange,
    );
    return changed;
  }

  function setColumnPinned(columnId: string, side: false | "end" | "start", event?: Event): boolean {
    const engineColumn = getEngineColumn(columnId);
    if (!engineColumn?.getCanPin()) return false;
    const next = {
      start: normalizedColumnPinning.value.start.filter((id) => id !== columnId),
      end: normalizedColumnPinning.value.end.filter((id) => id !== columnId),
    };
    if (side) next[side].push(columnId);
    const changed = commit(columnPinning, next, side ? `pin-${side}` : "unpin", event, options.onColumnPinningChange);
    return changed;
  }

  function resizeColumn(columnId: string, size: number, event?: Event): boolean {
    if (!Number.isFinite(size)) return false;
    const column = getColumn(columnId);
    if (!column || column.definition.resizable === false || !toValue(options.columnResize)) return false;
    const nextSize = Math.min(column.maxSize, Math.max(column.minSize, Math.round(size)));
    const next = { ...normalizedColumnSizing.value, [columnId]: nextSize };
    const resize = toValue(options.columnResize);
    if (typeof resize === "object" && resize.behavior === "fit") {
      const currentIndex = columns.value.findIndex((item) => item.id === column.id);
      const partner = columns.value[currentIndex + 1] ?? columns.value[currentIndex - 1];
      if (!partner) return false;
      const requestedDelta = nextSize - column.size;
      const partnerSize = Math.min(partner.maxSize, Math.max(partner.minSize, partner.size - requestedDelta));
      const acceptedDelta = partner.size - partnerSize;
      next[columnId] = Math.min(column.maxSize, Math.max(column.minSize, column.size + acceptedDelta));
      next[partner.id] = partnerSize;
    }
    const changed = commit(columnSizing, next, "resize", event, options.onColumnSizingChange);
    return changed;
  }

  function moveColumn(columnId: string, targetId: string, event?: Event): boolean {
    const source = getColumn(columnId);
    const target = getColumn(targetId);
    if (!source || !target || source.definition.reorderable === false) return false;
    const naturalOrder = leafDefinitions.value.map(({ id }) => id);
    const current = unique([...columnOrder.value, ...naturalOrder]).filter((id) => naturalOrder.includes(id));
    const next = moveItem(current, columnId, targetId);
    if (next.every((id, index) => id === current[index])) return false;
    const changed = commit(columnOrder, next, "reorder", event, options.onColumnOrderChange);
    return changed;
  }

  function moveRow(rowId: DataTableRowKey, targetId: DataTableRowKey, event?: Event): boolean {
    const row = getRow(rowId);
    const target = getRow(targetId);
    if (!row?.canReorder || !target?.canReorder) return false;
    const naturalOrder = orderedData.value.map((row, index) => getRowKey(row, index));
    const configuredOrder = unique(rowOrder.value.filter(isDataTableRowKey));
    const current = configuredOrder.length ? configuredOrder : naturalOrder;
    const next = moveItem(current, rowId, targetId);
    if (next.every((id, index) => id === current[index])) return false;
    return commit(rowOrder, next, "reorder", event, options.onRowOrderChange);
  }

  function reset(event?: Event): boolean {
    const change = createDetails("reset", event);
    options.onResetChange?.(change.details);
    if (change.canceled()) return false;
    selection.value = null;
    sorting.value = [];
    filters.value = {};
    globalFilter.value = "";
    pagination.value = { page: 1, pageSize: pagination.value.pageSize };
    expanded.value = [];
    columnVisibility.value = { ...defaultColumnVisibility.value };
    columnOrder.value = [];
    columnSizing.value = {};
    columnPinning.value = {
      start: [...defaultColumnPinning.value.start],
      end: [...defaultColumnPinning.value.end],
    };
    rowOrder.value = [];
    return true;
  }

  controller = {
    columns,
    headerGroups,
    rows,
    selectedRows,
    filteredRowCount,
    pageCount,
    page,
    pageSize,
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
    getColumn,
    getRow,
    getCellContext,
    getHeaderContext,
    getRowCells,
    getHeaderAttrs: (header) => mergeAttrs(header.column.definition.attrs?.header, getHeaderContext(header)),
    getCellAttrs: (context) => mergeAttrs(context.column.definition.attrs?.cell, context),
    getFooterAttrs: (header) => mergeAttrs(header.column.definition.attrs?.footer, getHeaderContext(header)),
    setFilter,
    clearFilter,
    setGlobalFilter,
    toggleSorting,
    toggleRow,
    toggleAllRows,
    isAllRowsSelected,
    isSomeRowsSelected,
    toggleExpanded,
    setPage,
    setPageSize,
    setColumnVisible,
    setColumnPinned,
    resizeColumn,
    moveColumn,
    moveRow,
    reset,
  };
  return controller;
}
