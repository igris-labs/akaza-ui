<script setup lang="ts">
import { Select } from "akaza-ui";
import { ref } from "vue";

const value = ref("pro");
const suggestion = ref("");
const search = ref("");
const options = [
  { value: "free", label: "Free", description: "Personal projects." },
  { value: "pro", label: "Pro", description: "Production apps." },
  { value: "team", label: "Team", description: "Shared workspace.", disabled: true },
];
const suggestions = [
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Frontend build tool." },
  { value: "vitest", label: "Vitest", description: "Vite-native test runner." },
];

const selectUi = {
  root: "w-full min-w-3xs",
  trigger:
    "flex h-9 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 text-left text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100",
  placeholder: "text-neutral-600 dark:text-neutral-400",
  searchInput:
    "h-9 w-full border-b border-neutral-200 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 dark:border-neutral-800 dark:text-neutral-100",
  content:
    "rounded-lg border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950",
  viewport: "max-h-64 overflow-auto",
  option:
    "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-900 data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:opacity-40 dark:text-neutral-100 dark:data-[akaza-highlighted]:bg-neutral-800",
  indicator: "w-4 text-neutral-900 dark:text-neutral-100",
  optionText: "grid gap-0.5",
  optionDescription: "text-xs text-neutral-600 dark:text-neutral-400",
  empty: "px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400",
};
</script>

<template>
  <div class="grid max-w-xs gap-8">
    <div class="grid gap-3">
      <label for="select-plan" class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Plan</label>
      <Select
        id="select-plan"
        v-model="value"
        :options="options"
        placeholder="Choose plan"
        :ui="selectUi"
      />
      <p class="text-xs text-neutral-600 dark:text-neutral-400">Selected: {{ value }}</p>
    </div>

    <div class="grid gap-3">
      <div>
        <label for="select-framework" class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Framework suggestion</label>
        <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Open the list and type to filter suggestions.</p>
      </div>
      <Select
        id="select-framework"
        v-model="suggestion"
        v-model:search="search"
        autocomplete
        :options="suggestions"
        placeholder="Choose framework"
        search-placeholder="Search frameworks"
        :ui="selectUi"
      />
      <p class="text-xs text-neutral-600 dark:text-neutral-400">
        Selected: {{ suggestion || "none" }} | Search: {{ search || "empty" }}
      </p>
    </div>
  </div>
</template>
