<script setup lang="ts">
import { HoverPreviewCard } from "akaza-ui";
</script>

<template>
  <p class="text-sm text-neutral-600 dark:text-neutral-400">
    Hover
    <HoverPreviewCard
      arrow
      :ui="{
        trigger: 'font-medium text-neutral-950 underline underline-offset-4 dark:text-white',
        content: 'w-72 rounded-xl border border-neutral-300 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
        arrow: 'border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-900',
      }"
    >
      <template #trigger="{ triggerProps }">
        <a href="#profile" v-bind="triggerProps">Ada Lovelace</a>
      </template>
      <template #content>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ada Lovelace</p>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          A rich hover preview can hold profile, link, or entity metadata.
        </p>
      </template>
    </HoverPreviewCard>
    to open a preview card.
  </p>
</template>
