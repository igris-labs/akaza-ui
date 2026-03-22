<script setup lang="ts">
import { ref } from "vue";
import { Drawer } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";

const openRight = ref(false);
const openLeft = ref(false);
const openBottom = ref(false);
const openTop = ref(false);
const openInset = ref(false);
const openTitleProp = ref(false);
const openTitleSlot = ref(false);
const openNoSwipe = ref(false);

// ── 9. Event details ────────────────────────────────────────────────────────
const openEvents = ref(false);
const drawerLog = ref<string[]>([]);
function onDrawerChange(open: boolean, details: AkazaChangeEventDetails) {
  drawerLog.value = [`${open ? 'open' : 'close'} — reason: ${details.reason}`, ...drawerLog.value].slice(0, 5);
}
</script>

<template>
  <section id="drawer">
    <h2 class="text-lg font-semibold mb-1">Drawer</h2>
    <p class="text-sm mb-6 text-muted-foreground">
      A side panel with focus trap, backdrop, and swipe-to-dismiss gestures. Swipe in the dismiss
      direction (≥100px) to close.
    </p>

    <!-- 1. Right drawer (default) -->
    <div class="demo-block">
      <span class="demo-label">Right (default)</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openRight"
          title="Right Drawer"
          description="Swipe right or press Escape to close."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-right' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open right</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 2. Left drawer -->
    <div class="demo-block">
      <span class="demo-label">Left</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openLeft"
          side="left"
          title="Left Drawer"
          description="Swipe left or press Escape to close."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-left' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open left</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 3. Bottom sheet -->
    <div class="demo-block">
      <span class="demo-label">Bottom sheet</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openBottom"
          side="bottom"
          title="Bottom Sheet"
          description="Swipe down or press Escape to close."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-bottom' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open bottom</button>
          </template>
          <template #handle>
            <div class="drw-handle-bar" />
          </template>
          <template #footer="{ close }">
            <div class="drw-footer-row">
              <button class="drw-btn-ghost" @click="close">Cancel</button>
              <button class="drw-btn-primary" @click="close">Confirm</button>
            </div>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 4. Top sheet -->
    <div class="demo-block">
      <span class="demo-label">Top</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openTop"
          side="top"
          title="Top Drawer"
          description="Swipe up or press Escape to close."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-top' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open top</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 5. Inset -->
    <div class="demo-block">
      <span class="demo-label">Inset (12px)</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openInset"
          side="right"
          :inset="12"
          title="Inset Drawer"
          description="12px inset from all edges with rounded corners."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-right' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open inset</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 6. title/description props with reactive overlay opacity -->
    <div class="demo-block">
      <span class="demo-label">Overlay reacts to swipe progress</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openTitleProp"
          title="Swipe me"
          description="The backdrop fades as you drag. --drawer-swipe-progress drives the opacity."
          :ui="{
            overlay: 'drw-overlay drw-overlay-reactive',
            content: 'drw-panel drw-panel-right',
          }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 7. Custom #header + #title slot -->
    <div class="demo-block">
      <span class="demo-label">Custom #header slot</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openTitleSlot"
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-right' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open</button>
          </template>
          <template #header="{ close, titleId }">
            <div class="drw-header-row">
              <h2 :id="titleId" class="drw-title">Custom header layout</h2>
              <button class="drw-close-btn" aria-label="Close" @click="close">✕</button>
            </div>
          </template>
          <template #body>
            <p class="drw-body-text">
              Full control over the header via the <code>#header</code> slot.
            </p>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 8. swipeToClose: false -->
    <div class="demo-block">
      <span class="demo-label">swipeToClose: false</span>
      <div class="demo-canvas">
        <Drawer
          v-model="openNoSwipe"
          title="No swipe gestures"
          description="Swipe gestures are disabled. Use the button or press Escape."
          :swipe-to-close="false"
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-right' }"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <!-- 9. @open-change event details -->
    <div class="demo-block">
      <span class="demo-label">@open-change event details</span>
      <div class="demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Drawer
          v-model="openEvents"
          title="Event details demo"
          description="Close via backdrop, Escape, swipe, or the button — each reports a different reason."
          :ui="{ overlay: 'drw-overlay', content: 'drw-panel drw-panel-right' }"
          @open-change="onDrawerChange"
        >
          <template #trigger="{ toggle }">
            <button class="drw-btn-primary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <button class="drw-btn-ghost drw-btn-full" @click="close">Close</button>
          </template>
        </Drawer>
        <div v-if="drawerLog.length" class="drw-event-log">
          <code v-for="(entry, i) in drawerLog" :key="i" class="drw-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* Overlay */
.drw-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.drw-overlay-reactive {
  opacity: calc(1 - var(--drawer-swipe-progress, 0));
}

/* Base panel */
.drw-panel {
  z-index: 200;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Side-specific sizing */
.drw-panel-right,
.drw-panel-left {
  width: min(90vw, 360px);
}
.drw-panel-right {
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}
.drw-panel-left {
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.drw-panel-bottom,
.drw-panel-top {
  max-height: 60vh;
  border-radius: 16px 16px 0 0;
}
.drw-panel-top {
  border-radius: 0 0 16px 16px;
}

/* Section padding */
.drw-panel .akaza-drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.drw-panel .akaza-drawer-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
.drw-panel .akaza-drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

/* Handle bar — rendered in #handle slot at very top of panel */
.drw-handle-bar {
  width: 48px;
  height: 4px;
  border-radius: 9999px;
  background: var(--muted-foreground);
  opacity: 0.4;
  margin: 12px auto 4px;
}

/* Helpers */
.drw-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drw-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
}
.drw-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted-foreground);
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 4px;
}
.drw-close-btn:hover {
  color: var(--foreground);
}
.drw-body-text {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  line-height: 1.5;
}
.drw-footer-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.drw-btn-primary {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.drw-btn-primary:hover {
  opacity: 0.9;
}
.drw-btn-ghost {
  padding: 6px 16px;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
}
.drw-btn-ghost:hover {
  background: var(--muted);
}
.drw-btn-full {
  width: 100%;
}

/* Event log */
.drw-event-log {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.drw-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

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
