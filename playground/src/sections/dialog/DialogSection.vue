<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "akaza-ui";

const open = ref(false);
const openSecond = ref(false);
</script>

<template>
  <section id="dialog">
    <h2 class="text-lg font-semibold mb-1">Dialog</h2>
    <p class="text-sm mb-6 text-muted-foreground">A modal dialog with focus trap and backdrop.</p>
    <div class="rounded-lg border p-6 bg-accent">
      <Dialog v-model="open" :ui="{ overlay: 'demo-overlay', content: 'demo-dialog' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            @click="toggle"
          >
            Open Dialog
          </button>
        </template>
        <template #header="{ close, titleId }">
          <div class="flex items-center justify-between">
            <h2 :id="titleId" class="text-base font-semibold text-foreground">Dialog Title</h2>
            <button class="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none" @click="close">✕</button>
          </div>
        </template>
        <template #body="{ descriptionId }">
          <p :id="descriptionId" class="text-sm text-muted-foreground mb-4">
            This is a modal dialog. Press Escape or click the backdrop to close.
          </p>
        </template>
        <template #footer="{ close }">
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-1.5 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
              @click="close"
            >
            Cancel
          </button>
            <button
              class="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              @click="close"
            >
            Confirm
          </button>
            <button
              class="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              @click="() => (openSecond = true)"
            >
            Open Another Dialog
          </button>
          </div>
        </template>
      </Dialog>

      <Dialog v-model="openSecond" :ui="{ overlay: 'demo-overlay-inner', content: 'demo-dialog demo-dialog-inner' }">
            <template #header="{ close, titleId }">
              <div class="flex items-center justify-between">
                <h2 :id="titleId" class="text-base font-semibold text-foreground">Inner Dialog</h2>
                <button class="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none" @click="close">✕</button>
              </div>
            </template>
            <template #body="{ descriptionId }">
              <p :id="descriptionId" class="text-sm text-muted-foreground">
                This dialog is stacked on top. Tab focus is trapped here — the outer dialog's trap is paused until this closes.
              </p>
            </template>
            <template #footer="{ close }">
              <div class="flex justify-end">
                <button
                  class="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  @click="close"
                >Close inner</button>
              </div>
            </template>
          </Dialog>
    </div>
  </section>
</template>

<style>
.demo-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.demo-dialog {
  position: fixed;
  z-index: 200;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 480px);
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.demo-dialog .akaza-dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.demo-dialog .akaza-dialog-body {
  padding: 20px;
  flex: 1;
}
.demo-dialog .akaza-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}
.demo-overlay-inner {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1px);
}
.demo-dialog-inner {
  z-index: 400;
}
</style>
