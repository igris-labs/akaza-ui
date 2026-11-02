<script setup lang="ts">
import { ref } from "vue";
import { Select } from "../../ui/select";

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
</script>

<template>
  <div class="grid max-w-xs gap-8">
    <div class="grid gap-3">
      <label
        for="select-plan"
        class="text-sm font-medium text-foreground"
      >Plan</label>
      <Select
        id="select-plan"
        v-model="value"
        :options="options"
        placeholder="Choose plan"
      />
      <p class="text-xs text-muted-foreground">Selected: {{ value }}</p>
    </div>

    <div class="grid gap-3">
      <div>
        <label
          for="select-framework"
          class="text-sm font-medium text-foreground"
        >Framework suggestion</label>
        <p class="mt-1 text-xs text-muted-foreground">
          Open the list and type to filter suggestions.
        </p>
      </div>
      <Select
        id="select-framework"
        v-model="suggestion"
        v-model:search="search"
        autocomplete
        :options="suggestions"
        placeholder="Choose framework"
        search-placeholder="Search frameworks"
      />
      <p class="text-xs text-muted-foreground">
        Selected: {{ suggestion || "none" }} | Search: {{ search || "empty" }}
      </p>
    </div>
  </div>
</template>
