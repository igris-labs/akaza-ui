<script setup lang="ts">
import { Slider } from "akaza-ui";
import { ref } from "vue";

const value = ref(60);
</script>

<template>
  <div class="grid w-full max-w-xs gap-3">
    <Slider
      v-model="value"
      aria-label="Volume"
      :ui="{
        root: 'h-6 w-full',
        track: 'h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800',
        range: 'h-full rounded-full bg-neutral-900 dark:bg-white',
        thumb: 'size-5 rounded-full border-2 border-neutral-900 bg-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-white dark:bg-neutral-950 dark:focus-visible:ring-white',
      }"
    />
    <p class="text-xs text-neutral-600">Value: {{ value }}</p>
  </div>
</template>
