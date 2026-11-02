import type { DataTableProps as PrimitiveDataTableProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const dataTableVariants = tv({
  slots: {
    root: "flex w-full min-w-0 flex-col gap-3 text-sm",
    toolbar: "flex flex-wrap items-center gap-2",
    viewport: "min-w-0 overflow-auto rounded-lg border border-border",
    table: "w-full min-w-full border-collapse text-left",
    colgroup: "",
    col: "",
    caption: "py-3 text-xs text-muted-foreground",
    thead: "bg-muted/50",
    headerRow: "border-b border-border",
    headerCell: "text-xs font-semibold text-muted-foreground",
    headerContent: "flex items-center gap-1.5",
    sortTrigger:
      "inline-flex w-full shrink-0 items-center justify-center justify-start gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    sortIndicator: "size-3.5",
    resizeHandle: "w-1 cursor-col-resize hover:bg-info/30 focus-visible:bg-info/30",
    columnReorderHandle:
      "inline-flex shrink-0 cursor-grab items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    tbody: "divide-y divide-border",
    row: "hover:bg-muted/40 data-akaza-selected:bg-info/10 data-[state=selected]:bg-info/10",
    cell: "align-middle text-foreground",
    cellContent: "min-w-0",
    selectionControl: "size-4 accent-primary",
    expansionTrigger:
      "inline-flex size-6 shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    reorderHandle:
      "inline-flex shrink-0 cursor-grab items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    expandedRow: "bg-muted/30",
    expandedCell: "p-4",
    loadingRow: "",
    loadingCell: "px-3 py-8 text-center text-muted-foreground",
    errorRow: "",
    errorCell: "px-3 py-8 text-center text-destructive",
    emptyRow: "",
    emptyCell: "px-3 py-8 text-center text-muted-foreground",
    tfoot: "border-t border-border",
    footerRow: "",
    footerCell: "font-medium",
    pagination: "flex items-center justify-end gap-2",
    liveRegion: "sr-only",
    paginationRoot: "",
    paginationList: "",
    paginationItem: "",
    paginationFirst: "",
    paginationPrevious: "",
    paginationPage: "",
    paginationEllipsis: "",
    paginationNext: "",
    paginationLast: "",
  },
  variants: {
    size: {
      xs: {
        cell: "px-2 py-1 text-xs leading-4",
        headerCell: "px-2 py-1 text-xs text-[11px] leading-4",
        footerCell: "px-2 py-1 text-xs leading-4",
      },
      sm: {
        cell: "px-2.5 py-1.5 text-[13px] leading-4",
        headerCell: "px-2.5 py-1.5 text-xs text-[13px] leading-4",
        footerCell: "px-2.5 py-1.5 text-[13px] leading-4",
      },
      md: {
        cell: "px-3 py-2 text-sm leading-5",
        headerCell: "px-3 py-2 text-sm text-xs leading-5",
        footerCell: "px-3 py-2 text-sm leading-5",
      },
      lg: {
        cell: "px-3.5 py-2.5 text-sm leading-5",
        headerCell: "px-3.5 py-2.5 text-sm text-[13px] leading-5",
        footerCell: "px-3.5 py-2.5 text-sm leading-5",
      },
      xl: {
        cell: "px-4 py-3 text-base leading-6",
        headerCell: "px-4 py-3 text-base text-sm leading-6",
        footerCell: "px-4 py-3 text-base leading-6",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
export type DataTableVariants = VariantProps<typeof dataTableVariants>;
export type DataTableConfig = Pick<DataTableVariants, "size">;
export type DataTableSlots<T extends object = Record<string, unknown>> = Akaza.DataTableSlots<T>;
export interface DataTableProps<T extends object = Record<string, unknown>> extends Omit<
  PrimitiveDataTableProps<T>,
  "ui" | "class" | "size"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.DataTableUi;
  size?: DataTableVariants["size"];
  selection?: Akaza.DataTableSelection;
  sorting?: Akaza.DataTableSorting[];
  filters?: Akaza.DataTableFilters;
  globalFilter?: string;
  pagination?: Akaza.DataTablePaginationState;
  expanded?: Akaza.DataTableRowKey[];
  columnVisibility?: Akaza.DataTableColumnVisibility;
  columnOrder?: string[];
  columnSizing?: Akaza.DataTableColumnSizing;
  columnPinning?: Akaza.DataTableColumnPinning;
  rowOrder?: Akaza.DataTableRowKey[];
  "onUpdate:selection"?: (value: Akaza.DataTableSelection) => void;
  "onUpdate:sorting"?: (value: Akaza.DataTableSorting[]) => void;
  "onUpdate:filters"?: (value: Akaza.DataTableFilters) => void;
  "onUpdate:globalFilter"?: (value: string) => void;
  "onUpdate:pagination"?: (value: Akaza.DataTablePaginationState) => void;
  "onUpdate:expanded"?: (value: Akaza.DataTableRowKey[]) => void;
  "onUpdate:columnVisibility"?: (value: Akaza.DataTableColumnVisibility) => void;
  "onUpdate:columnOrder"?: (value: string[]) => void;
  "onUpdate:columnSizing"?: (value: Akaza.DataTableColumnSizing) => void;
  "onUpdate:columnPinning"?: (value: Akaza.DataTableColumnPinning) => void;
  "onUpdate:rowOrder"?: (value: Akaza.DataTableRowKey[]) => void;
  "onSelection-change"?: (
    value: Akaza.DataTableSelection,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onSorting-change"?: (
    value: Akaza.DataTableSorting[],
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onFilters-change"?: (
    value: Akaza.DataTableFilters,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onGlobal-filter-change"?: (value: string, details: Akaza.AkazaChangeEventDetails) => void;
  "onPagination-change"?: (
    value: Akaza.DataTablePaginationState,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onExpanded-change"?: (
    value: Akaza.DataTableRowKey[],
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onColumn-visibility-change"?: (
    value: Akaza.DataTableColumnVisibility,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onColumn-order-change"?: (value: string[], details: Akaza.AkazaChangeEventDetails) => void;
  "onColumn-sizing-change"?: (
    value: Akaza.DataTableColumnSizing,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onColumn-pinning-change"?: (
    value: Akaza.DataTableColumnPinning,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onRow-order-change"?: (
    value: Akaza.DataTableRowKey[],
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onReset-change"?: (details: Akaza.AkazaChangeEventDetails) => void;
  "onRow-click"?: (row: Akaza.DataTableRow<T>, details: Akaza.AkazaChangeEventDetails) => void;
  "onRow-contextmenu"?: (
    row: Akaza.DataTableRow<T>,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
  "onCell-click"?: (
    context: Akaza.DataTableCellContext<T, unknown>,
    details: Akaza.AkazaChangeEventDetails,
  ) => void;
}
export function resolveDataTableVariants(
  props: DataTableVariants,
  config: UiConfig,
): DataTableVariants {
  return resolveVariants(
    props,
    config.components?.dataTable,
    config.defaults,
    dataTableVariants.variants,
  );
}
export { default as DataTable } from "./DataTable.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    dataTable?: DataTableConfig;
  }
}
