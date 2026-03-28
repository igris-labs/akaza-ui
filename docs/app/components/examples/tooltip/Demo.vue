<script setup lang="ts">
import { Tooltip } from 'akaza-ui'
</script>

<template>
  <div class="flex items-center gap-3">
    <Tooltip direction="top" :delay-duration="200" :ui="{ content: 'tooltip-content' }">
      <template #trigger>
        <button
          class="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          aria-label="Settings"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M11.2 4.8l1.4-1.4M3.4 12.6l1.4-1.4" stroke-linecap="round" />
          </svg>
        </button>
      </template>
      <template #content>Settings</template>
    </Tooltip>

    <Tooltip direction="top" :delay-duration="200" :ui="{ content: 'tooltip-content' }">
      <template #trigger>
        <button
          class="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          aria-label="Notifications"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 1.5A5 5 0 003 6.5v2.5L2 11h12l-1-2V6.5A5 5 0 008 1.5z" stroke-linejoin="round" />
            <path d="M6.5 11.5a1.5 1.5 0 003 0" />
          </svg>
        </button>
      </template>
      <template #content>Notifications</template>
    </Tooltip>

    <Tooltip direction="top" :delay-duration="200" :ui="{ content: 'tooltip-content' }">
      <template #trigger>
        <button
          class="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          aria-label="Help"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M6 6.5a2 2 0 113 1.732c-.5.29-1 .768-1 1.268M8 11v.5" stroke-linecap="round" />
          </svg>
        </button>
      </template>
      <template #content>Help center</template>
    </Tooltip>
  </div>
</template>

<style>
.tooltip-content {
  @apply z-50 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md dark:bg-white dark:text-neutral-900;
}
</style>
