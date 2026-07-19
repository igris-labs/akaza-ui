<script setup lang="ts">
import { Input } from "akaza-ui";
import { ref } from "vue";

const value = ref("Akaza");
</script>

<template>
  <div class="grid max-w-sm gap-3">
    <Input
      v-model="value"
      placeholder="Project name"
      class="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
    />
    <Input
      invalid
      placeholder="Invalid state"
      class="h-9 rounded-lg border border-red-500 bg-white px-3 text-sm text-neutral-900 outline-none dark:bg-neutral-950 dark:text-neutral-100"
    />
    <p class="text-xs text-neutral-600">Value: {{ value }}</p>
  </div>
</template>
