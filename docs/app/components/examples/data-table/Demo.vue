<script setup lang="ts">
import type { DataTableColumn, DataTableController, DataTableRowKey } from "akaza-ui";
import { DataTable } from "akaza-ui";
import { ref } from "vue";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
}

const data: Member[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "Engineer", status: "active" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "Admiral", status: "active" },
  { id: 3, name: "Margaret Hamilton", email: "margaret@example.com", role: "Director", status: "invited" },
  { id: 4, name: "Katherine Johnson", email: "katherine@example.com", role: "Analyst", status: "active" },
  { id: 5, name: "Barbara Liskov", email: "barbara@example.com", role: "Architect", status: "suspended" },
];

const columns: DataTableColumn<Member>[] = [
  { id: "select", type: "selection", size: 42 },
  { accessor: "name", header: "Member", sortable: true, size: 220 },
  { accessor: "role", header: "Role", sortable: true },
  { accessor: "status", header: "Status", sortable: true },
  { id: "actions", type: "display", header: "", size: 72 },
];

const selection = ref<DataTableRowKey[]>([]);
const search = ref("");
const pagination = ref({ page: 1, pageSize: 3 });
const action = ref("No action selected.");

const control = "inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-white px-2.5 text-xs font-medium text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900";
const page = "grid size-8 place-items-center rounded-md text-xs font-medium text-neutral-600 hover:bg-neutral-100 data-[akaza-state=active]:bg-neutral-900 data-[akaza-state=active]:text-white dark:text-neutral-400 dark:hover:bg-neutral-900 dark:data-[akaza-state=active]:bg-white dark:data-[akaza-state=active]:text-neutral-900";
const ui = {
  root: "grid min-w-0 gap-3",
  toolbar: "flex flex-wrap items-center justify-between gap-2",
  viewport: "max-w-full rounded-lg border border-neutral-300 dark:border-neutral-800",
  table: "text-left text-sm text-neutral-900 dark:text-neutral-100",
  caption: "sr-only",
  thead: "bg-neutral-100 dark:bg-neutral-900",
  headerCell: "h-10 border-b border-neutral-300 bg-neutral-100 px-3 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400",
  headerContent: "flex items-center gap-2",
  sortTrigger: "flex flex-1 items-center gap-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
  sortIndicator: "w-3",
  tbody: "divide-y divide-neutral-200 dark:divide-neutral-800",
  row: "bg-white hover:bg-neutral-50 data-[akaza-selected]:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:data-[akaza-selected]:bg-neutral-900",
  cell: "bg-inherit px-3 py-3",
  selectionControl: "size-4 accent-neutral-900 dark:accent-white",
  emptyCell: "h-28 text-center text-neutral-500",
  pagination: "flex justify-end",
  paginationList: "items-center gap-1",
  paginationPrevious: control,
  paginationPage: page,
  paginationEllipsis: "grid size-8 place-items-center text-neutral-500",
  paginationNext: control,
};

function statusClass(status: unknown) {
  if (status === "active") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
  if (status === "suspended") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
}

function updateSearch(table: DataTableController<Member>, event: Event) {
  table.setGlobalFilter((event.target as HTMLInputElement).value, event);
}
</script>

<template>
  <div class="grid min-w-0 gap-3">
    <DataTable
      v-model:selection="selection"
      v-model:global-filter="search"
      v-model:pagination="pagination"
      :data="data"
      :columns="columns"
      row-key="id"
      caption="Workspace members"
      selection-mode="multiple"
      selection-behavior="row"
      paginate
      :ui="ui"
    >
      <template #toolbar="{ table }">
        <input
          :value="search"
          type="search"
          aria-label="Search members"
          placeholder="Search members"
          class="h-9 w-48 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
          @input="updateSearch(table, $event)"
        >
        <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ selection.length }} selected</span>
      </template>

      <template #name-cell="{ row }">
        <span class="grid min-w-0 gap-0.5">
          <strong class="truncate font-medium">{{ row.original.name }}</strong>
          <span class="truncate text-xs text-neutral-500">{{ row.original.email }}</span>
        </span>
      </template>

      <template #status-cell="{ value }">
        <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="statusClass(value)">
          {{ value }}
        </span>
      </template>

      <template #actions-cell="{ row }">
        <button type="button" :class="control" @click.stop="action = `Opened ${row.original.name}`">More</button>
      </template>
    </DataTable>

    <p class="text-xs text-neutral-600 dark:text-neutral-400">{{ action }}</p>
  </div>
</template>
