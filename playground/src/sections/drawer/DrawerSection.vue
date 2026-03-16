<script setup lang="ts">
import { ref } from "vue";
import { Drawer } from "akaza-ui";

const openRight = ref(false);
const openInset = ref(false);
</script>

<template>
  <section id="drawer">
    <h2 class="text-lg font-semibold mb-1">Drawer</h2>
    <p class="text-sm mb-6 text-muted-foreground">A side panel with focus trap and backdrop.</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent">
      <Drawer v-model="openRight" side="right" :ui="{ overlay: 'demo-drawer-overlay', content: 'demo-drawer' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            @click="toggle"
          >
            Right Drawer
          </button>
        </template>
        <template #header="{ close, titleId }">
          <div class="flex items-center justify-between">
            <h2 :id="titleId" class="text-base font-semibold text-foreground">Drawer Title</h2>
            <button class="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none" @click="close">✕</button>
          </div>
        </template>
        <template #body="{ descriptionId }">
          <p :id="descriptionId" class="text-sm text-muted-foreground">
            A right-side drawer. Press Escape or click the backdrop to close.
          </p>
        </template>
        <template #footer="{ close }">
          <button
            class="w-full px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
            @click="close"
          >Close</button>
        </template>
      </Drawer>

      <Drawer v-model="openInset" side="right" :inset="12" :ui="{ overlay: 'demo-drawer-overlay', content: 'demo-drawer' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
            @click="toggle"
          >
            Inset Drawer
          </button>
        </template>
        <template #header="{ close, titleId }">
          <div class="flex items-center justify-between">
            <h2 :id="titleId" class="text-base font-semibold text-foreground">Inset Drawer</h2>
            <button class="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none" @click="close">✕</button>
          </div>
        </template>
        <template #body="{ descriptionId }">
          <p :id="descriptionId" class="text-sm text-muted-foreground">
            This drawer has 12px inset from all edges with rounded corners.
          </p>
        </template>
        <template #footer="{ close }">
          <button
            class="w-full px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
            @click="close"
          >Close</button>
        </template>
      </Drawer>
    </div>
  </section>
</template>

<style>
.demo-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.demo-drawer {
  z-index: 200;
  width: min(90vw, 360px);
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.demo-drawer .akaza-drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.demo-drawer .akaza-drawer-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
.demo-drawer .akaza-drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
</style>
