<script setup lang="ts">
import { ref } from "vue";
import { AlertDialog } from "akaza-ui";

const open = ref(false);
</script>

<template>
  <section id="alert-dialog">
    <h2 class="text-lg font-semibold mb-1">Alert Dialog</h2>
    <p class="text-sm mb-6 text-muted-foreground">
      Non-dismissible dialog requiring explicit action (WAI-ARIA
      <code class="font-mono text-xs bg-muted px-1 rounded">alertdialog</code>).
    </p>
    <div class="rounded-lg border p-6 bg-accent">
      <AlertDialog v-model="open" :ui="{ overlay: 'demo-alert-overlay', content: 'demo-alert-dialog' }">
        <template #trigger="{ toggle }">
          <button
            class="px-4 py-1.5 rounded-md bg-destructive text-white text-sm font-medium hover:opacity-90 transition-opacity"
            @click="toggle"
          >
            Delete Account
          </button>
        </template>
        <template #header="{ titleId }">
          <h2 :id="titleId" class="text-base font-semibold text-foreground">Are you sure?</h2>
        </template>
        <template #body="{ descriptionId }">
          <p :id="descriptionId" class="text-sm text-muted-foreground">
            This action cannot be undone. Escape and backdrop click are disabled — you must act.
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
              class="px-4 py-1.5 rounded-md bg-destructive text-white text-sm font-medium hover:opacity-90 transition-opacity"
              @click="close"
            >
              Yes, delete
            </button>
          </div>
        </template>
      </AlertDialog>
    </div>
  </section>
</template>

<style>
.demo-alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.demo-alert-dialog {
  position: fixed;
  z-index: 200;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 440px);
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.demo-alert-dialog .akaza-alert-dialog-header {
  padding: 20px 20px 0;
}
.demo-alert-dialog .akaza-alert-dialog-body {
  padding: 12px 20px 20px;
}
.demo-alert-dialog .akaza-alert-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}
</style>
