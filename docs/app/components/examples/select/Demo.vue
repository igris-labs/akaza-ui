<script setup lang="ts">
import { Select } from "akaza-ui";
import { ref } from "vue";

const value = ref("pro");
const options = [
  { value: "free", label: "Free", description: "Personal projects." },
  { value: "pro", label: "Pro", description: "Production apps." },
  { value: "team", label: "Team", description: "Shared workspace.", disabled: true },
];
</script>

<template>
  <div class="grid max-w-xs gap-3">
    <Select
      v-model="value"
      :options="options"
      placeholder="Choose plan"
      :ui="{
        root: 'w-full min-w-3xs',
        trigger:
          'flex h-9 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3 text-left text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100',
        placeholder: 'text-neutral-600',
        content:
          'rounded-lg border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950',
        viewport: 'max-h-64 overflow-auto',
        option:
          'flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-900 data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:opacity-40 dark:text-neutral-100 dark:data-[akaza-highlighted]:bg-neutral-800',
        indicator: 'w-4 text-neutral-900 dark:text-neutral-100',
        optionText: 'grid gap-0.5',
        optionDescription: 'text-xs text-neutral-600',
      }"
    />
    <p class="text-xs text-neutral-600">Selected: {{ value }}</p>
  </div>
</template>
