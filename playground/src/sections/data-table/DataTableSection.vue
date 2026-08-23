<script setup lang="ts">
import type {
  DataTableColumn,
  DataTableController,
  DataTablePaginationState,
  DataTableRowKey,
  DataTableSorting,
} from "akaza-ui";
import { DataTable } from "akaza-ui";
import { computed, ref } from "vue";
import {
  buttonGhost,
  buttonPrimary,
  canvasCol,
  codePill,
  dataTableUi,
  exampleStack,
  exampleTitle,
  inputControl,
  sectionDescription,
  sectionTitle,
} from "../styles";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  joined: string;
  projects?: Member[];
}

const members: Member[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "Engineer", status: "active", joined: "2026-01-12" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "Admiral", status: "active", joined: "2026-02-03" },
  { id: 3, name: "Margaret Hamilton", email: "margaret@example.com", role: "Director", status: "invited", joined: "2026-02-18" },
  { id: 4, name: "Katherine Johnson", email: "katherine@example.com", role: "Analyst", status: "active", joined: "2026-03-01" },
  { id: 5, name: "Edsger Dijkstra", email: "edsger@example.com", role: "Researcher", status: "suspended", joined: "2026-03-14" },
  { id: 6, name: "Barbara Liskov", email: "barbara@example.com", role: "Architect", status: "active", joined: "2026-04-09" },
  { id: 7, name: "Donald Knuth", email: "donald@example.com", role: "Author", status: "invited", joined: "2026-04-22" },
  { id: 8, name: "Frances Allen", email: "frances@example.com", role: "Compiler lead", status: "active", joined: "2026-05-07" },
];

const columns: DataTableColumn<Member>[] = [
  { id: "select", type: "selection", size: 44, minSize: 44, maxSize: 44, pinned: "start", reorderable: false },
  { id: "reorder", type: "reorder", size: 44, minSize: 44, maxSize: 44, pinned: "start", reorderable: false },
  { accessor: "name", header: "Member", sortable: true, size: 230, minSize: 180, pinned: "start" },
  { accessor: "role", header: "Role", sortable: true, size: 150 },
  {
    accessor: "status",
    header: "Status",
    sortable: true,
    filterable: true,
    filter: (value, filterValue) => !filterValue || value === filterValue,
    size: 120,
  },
  { accessor: "joined", header: "Joined", sortable: true, size: 130 },
  { id: "actions", type: "display", header: "", size: 80, minSize: 80, maxSize: 80, reorderable: false },
];

const selection = ref<DataTableRowKey[]>([]);
const sorting = ref<DataTableSorting[]>([]);
const pagination = ref<DataTablePaginationState>({ page: 1, pageSize: 4 });
const globalFilter = ref("");
const statusFilter = ref("");
const lastAction = ref("No row action yet.");

function filterRows(table: DataTableController<Member>, event: Event) {
  table.setGlobalFilter((event.target as HTMLInputElement).value, event);
}

function filterStatus(table: DataTableController<Member>, status: string, event: Event) {
  statusFilter.value = status;
  if (status) table.setFilter("status", status, event);
  else table.clearFilter("status", event);
}

function statusClass(status: unknown) {
  if (status === "active") return "bg-success/10 text-success";
  if (status === "suspended") return "bg-destructive/10 text-destructive";
  return "bg-warning/10 text-warning";
}

function errorMessage(error: boolean | Error | string) {
  return error instanceof Error ? error.message : String(error);
}

const teamColumns: DataTableColumn<Member>[] = [
  { id: "expand", type: "expander", header: "", size: 44 },
  {
    id: "identity",
    header: "Identity",
    children: [
      { accessor: "name", header: "Name", sortable: true },
      { accessor: "email", header: "Email" },
    ],
  },
  {
    id: "assignment",
    header: "Assignment",
    children: [
      { accessor: "role", header: "Role" },
      { accessor: "status", header: "Status" },
    ],
  },
];

const hierarchy: Member[] = [
  {
    ...members[0]!,
    projects: [
      { ...members[2]!, id: 101, name: "Compiler migration" },
      { ...members[5]!, id: 102, name: "API review" },
    ],
  },
  { ...members[1]!, projects: [{ ...members[7]!, id: 103, name: "Runtime audit" }] },
];

const state = ref<"empty" | "error" | "loading" | "ready">("loading");
const stateData = computed(() => state.value === "ready" ? members.slice(0, 2) : []);
</script>

<template>
  <section id="data-table">
    <h2 :class="sectionTitle">Data Table</h2>
    <p :class="sectionDescription">
      Native table semantics with Vue models and slots for sorting, filtering, selection, pagination, expansion, sizing, and custom cells.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Custom cells + controlled state</h3>
        <div :class="canvasCol">
          <DataTable
            v-model:selection="selection"
            v-model:sorting="sorting"
            v-model:pagination="pagination"
            v-model:global-filter="globalFilter"
            :data="members"
            :columns="columns"
            row-key="id"
            caption="Workspace members"
            selection-mode="multiple"
            selection-behavior="row"
            paginate
            sticky-header
            column-reorder
            row-reorder
            :column-resize="{ behavior: 'expand', keyboardStep: 16 }"
            :ui="dataTableUi"
          >
            <template #toolbar="{ table }">
              <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input
                  :value="globalFilter"
                  :class="[inputControl, 'max-w-56']"
                  type="search"
                  placeholder="Search members"
                  aria-label="Search members"
                  @input="filterRows(table, $event)"
                >
                <button
                  v-for="option in [
                    { value: '', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'invited', label: 'Invited' },
                  ]"
                  :key="option.value"
                  type="button"
                  :class="statusFilter === option.value ? buttonPrimary : buttonGhost"
                  @click="filterStatus(table, option.value, $event)"
                >
                  {{ option.label }}
                </button>
              </div>
              <button
                type="button"
                :class="buttonGhost"
                @click="table.setColumnVisible('role', !table.getColumn('role')?.visible, $event)"
              >
                {{ table.getColumn("role")?.visible ? "Hide role" : "Show role" }}
              </button>
            </template>

            <template #name-cell="{ row }">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {{ row.original.name.split(" ").map(part => part[0]).join("").slice(0, 2) }}
                </span>
                <span class="grid min-w-0 gap-0.5">
                  <span class="truncate font-medium text-foreground">{{ row.original.name }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ row.original.email }}</span>
                </span>
              </div>
            </template>

            <template #status-cell="{ value }">
              <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusClass(value)]">
                {{ value }}
              </span>
            </template>

            <template #joined-cell="{ value }">
              <time :datetime="String(value)" class="tabular-nums">{{ value }}</time>
            </template>

            <template #actions-cell="{ row }">
              <button
                type="button"
                :class="buttonGhost"
                :aria-label="`Open actions for ${row.original.name}`"
                @click.stop="lastAction = `Opened actions for ${row.original.name}`"
              >
                More
              </button>
            </template>
          </DataTable>

          <div class="flex flex-wrap gap-2">
            <code :class="codePill">selected: {{ selection.join(", ") || "none" }}</code>
            <code :class="codePill">sort: {{ sorting[0]?.id || "none" }} {{ sorting[0]?.direction || "" }}</code>
            <code :class="codePill">page: {{ pagination.page }}</code>
          </div>
          <p class="text-xs text-muted-foreground">{{ lastAction }}</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Grouped headers + expandable rows</h3>
        <div :class="canvasCol">
          <DataTable
            :data="hierarchy"
            :columns="teamColumns"
            row-key="id"
            :is-row-expandable="row => Boolean(row.projects?.length)"
            :ui="dataTableUi"
          >
            <template #expanded="{ row }">
              <strong class="font-medium text-foreground">{{ row.original.name }}</strong>
              has {{ row.original.projects?.length || 0 }} nested assignments.
            </template>
          </DataTable>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Loading, error, and empty states</h3>
        <div :class="canvasCol">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in ['loading', 'error', 'empty', 'ready'] as const"
              :key="option"
              type="button"
              :class="state === option ? buttonPrimary : buttonGhost"
              @click="state = option"
            >
              {{ option }}
            </button>
          </div>
          <DataTable
            :data="stateData"
            :columns="columns.slice(1, 4)"
            row-key="id"
            :loading="state === 'loading'"
            :error="state === 'error' ? new Error('Members could not be loaded.') : false"
            empty-label="No members match this view."
            :ui="dataTableUi"
          >
            <template #loading>Loading workspace members...</template>
            <template #error="{ error }">{{ errorMessage(error) }}</template>
          </DataTable>
        </div>
      </div>
    </div>
  </section>
</template>
