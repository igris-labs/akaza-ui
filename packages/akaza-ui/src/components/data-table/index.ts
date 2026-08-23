import type { HTMLAttributes, MaybeRefOrGetter, Ref, VNodeChild } from "vue";
import type { AkazaChangeEventDetails } from "../../types";

export { default as DataTable } from "./DataTable.vue";

export type DataTableRowKey = number | string;
export type DataTableColumnType = "data" | "display" | "selection" | "expander" | "reorder";
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableSelectionMode = "multiple" | "none" | "single";
export type DataTableSelectionBehavior = "control" | "row";
export type DataTableSelectAllScope = "filtered" | "page";
export type DataTableSortingMode = "multiple" | "single";
export type DataTableColumnResizeBehavior = "expand" | "fit";
export type DataTableColumnResizeUpdate = "change" | "end";
export type DataTableSelection = DataTableRowKey | DataTableRowKey[] | null;
export type DataTableFilters = Record<string, unknown>;
export type DataTableColumnVisibility = Record<string, boolean>;
export type DataTableColumnSizing = Record<string, number>;

export interface DataTableSorting {
  id: string;
  direction: DataTableSortDirection;
}

export interface DataTablePaginationState {
  page: number;
  pageSize: number;
}

export interface DataTableColumnPinning {
  start: string[];
  end: string[];
}

export interface DataTableColumnResizeOptions {
  behavior?: DataTableColumnResizeBehavior;
  update?: DataTableColumnResizeUpdate;
  keyboardStep?: number;
}

export interface DataTableLabels {
  selectAll?: string;
  selectRow?: (index: number) => string;
  expandRow?: (index: number) => string;
  collapseRow?: (index: number) => string;
  sortAscending?: (label: string) => string;
  sortDescending?: (label: string) => string;
  clearSort?: (label: string) => string;
  resizeColumn?: (label: string) => string;
  reorderColumn?: (label: string) => string;
  reorderRow?: (index: number) => string;
  moveBefore?: string;
  moveAfter?: string;
  loading?: string;
  empty?: string;
  error?: string;
}

export interface DataTableUi {
  root?: string;
  toolbar?: string;
  viewport?: string;
  table?: string;
  colgroup?: string;
  col?: string;
  caption?: string;
  thead?: string;
  headerRow?: string;
  headerCell?: string;
  headerContent?: string;
  sortTrigger?: string;
  sortIndicator?: string;
  resizeHandle?: string;
  columnReorderHandle?: string;
  tbody?: string;
  row?: string;
  cell?: string;
  cellContent?: string;
  selectionControl?: string;
  expansionTrigger?: string;
  reorderHandle?: string;
  expandedRow?: string;
  expandedCell?: string;
  loadingRow?: string;
  loadingCell?: string;
  errorRow?: string;
  errorCell?: string;
  emptyRow?: string;
  emptyCell?: string;
  tfoot?: string;
  footerRow?: string;
  footerCell?: string;
  pagination?: string;
  paginationRoot?: string;
  paginationList?: string;
  paginationItem?: string;
  paginationFirst?: string;
  paginationPrevious?: string;
  paginationPage?: string;
  paginationEllipsis?: string;
  paginationNext?: string;
  paginationLast?: string;
  liveRegion?: string;
}

export interface DataTableColumnUi {
  column?: string;
  header?: string;
  cell?: string;
  footer?: string;
}

export interface DataTableColumnAttrs<T> {
  header?: HTMLAttributes | ((context: DataTableHeaderContext<T>) => HTMLAttributes);
  cell?: HTMLAttributes | ((context: DataTableCellContext<T>) => HTMLAttributes);
  footer?: HTMLAttributes | ((context: DataTableHeaderContext<T>) => HTMLAttributes);
}

export interface DataTableColumn<T, TValue = unknown> {
  id?: string;
  type?: DataTableColumnType;
  accessor?: (keyof T & string) | ((row: T, index: number) => TValue);
  header?: string | ((context: DataTableHeaderContext<T>) => VNodeChild);
  cell?: (context: DataTableCellContext<T, TValue>) => VNodeChild;
  footer?: string | ((context: DataTableHeaderContext<T>) => VNodeChild);
  children?: readonly DataTableColumn<T>[];
  sortable?: boolean;
  compare?: (a: TValue, b: TValue, rowA: T, rowB: T) => number;
  filterable?: boolean;
  filter?: (value: TValue, filterValue: unknown, row: T) => boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  reorderable?: boolean;
  pinned?: "end" | "start" | false;
  hidden?: boolean;
  rowHeader?: boolean;
  ui?: DataTableColumnUi;
  attrs?: DataTableColumnAttrs<T>;
  metadata?: Record<string, unknown>;
}

type DataTableAccessorColumnOptions<T, TValue> = Omit<DataTableColumn<T, TValue>, "accessor" | "children">;
type DataTableDisplayColumnOptions<T> = Omit<DataTableColumn<T>, "accessor" | "children" | "id">;
type DataTableGroupColumnOptions<T> = Omit<DataTableColumn<T>, "accessor" | "children" | "id" | "type">;

export interface DataTableColumnHelper<T> {
  accessor: {
    <TKey extends keyof T & string>(
      key: TKey,
      options?: DataTableAccessorColumnOptions<T, T[TKey]>,
    ): DataTableColumn<T, T[TKey]>;
    <TValue>(
      accessor: (row: T, index: number) => TValue,
      options: DataTableAccessorColumnOptions<T, TValue> & { id: string },
    ): DataTableColumn<T, TValue>;
  };
  display: (id: string, options?: DataTableDisplayColumnOptions<T>) => DataTableColumn<T>;
  group: (
    id: string,
    children: readonly DataTableColumn<T>[],
    options?: DataTableGroupColumnOptions<T>,
  ) => DataTableColumn<T>;
}

export function createDataTableColumnHelper<T>(): DataTableColumnHelper<T> {
  function accessor<TValue>(
    value: (keyof T & string) | ((row: T, index: number) => TValue),
    options: DataTableAccessorColumnOptions<T, TValue> = {},
  ): DataTableColumn<T, TValue> {
    return { ...options, accessor: value };
  }

  return {
    accessor: accessor as DataTableColumnHelper<T>["accessor"],
    display: (id, options = {}) => ({ ...options, id, type: options.type ?? "display" }),
    group: (id, children, options = {}) => ({ ...options, id, children }),
  };
}

export interface DataTableColumnInstance<T> {
  readonly id: string;
  readonly definition: DataTableColumn<T>;
  readonly depth: number;
  readonly index: number;
  readonly size: number;
  readonly minSize: number;
  readonly maxSize: number;
  readonly visible: boolean;
  readonly sortable: boolean;
  readonly sorted: false | DataTableSortDirection;
  readonly sortIndex: number;
  readonly filterable: boolean;
  readonly filterValue: unknown;
  readonly pinned: false | "end" | "start";
  readonly pinOffset: number;
}

export interface DataTableRow<T> {
  readonly id: DataTableRowKey;
  readonly original: T;
  readonly index: number;
  readonly originalIndex: number;
  readonly depth: number;
  readonly selected: boolean;
  readonly expanded: boolean;
  readonly disabled: boolean;
  readonly canExpand: boolean;
  readonly canReorder: boolean;
  getValue: <TValue = unknown>(columnId: string) => TValue;
  toggleSelected: (event?: Event) => boolean;
  toggleExpanded: (event?: Event) => boolean;
}

export interface DataTableCellContext<T, TValue = unknown> {
  table: DataTableController<T>;
  row: DataTableRow<T>;
  column: DataTableColumnInstance<T>;
  value: TValue;
  rowIndex: number;
  columnIndex: number;
}

export interface DataTableHeaderContext<T> {
  table: DataTableController<T>;
  column: DataTableColumnInstance<T>;
  header: DataTableHeader<T>;
  sorted: false | DataTableSortDirection;
  size: number;
  toggleSorting: (event?: Event) => boolean;
}

export interface DataTableHeader<T> {
  readonly id: string;
  readonly depth: number;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly placeholder: boolean;
  readonly column: DataTableColumnInstance<T>;
}

export interface DataTableHeaderGroup<T> {
  readonly id: string;
  readonly depth: number;
  readonly headers: readonly DataTableHeader<T>[];
}

export interface DataTableController<T> {
  readonly columns: Readonly<Ref<readonly DataTableColumnInstance<T>[]>>;
  readonly headerGroups: Readonly<Ref<readonly DataTableHeaderGroup<T>[]>>;
  readonly rows: Readonly<Ref<readonly DataTableRow<T>[]>>;
  readonly selectedRows: Readonly<Ref<readonly DataTableRow<T>[]>>;
  readonly filteredRowCount: Readonly<Ref<number>>;
  readonly pageCount: Readonly<Ref<number>>;
  readonly page: Readonly<Ref<number>>;
  readonly pageSize: Readonly<Ref<number>>;
  readonly selection: Ref<DataTableSelection>;
  readonly sorting: Ref<DataTableSorting[]>;
  readonly filters: Ref<DataTableFilters>;
  readonly globalFilter: Ref<string>;
  readonly pagination: Ref<DataTablePaginationState>;
  readonly expanded: Ref<DataTableRowKey[]>;
  readonly columnVisibility: Ref<DataTableColumnVisibility>;
  readonly columnOrder: Ref<string[]>;
  readonly columnSizing: Ref<DataTableColumnSizing>;
  readonly columnPinning: Ref<DataTableColumnPinning>;
  readonly rowOrder: Ref<DataTableRowKey[]>;
  getColumn: (id: string) => DataTableColumnInstance<T> | undefined;
  getRow: (id: DataTableRowKey) => DataTableRow<T> | undefined;
  getCellContext: (row: DataTableRow<T>, column: DataTableColumnInstance<T>) => DataTableCellContext<T>;
  getHeaderContext: (header: DataTableHeader<T>) => DataTableHeaderContext<T>;
  getRowCells: (row: DataTableRow<T>) => readonly DataTableCellContext<T>[];
  getHeaderAttrs: (header: DataTableHeader<T>) => HTMLAttributes;
  getCellAttrs: (context: DataTableCellContext<T>) => HTMLAttributes;
  getFooterAttrs: (header: DataTableHeader<T>) => HTMLAttributes;
  setFilter: (columnId: string, value: unknown, event?: Event) => boolean;
  clearFilter: (columnId: string, event?: Event) => boolean;
  setGlobalFilter: (value: string, event?: Event) => boolean;
  toggleSorting: (columnId: string, event?: Event) => boolean;
  toggleRow: (row: DataTableRow<T>, event?: Event) => boolean;
  toggleAllRows: (event?: Event) => boolean;
  isAllRowsSelected: () => boolean;
  isSomeRowsSelected: () => boolean;
  toggleExpanded: (row: DataTableRow<T>, event?: Event) => boolean;
  setPage: (page: number, event?: Event) => boolean;
  setPageSize: (pageSize: number, event?: Event) => boolean;
  setColumnVisible: (columnId: string, visible: boolean, event?: Event) => boolean;
  setColumnPinned: (columnId: string, side: false | "end" | "start", event?: Event) => boolean;
  resizeColumn: (columnId: string, size: number, event?: Event) => boolean;
  moveColumn: (columnId: string, targetId: string, event?: Event) => boolean;
  moveRow: (rowId: DataTableRowKey, targetId: DataTableRowKey, event?: Event) => boolean;
  reset: (event?: Event) => boolean;
}

export interface DataTableSlots<T> {
  toolbar?: (props: { table: DataTableController<T> }) => VNodeChild;
  caption?: (props: Record<string, never>) => VNodeChild;
  header?: (props: DataTableHeaderContext<T>) => VNodeChild;
  "sort-indicator"?: (props: { column: DataTableColumnInstance<T>; sorted: false | DataTableSortDirection }) => VNodeChild;
  cell?: (props: DataTableCellContext<T>) => VNodeChild;
  "expansion-trigger"?: (props: { row: DataTableRow<T> }) => VNodeChild;
  "reorder-handle"?: (props: { row: DataTableRow<T> }) => VNodeChild;
  "column-reorder-handle"?: (props: { column: DataTableColumnInstance<T> }) => VNodeChild;
  "resize-handle"?: (props: { column: DataTableColumnInstance<T> }) => VNodeChild;
  expanded?: (props: { row: DataTableRow<T>; table: DataTableController<T> }) => VNodeChild;
  footer?: (props: { column: DataTableColumnInstance<T>; table: DataTableController<T> }) => VNodeChild;
  loading?: (props: { table: DataTableController<T> }) => VNodeChild;
  error?: (props: { error: boolean | Error | string; table: DataTableController<T> }) => VNodeChild;
  empty?: (props: { table: DataTableController<T> }) => VNodeChild;
  pagination?: (props: {
    table: DataTableController<T>;
    page: number;
    pageSize: number;
    pageCount: number;
    setPage: DataTableController<T>["setPage"];
    setPageSize: DataTableController<T>["setPageSize"];
  }) => VNodeChild;
  [name: `${string}-header`]: ((props: DataTableHeaderContext<T>) => VNodeChild) | undefined;
  [name: `${string}-cell`]: ((props: DataTableCellContext<T>) => VNodeChild) | undefined;
  [name: `${string}-footer`]: ((props: { column: DataTableColumnInstance<T>; table: DataTableController<T> }) => VNodeChild) | undefined;
}

export interface DataTableChangeCallbacks {
  onSelectionChange?: (value: DataTableSelection, details: AkazaChangeEventDetails) => void;
  onSortingChange?: (value: DataTableSorting[], details: AkazaChangeEventDetails) => void;
  onFiltersChange?: (value: DataTableFilters, details: AkazaChangeEventDetails) => void;
  onGlobalFilterChange?: (value: string, details: AkazaChangeEventDetails) => void;
  onPaginationChange?: (value: DataTablePaginationState, details: AkazaChangeEventDetails) => void;
  onExpandedChange?: (value: DataTableRowKey[], details: AkazaChangeEventDetails) => void;
  onColumnVisibilityChange?: (value: DataTableColumnVisibility, details: AkazaChangeEventDetails) => void;
  onColumnOrderChange?: (value: string[], details: AkazaChangeEventDetails) => void;
  onColumnSizingChange?: (value: DataTableColumnSizing, details: AkazaChangeEventDetails) => void;
  onColumnPinningChange?: (value: DataTableColumnPinning, details: AkazaChangeEventDetails) => void;
  onRowOrderChange?: (value: DataTableRowKey[], details: AkazaChangeEventDetails) => void;
  onResetChange?: (details: AkazaChangeEventDetails) => void;
}

export interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  rowKey: (keyof T & string) | ((row: T, index: number) => DataTableRowKey);
  caption?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  loading?: boolean;
  error?: boolean | Error | string;
  emptyLabel?: string;
  errorLabel?: string;
  sortingMode?: DataTableSortingMode;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  paginate?: boolean;
  manualPagination?: boolean;
  rowCount?: number;
  showPagination?: boolean;
  selectionMode?: DataTableSelectionMode;
  selectionBehavior?: DataTableSelectionBehavior;
  selectAllScope?: DataTableSelectAllScope;
  isRowSelectable?: (row: T) => boolean;
  isRowExpandable?: (row: T) => boolean;
  getSubRows?: (row: T) => readonly T[] | undefined;
  columnResize?: boolean | DataTableColumnResizeOptions;
  columnReorder?: boolean;
  rowReorder?: boolean;
  stickyHeader?: boolean;
  dir?: "ltr" | "rtl";
  labels?: DataTableLabels;
  rowAttrs?: HTMLAttributes | ((row: DataTableRow<T>) => HTMLAttributes);
  ui?: DataTableUi;
}

export interface UseDataTableOptions<T> extends DataTableChangeCallbacks {
  data: MaybeRefOrGetter<readonly T[]>;
  columns: MaybeRefOrGetter<readonly DataTableColumn<T>[]>;
  rowKey: DataTableProps<T>["rowKey"];
  sortingMode?: MaybeRefOrGetter<DataTableSortingMode>;
  manualSorting?: MaybeRefOrGetter<boolean>;
  manualFiltering?: MaybeRefOrGetter<boolean>;
  paginate?: MaybeRefOrGetter<boolean>;
  manualPagination?: MaybeRefOrGetter<boolean>;
  rowCount?: MaybeRefOrGetter<number | undefined>;
  selectionMode?: MaybeRefOrGetter<DataTableSelectionMode>;
  selectAllScope?: MaybeRefOrGetter<DataTableSelectAllScope>;
  isRowSelectable?: (row: T) => boolean;
  isRowExpandable?: (row: T) => boolean;
  getSubRows?: (row: T) => readonly T[] | undefined;
  columnResize?: MaybeRefOrGetter<boolean | DataTableColumnResizeOptions>;
  dir?: MaybeRefOrGetter<"ltr" | "rtl">;
  selection?: Ref<DataTableSelection>;
  sorting?: Ref<DataTableSorting[]>;
  filters?: Ref<DataTableFilters>;
  globalFilter?: Ref<string>;
  pagination?: Ref<DataTablePaginationState>;
  expanded?: Ref<DataTableRowKey[]>;
  columnVisibility?: Ref<DataTableColumnVisibility>;
  columnOrder?: Ref<string[]>;
  columnSizing?: Ref<DataTableColumnSizing>;
  columnPinning?: Ref<DataTableColumnPinning>;
  rowOrder?: Ref<DataTableRowKey[]>;
}
