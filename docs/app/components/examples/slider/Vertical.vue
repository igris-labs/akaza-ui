<script setup lang="ts">
import { Slider } from "akaza-ui";
import { ref } from "vue";

const volume = ref(60);
</script>

<template>
  <div class="flex items-center gap-4">
    <Slider
      v-model="volume"
      orientation="vertical"
      aria-label="Volume"
      :ui="{
        root: 'h-40 w-6',
        track: 'h-full w-2 rounded-full bg-neutral-200 dark:bg-neutral-800',
        range: 'w-full rounded-full bg-neutral-900 dark:bg-white',
        thumb: 'size-5 rounded-full border-2 border-neutral-900 bg-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-white dark:bg-neutral-950 dark:focus-visible:ring-white',
      }"
    />
    <span class="text-sm tabular-nums">Volume: {{ volume }}</span>
  </div>
</template>
