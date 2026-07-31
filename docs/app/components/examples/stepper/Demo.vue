<script setup lang="ts">
import { Stepper } from "akaza-ui";
import { ref } from "vue";

const value = ref(1);
const items = [
  { value: 1, title: "Account", description: "Identity", content: "Add account details." },
  { value: 2, title: "Workspace", description: "Settings", content: "Configure the workspace." },
  { value: 3, title: "Review", description: "Confirm", content: "Review and submit." },
];
const button = "rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-neutral-800";
const ui = {
  root: "grid w-full gap-5",
  list: "flex w-full items-start",
  item: "relative flex min-w-0 flex-1 items-start last:flex-none",
  trigger: "group flex min-w-0 items-start gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:opacity-40",
  indicator: "grid size-8 shrink-0 place-items-center rounded-full border border-neutral-300 text-xs font-semibold text-neutral-500 group-data-[akaza-state=active]:border-neutral-900 group-data-[akaza-state=active]:bg-neutral-900 group-data-[akaza-state=active]:text-white group-data-[akaza-state=completed]:border-neutral-900 group-data-[akaza-state=completed]:text-neutral-900 dark:border-neutral-700 dark:group-data-[akaza-state=active]:border-white dark:group-data-[akaza-state=active]:bg-white dark:group-data-[akaza-state=active]:text-neutral-900 dark:group-data-[akaza-state=completed]:border-white dark:group-data-[akaza-state=completed]:text-white",
  text: "hidden min-w-0 gap-0.5 sm:grid",
  title: "truncate text-sm font-medium text-neutral-900 dark:text-neutral-100",
  description: "text-xs text-neutral-500",
  separator: "mx-3 mt-4 h-px min-w-4 flex-1 bg-neutral-300 data-[akaza-state=completed]:bg-neutral-900 dark:bg-neutral-700 dark:data-[akaza-state=completed]:bg-white",
  panels: "rounded-lg border border-neutral-300 p-4 dark:border-neutral-800",
  panel: "text-sm text-neutral-600 dark:text-neutral-400",
  controls: "flex justify-between gap-2",
  previous: button,
  next: `${button} bg-neutral-900 text-white dark:bg-white dark:text-neutral-900`,
};
</script>

<template>
  <Stepper v-model="value" :items="items" show-controls :ui="ui" />
</template>
