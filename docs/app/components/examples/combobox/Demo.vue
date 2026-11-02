<script setup lang="ts">
import type { ComboboxOption } from "akaza-ui";
import { ref } from "vue";
import { Combobox } from "../../ui/combobox";

const value = ref("vue");
const options: ComboboxOption[] = [
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Build tool.", disabled: true },
];
</script>

<template>
  <div class="grid w-full max-w-xs gap-3">
    <Combobox
      v-model="value"
      clearable
      :options="options"
      placeholder="Search stack"
    />
    <p class="text-xs text-muted-foreground">Value: {{ value }}</p>
  </div>
</template>
