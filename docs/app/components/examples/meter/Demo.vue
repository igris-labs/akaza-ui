<script setup lang="ts">
import { Meter } from "akaza-ui";
</script>

<template>
  <Meter
    label="Storage used"
    :value="64"
    :ui="{
      root: 'grid w-64 max-w-full grid-cols-2 gap-y-2',
      label: 'text-sm text-neutral-900 dark:text-neutral-100',
      value: 'text-right text-sm text-neutral-500',
      track: 'col-span-2 h-3 rounded-full bg-neutral-100 dark:bg-neutral-800',
      indicator: 'rounded-full bg-neutral-900 transition-[width] duration-300 dark:bg-white',
    }"
  />
</template>
