<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "akaza-ui";

const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
const open5 = ref(false);
const open5Inner = ref(false);
const open6 = ref(false);
const open7 = ref(false);
const open8 = ref(false);
</script>

<template>
  <section id="dialog">
    <h2 class="text-lg font-semibold mb-1">Dialog</h2>
    <p class="text-sm mb-6 text-muted-foreground">A modal dialog with focus trap, backdrop, and teleport.</p>

    <!-- 1. Title + description props -->
    <div class="demo-block">
      <span class="demo-label">Title &amp; description props</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open1"
          title="Confirm action"
          description="This will permanently delete the item. This action cannot be undone."
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-ghost" @click="close">Cancel</button>
              <button class="dlg-btn-primary" @click="close">Confirm</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 2. Custom #title and #description slots -->
    <div class="demo-block">
      <span class="demo-label">#title and #description slots</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open2"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content', title: 'dlg-title-custom' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #title>
            <span>🎉 Custom title slot</span>
          </template>
          <template #description>
            <p>This description comes from the <code>#description</code> slot, giving full control over markup.</p>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-primary" @click="close">Done</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 3. Custom #header slot (manual layout) -->
    <div class="demo-block">
      <span class="demo-label">Custom #header slot</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open3"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #header="{ close, titleId }">
            <div class="dlg-header-row">
              <h2 :id="titleId" class="dlg-title">Custom header layout</h2>
              <button class="dlg-close-btn" aria-label="Close" @click="close">✕</button>
            </div>
          </template>
          <template #body>
            <p class="dlg-body-text">The header slot gives full control. The close button is rendered manually.</p>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-ghost" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 4. No backdrop close -->
    <div class="demo-block">
      <span class="demo-label">closeOnBackdropClick: false</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open4"
          title="Sticky dialog"
          description="Clicking the backdrop won't close this. You must use the button."
          :close-on-backdrop-click="false"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-primary" @click="close">Close explicitly</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 5. Nested dialogs -->
    <div class="demo-block">
      <span class="demo-label">Nested dialogs</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open5"
          title="Outer dialog"
          description="Focus is trapped here. Open the inner dialog to pause this trap."
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open outer</button>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-ghost" @click="close">Close</button>
              <button class="dlg-btn-primary" @click="open5Inner = true">Open inner</button>
            </div>
          </template>
        </Dialog>

        <Dialog
          v-model="open5Inner"
          title="Inner dialog"
          description="This is stacked on top. The outer dialog's focus trap is paused."
          :ui="{ overlay: 'dlg-overlay-inner', content: 'dlg-content dlg-content-inner' }"
        >
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-primary" @click="close">Close inner</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 6. Fullscreen -->
    <div class="demo-block">
      <span class="demo-label">fullscreen prop</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open6"
          title="Fullscreen dialog"
          description="This dialog takes up the entire viewport."
          :fullscreen="true"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content dlg-content-fullscreen' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open fullscreen</button>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-primary" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 7. Body-only (no header, no footer) -->
    <div class="demo-block">
      <span class="demo-label">Body only (no header / footer)</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open7"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #body="{ close }">
            <p class="dlg-body-text" style="margin-bottom: 16px;">No header or footer — just a body slot. Dismiss by pressing Escape or clicking the backdrop.</p>
            <button class="dlg-btn-ghost" @click="close">Close</button>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 8. No transition -->
    <div class="demo-block">
      <span class="demo-label">No transition</span>
      <div class="demo-canvas">
        <Dialog
          v-model="open8"
          title="No animation"
          description="This dialog appears and disappears instantly — transition is disabled."
          :transition="false"
          :ui="{ overlay: 'dlg-overlay', content: 'dlg-content' }"
        >
          <template #trigger="{ toggle }">
            <button class="dlg-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div class="dlg-footer-row">
              <button class="dlg-btn-primary" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>
  </section>
</template>

<style>
/* Shared overlay */
.dlg-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.dlg-overlay-inner {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1px);
}

/* Base dialog content */
.dlg-content {
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
.dlg-content-inner {
  z-index: 400;
}
.dlg-content-fullscreen {
  top: 0;
  left: 0;
  transform: none;
  width: 100vw;
  height: 100dvh;
  max-width: 100vw;
  border-radius: 0;
  border: none;
}

/* Auto-rendered title/description */
.akaza-dialog-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
}
.akaza-dialog-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 12px;
}

/* Section padding */
.dlg-content .akaza-dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.dlg-content .akaza-dialog-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
.dlg-content .akaza-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

/* Helpers */
.dlg-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dlg-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
}
.dlg-title-custom {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}
.dlg-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 4px;
}
.dlg-close-btn:hover {
  color: var(--foreground);
}
.dlg-body-text {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  line-height: 1.5;
}
.dlg-footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.dlg-btn-primary {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.dlg-btn-primary:hover { opacity: 0.9; }
.dlg-btn-ghost {
  padding: 6px 16px;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
}
.dlg-btn-ghost:hover { background: var(--muted); }

/* Demo block layout */
.demo-block {
  margin-bottom: 24px;
}
.demo-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.demo-canvas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--accent);
}
</style>
