<script setup lang="ts">
import { Tooltip } from "akaza-ui";
</script>

<template>
  <section id="tooltip">
    <h2 class="text-lg font-semibold mb-1">Tooltip</h2>
    <p class="text-sm mb-6 text-muted-foreground">Hover or focus to reveal additional context.</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent">
      <Tooltip :ui="{ content: 'demo-tooltip' }">
        <template #trigger>
          <button class="px-4 py-1.5 rounded-md bg-background border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Top (default)
          </button>
        </template>
        <template #content>Appears above</template>
      </Tooltip>

      <Tooltip direction="bottom" :ui="{ content: 'demo-tooltip' }">
        <template #trigger>
          <button class="px-4 py-1.5 rounded-md bg-background border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Bottom
          </button>
        </template>
        <template #content>Appears below</template>
      </Tooltip>

      <Tooltip direction="right" :ui="{ content: 'demo-tooltip' }">
        <template #trigger>
          <button class="px-4 py-1.5 rounded-md bg-background border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Right
          </button>
        </template>
        <template #content>Appears to the right</template>
      </Tooltip>
    </div>
  </section>
</template>

<style>
.demo-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--foreground);
  color: var(--background);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}
</style>
