<script setup lang="ts">
import type { ListboxValue } from "akaza-ui";
import { ref } from "vue";
import { Listbox } from "../../ui/listbox";

const value = ref<ListboxValue>("vue");
const selected = ref<ListboxValue[]>(["vue"]);
const search = ref("");
const options = [
  { value: "vue", label: "Vue", description: "Progressive framework." },
  { value: "nuxt", label: "Nuxt", description: "Full-stack Vue framework." },
  { value: "vite", label: "Vite", description: "Frontend build tool." },
  { value: "vitest", label: "Vitest", description: "Test runner.", disabled: true },
];
</script>

<template>
  <div class="grid w-full max-w-xs gap-8">
    <div class="grid gap-3">
      <p class="text-sm font-medium text-foreground">Framework</p>
      <Listbox
        v-model="value"
        :options="options"
        aria-label="Framework"
      />
      <p class="text-xs text-muted-foreground">Selected: {{ value }}</p>
    </div>

    <div class="grid gap-3">
      <div>
        <p class="text-sm font-medium text-foreground">Filter and select multiple</p>
        <p class="mt-1 text-xs text-muted-foreground">Use Arrow keys and Space, or click rows.</p>
      </div>
      <Listbox
        v-model="selected"
        v-model:search="search"
        multiple
        filterable
        :options="options"
        aria-label="Frameworks"
      />
      <p class="text-xs text-muted-foreground">Selected: {{ selected.join(", ") || "none" }}</p>
    </div>
  </div>
</template>
