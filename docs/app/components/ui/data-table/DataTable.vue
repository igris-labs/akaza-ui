<script setup lang="ts" generic="T extends object">
import type * as Akaza from "akaza-ui";
import type { DataTableProps, DataTableSlots } from "./index";
import { DataTable as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import { Pagination } from "../pagination";
import uiConfig from "../ui.config";
import { dataTableVariants, resolveDataTableVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<DataTableProps<T>>(), {
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  loading: undefined,
  error: undefined,
  emptyLabel: undefined,
  errorLabel: undefined,
  sortingMode: undefined,
  manualSorting: undefined,
  manualFiltering: undefined,
  paginate: undefined,
  manualPagination: undefined,
  rowCount: undefined,
  showPagination: undefined,
  selectionMode: undefined,
  selectionBehavior: undefined,
  selectAllScope: undefined,
  isRowSelectable: undefined,
  isRowExpandable: undefined,
  getSubRows: undefined,
  columnResize: undefined,
  columnReorder: undefined,
  rowReorder: undefined,
  stickyHeader: undefined,
  dir: undefined,
  labels: undefined,
  rowAttrs: undefined,
  ui: undefined,
  selection: undefined,
  sorting: undefined,
  filters: undefined,
  globalFilter: undefined,
  pagination: undefined,
  expanded: undefined,
  columnVisibility: undefined,
  columnOrder: undefined,
  columnSizing: undefined,
  columnPinning: undefined,
  rowOrder: undefined,
});
defineSlots<DataTableSlots<T>>();
const attrs = useAttrs();
const resolved = computed(() => resolveDataTableVariants(props, uiConfig));
const styles = computed(() => dataTableVariants(resolved.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
    ]),
  );
});
const paginationUi = computed(() =>
  Object.fromEntries(
    ["root", "list", "item", "first", "previous", "page", "ellipsis", "next", "last"].map(
      (part) => [part, mergedUi.value[`pagination${part[0]!.toUpperCase()}${part.slice(1)}`]],
    ),
  ),
);
function setPaginationPage(
  setPage: (page: number, event?: Event) => boolean,
  page: number,
  details: Akaza.AkazaChangeEventDetails,
) {
  details.cancel();
  setPage(page, details.event);
}
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, ...native } = props;
  return native;
});
const primitive = useTemplateRef<
  { table: Akaza.DataTableController<T> } & Pick<
    Akaza.DataTableController<T>,
    | "getColumn"
    | "getRow"
    | "reset"
    | "clearFilter"
    | "setFilter"
    | "setGlobalFilter"
    | "setPage"
    | "setPageSize"
  >
>("primitive");
defineExpose({
  get table() {
    return primitive.value!.table;
  },
  get getColumn() {
    return primitive.value!.getColumn;
  },
  get getRow() {
    return primitive.value!.getRow;
  },
  get reset() {
    return primitive.value!.reset;
  },
  get clearFilter() {
    return primitive.value!.clearFilter;
  },
  get setFilter() {
    return primitive.value!.setFilter;
  },
  get setGlobalFilter() {
    return primitive.value!.setGlobalFilter;
  },
  get setPage() {
    return primitive.value!.setPage;
  },
  get setPageSize() {
    return primitive.value!.setPageSize;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-if="!$slots.pagination"
      #pagination="scope"
    >
      <Pagination
        :model-value="scope.page"
        :total="manualPagination ? (rowCount ?? data.length) : scope.table.filteredRowCount.value"
        :items-per-page="scope.pageSize"
        :size="resolved.size ?? 'md'"
        :show-edges="true"
        :ui="paginationUi"
        @value-change="
          (page: number, details: Akaza.AkazaChangeEventDetails) =>
            setPaginationPage(scope.setPage, page, details)
        "
      />
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof DataTableSlots<T>"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
