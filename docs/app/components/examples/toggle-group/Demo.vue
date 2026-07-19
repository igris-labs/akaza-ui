<script setup lang="ts">
import type { ToggleGroupModel } from "akaza-ui";
import { ToggleGroup } from "akaza-ui";
import { ref } from "vue";

const value = ref<ToggleGroupModel>("center");
const options = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
</script>

<template>
  <div class="grid gap-3">
    <ToggleGroup
      v-model="value"
      :allow-empty="false"
      :options="options"
      aria-label="Text alignment"
      :ui="{
        root: 'gap-1 rounded-lg bg-neutral-200 p-1 dark:bg-neutral-900',
        item: 'h-8 rounded-md px-3 text-sm text-neutral-600 data-[akaza-state=on]:bg-white data-[akaza-state=on]:text-neutral-900 data-[akaza-state=on]:shadow-sm dark:text-neutral-400 dark:data-[akaza-state=on]:bg-neutral-800 dark:data-[akaza-state=on]:text-neutral-100',
      }"
    />
    <p class="text-xs text-neutral-600">Value: {{ value }}</p>
  </div>
</template>
