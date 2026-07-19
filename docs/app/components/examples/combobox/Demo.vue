<script setup lang="ts">
import type { ComboboxOption } from "akaza-ui";
import { Combobox } from "akaza-ui";
import { ref } from "vue";

const value = ref("vue");
const options: ComboboxOption[] = [
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Build tool.", disabled: true },
];
</script>

<template>
  <div class="grid gap-3">
    <Combobox
      v-model="value"
      clearable
      :options="options"
      placeholder="Search stack"
      :ui="{
        root: 'relative w-64',
        input: 'h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:ring-white',
        clear: 'absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:ring-white',
        content: 'rounded-xl border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
        option: 'flex cursor-pointer gap-2 rounded-lg px-3 py-2 text-sm data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40 dark:data-[akaza-highlighted]:bg-neutral-800',
        indicator: 'w-4 text-neutral-900 dark:text-white',
        optionText: 'grid gap-0.5',
        optionLabel: 'font-medium text-neutral-900 dark:text-neutral-100',
        optionDescription: 'text-xs text-neutral-500 dark:text-neutral-400',
        empty: 'px-3 py-2 text-sm text-neutral-500',
      }"
    />
    <p class="text-xs text-neutral-600 dark:text-neutral-400">Value: {{ value }}</p>
  </div>
</template>
