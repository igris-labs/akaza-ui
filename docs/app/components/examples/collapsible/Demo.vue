<script setup lang="ts">
import { Collapsible } from "akaza-ui";
</script>

<template>
  <div
    class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <Collapsible
      :ui="{
        trigger: 'px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60',
      }"
    >
      <template #trigger>
        <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Advanced settings
        </span>
      </template>
      <template #icon="{ isOpen }">
        <svg
          class="size-4 text-neutral-400 transition-transform duration-200 dark:text-neutral-500"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>

      <template #content>
        <div class="border-t border-neutral-100 px-4 py-4 dark:border-neutral-800">
          <div class="flex flex-col gap-3">
            <label class="flex items-center justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">Enable telemetry</span>
              <span class="text-xs text-neutral-400">off</span>
            </label>
            <label class="flex items-center justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">Debug mode</span>
              <span class="text-xs text-neutral-400">off</span>
            </label>
            <label class="flex items-center justify-between text-sm">
              <span class="text-neutral-700 dark:text-neutral-300">Beta features</span>
              <span
                class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                on
              </span>
            </label>
          </div>
        </div>
      </template>
    </Collapsible>
  </div>
</template>
