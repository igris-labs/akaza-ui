<script setup lang="ts">
import { Pagination } from "akaza-ui";
import { ref } from "vue";

const page = ref(7);
const control = "inline-flex h-9 items-center rounded-lg border border-neutral-300 px-3 text-sm font-medium text-neutral-900 disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-100";
const ui = {
  root: "max-w-full overflow-x-auto",
  list: "w-max items-center gap-1",
  first: control,
  previous: control,
  page: "grid size-9 place-items-center rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 data-[akaza-state=active]:bg-neutral-900 data-[akaza-state=active]:text-white dark:text-neutral-400 dark:hover:bg-neutral-800 dark:data-[akaza-state=active]:bg-white dark:data-[akaza-state=active]:text-neutral-900",
  ellipsis: "grid size-9 place-items-center text-neutral-500",
  next: control,
  last: control,
};
</script>

<template>
  <div class="grid gap-3">
    <Pagination v-model="page" :total="240" :items-per-page="10" show-edges show-first-last :ui="ui" />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">Page {{ page }} of 24</p>
  </div>
</template>
