<script setup lang="ts">
import type { DataTableColumn, DataTableController, DataTableRowKey } from "akaza-ui";

import { ref } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { Input } from "../../ui/input";

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
  {
    id: 3,
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "Director",
    status: "invited",
  },
  {
    id: 4,
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Analyst",
    status: "active",
  },
  {
    id: 5,
    name: "Barbara Liskov",
    email: "barbara@example.com",
    role: "Architect",
    status: "suspended",
  },
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

function statusClass(status: unknown) {
  if (status === "active")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
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
    >
      <template #toolbar="{ table }">
        <Input
          :value="search"
          type="search"
          aria-label="Search members"
          placeholder="Search members"
          class="w-48"
          @input="updateSearch(table, $event)"
        />
        <span class="text-xs text-muted-foreground">{{ selection.length }} selected</span>
      </template>

      <template #name-cell="{ row }">
        <span class="grid min-w-0 gap-0.5">
          <strong class="truncate font-medium">{{ row.original.name }}</strong>
          <span class="truncate text-xs text-muted-foreground">{{ row.original.email }}</span>
        </span>
      </template>

      <template #status-cell="{ value }">
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
          :class="statusClass(value)"
        >
          {{ value }}
        </span>
      </template>

      <template #actions-cell="{ row }">
        <ExampleButton
          type="button"
          color="secondary"
          variant="outline"
          size="xs"
          @click.stop="action = `Opened ${row.original.name}`"
        >
          More
        </ExampleButton>
      </template>
    </DataTable>

    <p class="text-xs text-muted-foreground">{{ action }}</p>
  </div>
</template>
