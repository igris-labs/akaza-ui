<script setup lang="ts">
import { NumberField } from "akaza-ui";
import { ref } from "vue";

const value = ref<number | null>(3);
</script>

<template>
  <div class="grid max-w-xs gap-3">
    <NumberField
      v-model="value"
      :min="1"
      :max="10"
      :ui="{
        root: 'h-9 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
        decrement: 'h-full w-9 border-r border-neutral-200 text-sm dark:border-neutral-800',
        input: 'h-full w-20 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        increment: 'h-full w-9 border-l border-neutral-200 text-sm dark:border-neutral-800',
      }"
    />
    <p class="text-xs text-neutral-500">Value: {{ value ?? "(empty)" }}</p>
  </div>
</template>
