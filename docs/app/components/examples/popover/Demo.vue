<script setup lang="ts">
import { Popover } from "akaza-ui";
</script>

<template>
  <Popover side="bottom" align="center" :side-offset="8" :ui="{ content: 'popover-panel' }">
    <template #trigger="{ toggle }">
      <button
        class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        @click="() => toggle()"
      >
        <svg
          class="size-4 text-neutral-400"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7v4M8 5.5v.5" stroke-linecap="round" />
        </svg>
        Learn more
      </button>
    </template>

    <template #content="{ close }">
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Akaza UI</p>
        <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Headless, accessible Vue components. Bring your own styles and compose UI exactly how you
          want.
        </p>
        <div class="flex items-center justify-between pt-1">
          <a
            href="/getting-started"
            class="text-xs font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
          >
            Documentation →
          </a>
          <button
            class="text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
            @click="() => close()"
          >
            Dismiss
          </button>
        </div>
      </div>
    </template>
  </Popover>
</template>

<style>
@reference "tailwindcss";

.popover-panel {
  @apply z-50 w-64 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900;
}
</style>
