<script setup lang="ts">
import type { ListboxValue } from "akaza-ui";
import { Listbox } from "akaza-ui";
import { ref } from "vue";

const value = ref<ListboxValue>("vue");
const selected = ref<ListboxValue[]>(["vue"]);
const search = ref("");
const options = [
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Frontend build tool." },
  { value: "vitest", label: "Vitest", description: "Test runner.", disabled: true },
];

const ui = {
  root: "grid w-full gap-2",
  filter: "h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100",
  content: "max-h-56 rounded-lg border border-neutral-300 bg-white p-1 text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100",
  option: "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40 dark:data-[akaza-highlighted]:bg-neutral-800",
  indicator: "w-4 shrink-0",
  optionText: "grid gap-0.5",
  optionLabel: "font-medium",
  optionDescription: "text-xs text-neutral-600 dark:text-neutral-400",
  empty: "px-3 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400",
};
</script>

<template>
  <div class="grid w-full max-w-xs gap-8">
    <div class="grid gap-3">
      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Framework</p>
      <Listbox v-model="value" :options="options" aria-label="Framework" :ui="ui" />
      <p class="text-xs text-neutral-600 dark:text-neutral-400">Selected: {{ value }}</p>
    </div>

    <div class="grid gap-3">
      <div>
        <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Filter and select multiple</p>
        <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Use Arrow keys and Space, or click rows.</p>
      </div>
      <Listbox v-model="selected" v-model:search="search" multiple filterable :options="options" aria-label="Frameworks" :ui="ui" />
      <p class="text-xs text-neutral-600 dark:text-neutral-400">Selected: {{ selected.join(", ") || "none" }}</p>
    </div>
  </div>
</template>
