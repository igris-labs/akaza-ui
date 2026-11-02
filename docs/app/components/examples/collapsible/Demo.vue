<script setup lang="ts">
import { Collapsible } from "../../ui/collapsible";
</script>

<template>
  <div class="w-full max-w-sm rounded-xl border border-border bg-background">
    <Collapsible>
      <template #trigger>
        <span class="text-sm font-medium text-foreground"> Advanced settings </span>
      </template>
      <template #icon="{ isOpen }">
        <svg
          class="size-4 text-muted-foreground transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </template>

      <template #content>
        <div class="border-t border-border px-4 py-4">
          <div class="flex flex-col gap-3">
            <label class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Enable telemetry</span>
              <span class="text-xs text-muted-foreground">off</span>
            </label>
            <label class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Debug mode</span>
              <span class="text-xs text-muted-foreground">off</span>
            </label>
            <label class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Beta features</span>
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
