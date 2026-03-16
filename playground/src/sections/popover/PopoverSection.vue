<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "akaza-ui";

const open = ref(false);
</script>

<template>
  <section id="popover">
    <h2 class="text-lg font-semibold mb-1">Popover</h2>
    <p class="text-sm mb-6 text-muted-foreground">A floating panel anchored to a trigger.</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent">
      <Popover v-model="open" :ui="{ content: 'demo-popover' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
            @click="toggle"
          >
            Open Popover
          </button>
        </template>
        <template #content="{ close }">
          <div class="p-4 space-y-2">
            <p class="text-sm font-medium text-foreground">Popover content</p>
            <p class="text-xs text-muted-foreground">Click outside to close.</p>
            <button class="mt-2 text-xs text-primary underline" @click="close">Close</button>
          </div>
        </template>
      </Popover>

      <Popover direction="right" :ui="{ content: 'demo-popover' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
            @click="toggle"
          >
            Right
          </button>
        </template>
        <template #content="{ close }">
          <div class="p-4">
            <p class="text-sm font-medium text-foreground">Opens to the right</p>
            <button class="mt-2 text-xs text-primary underline" @click="close">Close</button>
          </div>
        </template>
      </Popover>
    </div>
  </section>
</template>

<style>
.demo-popover {
  position: fixed;
  z-index: 50;
  min-width: 200px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
