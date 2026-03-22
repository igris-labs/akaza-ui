<script setup lang="ts">
import { ref } from "vue";
import { useOverlay } from "akaza-ui";
import OverlayDialog from "./OverlayDialog.vue";

const overlay = useOverlay();

// ── 1. Basic programmatic open ──────────────────────────────────────────────
const basicModal = overlay.create(OverlayDialog);

// ── 2. Await return value ───────────────────────────────────────────────────
const returnModal = overlay.create(OverlayDialog);
const lastResult = ref<string>("(none)");

async function openReturnModal() {
  const { result } = returnModal.open({
    title: "Confirm action",
    message: "Click Confirm or Cancel — the result is logged below. You can also press Escape or click the backdrop.",
  });
  const value = await result;
  lastResult.value = value === true ? "confirmed" : value === false ? "canceled" : "dismissed";
}

// ── 3. destroyOnClose ───────────────────────────────────────────────────────
const destroyLog = ref<string[]>([]);

async function openDestroyModal() {
  const modal = overlay.create(OverlayDialog, { destroyOnClose: true });
  destroyLog.value = ["created", ...destroyLog.value].slice(0, 5);
  const { result } = modal.open({ title: "Destroy on close", message: "This overlay is removed from the DOM when closed." });
  await result;
  destroyLog.value = ["destroyed", ...destroyLog.value].slice(0, 5);
}
</script>

<template>
  <section id="overlay">
    <h2 class="text-lg font-semibold mb-1">Overlay (programmatic)</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Open dialogs, drawers, and other overlays imperatively via <code>useOverlay</code>.
      Mount <code>&lt;OverlayProvider /&gt;</code> at your app root.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="ov-demo-block">
      <div class="ov-demo-label">
        <span class="ov-demo-label-title">Basic programmatic open</span>
        <span class="ov-demo-label-desc">
          <code>overlay.create(Component)</code> returns an instance.
          Call <code>instance.open()</code> to show it. Close via Escape, backdrop, or buttons.
        </span>
      </div>
      <div class="ov-demo-canvas">
        <button class="ov-btn-primary" @click="basicModal.open({ title: 'Hello!', message: 'Opened programmatically. Press Escape, click the backdrop, or use the buttons to close.' })">
          Open dialog
        </button>
      </div>
    </div>

    <!-- ── 2. Await return value ───────────────────────────────────────────── -->
    <div class="ov-demo-block">
      <div class="ov-demo-label">
        <span class="ov-demo-label-title">Await return value</span>
        <span class="ov-demo-label-desc">
          <code>open()</code> returns <code>{ result: Promise }</code>.
          The promise resolves when the component emits <code>close</code> or when <code>model-value</code> becomes false.
        </span>
      </div>
      <div class="ov-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <button class="ov-btn-primary" @click="openReturnModal">Open &amp; await</button>
        <code class="ov-state">result: {{ lastResult }}</code>
      </div>
    </div>

    <!-- ── 3. destroyOnClose ───────────────────────────────────────────────── -->
    <div class="ov-demo-block">
      <div class="ov-demo-label">
        <span class="ov-demo-label-title">destroyOnClose</span>
        <span class="ov-demo-label-desc">
          Pass <code>destroyOnClose: true</code> to remove the component from the DOM when closed.
          Each open creates a fresh instance.
        </span>
      </div>
      <div class="ov-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <button class="ov-btn-primary" @click="openDestroyModal">Open (destroy on close)</button>
        <div v-if="destroyLog.length" class="ov-event-log">
          <code v-for="(entry, i) in destroyLog" :key="i" class="ov-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Overlay dialog styles ───────────────────────────────────────────────── */
.ov-dlg-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ov-dlg-content {
  z-index: 200;
  width: min(90vw, 420px);
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  outline: none;
}

.ov-dlg-header { padding: 16px 20px; border-bottom: 1px solid var(--border); }
.ov-dlg-body { padding: 20px; }
.ov-dlg-footer-section { padding: 16px 20px; border-top: 1px solid var(--border); }
.ov-dlg-title { font-size: 1rem; font-weight: 600; }
.ov-dlg-message { font-size: 0.875rem; color: var(--muted-foreground); margin: 0; }

.ov-dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Transition */
.ov-dialog-enter-active,
.ov-dialog-leave-active {
  transition: opacity 0.15s ease;
}
.ov-dialog-enter-from,
.ov-dialog-leave-to {
  opacity: 0;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.ov-btn-primary {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.ov-btn-primary:hover { opacity: 0.9; }

.ov-btn-ghost {
  padding: 6px 16px;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
}
.ov-btn-ghost:hover { background: var(--muted); }

/* ── State / log ─────────────────────────────────────────────────────────── */
.ov-state {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

.ov-event-log { display: flex; flex-direction: column; gap: 4px; }
.ov-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.ov-demo-block { margin-bottom: 32px; }
.ov-demo-label { margin-bottom: 12px; }

.ov-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.ov-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.ov-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.ov-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
