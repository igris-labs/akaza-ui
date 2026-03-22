<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { Collapsible } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";

// ── 1. Basic ─────────────────────────────────────────────────────────────────
const open1 = ref(false);

// ── 2. Initially open ────────────────────────────────────────────────────────
const open2 = ref(true);

// ── 3. unmountOnHide ─────────────────────────────────────────────────────────
const open3 = ref(false);
const mountCount = ref(0);

// ── 4. Custom trigger slot ───────────────────────────────────────────────────
const open4 = ref(false);

// ── 5. No icon (#icon slot replacement) ──────────────────────────────────────
const open5 = ref(false);

// ── 6. Disabled ──────────────────────────────────────────────────────────────
const open6 = ref(false);

// ── 7. Programmatic control via defineExpose ─────────────────────────────────
const open7 = ref(false);
const collapsibleRef = useTemplateRef<{ open: () => void; close: () => void; toggle: () => void }>("collapsibleRef");

// ── 8. ui prop ───────────────────────────────────────────────────────────────
const open8 = ref(false);

// ── 9. @open-change event details ────────────────────────────────────────────
const open9 = ref(false);
const clLog = ref<string[]>([]);
function onCollapsibleChange(open: boolean, details: AkazaChangeEventDetails) {
  clLog.value = [`${open ? 'open' : 'close'} — reason: ${details.reason}`, ...clLog.value].slice(0, 5);
}
</script>

<template>
  <section id="collapsible">
    <h2 class="text-lg font-semibold mb-1">Collapsible</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      An expandable panel with a trigger. Supports keyboard interaction, CSS
      grid animation, DOM unmounting, and programmatic control.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">Basic</span>
        <span class="cl-demo-label-desc">
          Bind <code>v-model</code> to control open state.
          The trigger has <code>aria-expanded</code> and <code>aria-controls</code> wired automatically.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible v-model="open1" :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }">
          <template #trigger>
            <span class="cl-trigger-label">What is Akaza UI?</span>
          </template>
          <template #content>
            A Vue-native headless component library. Components expose slots and
            a <code class="cl-code">ui</code> prop — you own all the styling.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 2. Initially open ───────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">Initially open</span>
        <span class="cl-demo-label-desc">
          Set the <code>v-model</code> initial value to <code>true</code> to start expanded.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible v-model="open2" :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }">
          <template #trigger>
            <span class="cl-trigger-label">Installation</span>
          </template>
          <template #content>
            <code class="cl-code-block">npm install akaza-ui</code>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 3. unmountOnHide ────────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">unmountOnHide</span>
        <span class="cl-demo-label-desc">
          When <code>unmount-on-hide</code> is set, the content is removed from the DOM on close —
          mount count below increments each time you open it.
        </span>
      </div>
      <div class="cl-demo-canvas cl-demo-canvas--col">
        <Collapsible
          v-model="open3"
          unmount-on-hide
          :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }"
        >
          <template #trigger>
            <span class="cl-trigger-label">Lazy panel</span>
          </template>
          <template #content>
            <div @vue:mounted="mountCount++">
              This panel remounts each time it opens.
              <span class="cl-badge">Mounted {{ mountCount }}×</span>
            </div>
          </template>
        </Collapsible>
        <p class="cl-hint">Inspect the DOM — this node disappears when closed.</p>
      </div>
    </div>

    <!-- ── 4. Custom trigger slot ──────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">Custom trigger slot</span>
        <span class="cl-demo-label-desc">
          The <code>#trigger</code> slot receives <code>{ isOpen, open, close, toggle }</code>.
          Use them to build any trigger UI — badges, icons, buttons inside buttons.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible v-model="open4" :ui="{ root: 'cl-root', trigger: 'cl-trigger cl-trigger--custom' }">
          <template #trigger="{ isOpen }">
            <div class="cl-custom-trigger">
              <span class="cl-custom-trigger-dot" :class="isOpen ? 'cl-custom-trigger-dot--open' : ''" />
              <span class="cl-trigger-label">Release notes</span>
              <span class="cl-badge">v1.4.0</span>
            </div>
          </template>
          <template #content>
            <div class="cl-content-body">
              <ul class="cl-release-list">
                <li>Added <code class="cl-code">unmountOnHide</code> to Collapsible</li>
                <li>Fixed ARIA <code class="cl-code">aria-controls</code> linking</li>
                <li>New <code class="cl-code">defineExpose</code> API for programmatic control</li>
              </ul>
            </div>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 5. Custom icon slot ─────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">#icon slot</span>
        <span class="cl-demo-label-desc">
          Replace the default chevron entirely. The <code>#icon</code> slot receives
          <code>{ isOpen }</code>.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible v-model="open5" :ui="{ root: 'cl-root', trigger: 'cl-trigger' }">
          <template #trigger>
            <span class="cl-trigger-label">Keyboard shortcuts</span>
          </template>
          <template #icon="{ isOpen }">
            <svg
              :style="{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
              xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </template>
          <template #content>
            <div class="cl-content-body">
              <div class="cl-kbd-row"><kbd class="cl-kbd">⌘ K</kbd><span>Open command palette</span></div>
              <div class="cl-kbd-row"><kbd class="cl-kbd">⌘ /</kbd><span>Toggle comment</span></div>
              <div class="cl-kbd-row"><kbd class="cl-kbd">⌘ ⇧ P</kbd><span>Command mode</span></div>
            </div>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 6. Disabled ────────────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">Disabled</span>
        <span class="cl-demo-label-desc">
          The <code>disabled</code> prop blocks interaction and sets
          <code>data-akaza-disabled</code> on both root and trigger.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible
          v-model="open6"
          disabled
          :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }"
        >
          <template #trigger>
            <span class="cl-trigger-label">Restricted section</span>
          </template>
          <template #content>
            You won't see this.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 7. Programmatic control (defineExpose) ─────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">Programmatic control</span>
        <span class="cl-demo-label-desc">
          Use a template ref to call <code>open()</code>, <code>close()</code>, and
          <code>toggle()</code> exposed by the component — no v-model needed for the buttons.
        </span>
      </div>
      <div class="cl-demo-canvas cl-demo-canvas--col">
        <div class="cl-prog-actions">
          <button class="cl-prog-btn" @click="collapsibleRef?.open()">Open</button>
          <button class="cl-prog-btn" @click="collapsibleRef?.close()">Close</button>
          <button class="cl-prog-btn" @click="collapsibleRef?.toggle()">Toggle</button>
        </div>
        <Collapsible
          ref="collapsibleRef"
          v-model="open7"
          :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }"
        >
          <template #trigger>
            <span class="cl-trigger-label">Controlled externally</span>
          </template>
          <template #content>
            This panel's state is driven by the buttons above.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 8. ui prop ─────────────────────────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">ui prop</span>
        <span class="cl-demo-label-desc">
          Pass extra classes to <code>root</code>, <code>trigger</code>, and <code>content</code>
          to style every part without modifying the slots.
        </span>
      </div>
      <div class="cl-demo-canvas">
        <Collapsible
          v-model="open8"
          :ui="{
            root: 'cl-ui-root',
            trigger: 'cl-ui-trigger',
            content: 'cl-ui-content',
          }"
        >
          <template #trigger>
            <span class="cl-ui-trigger-label">Styled via ui prop</span>
          </template>
          <template #content>
            All three parts — root, trigger, and content — receive custom classes
            through the <code class="cl-code">ui</code> prop.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 9. @open-change event details ──────────────────────────────────── -->
    <div class="cl-demo-block">
      <div class="cl-demo-label">
        <span class="cl-demo-label-title">@open-change event details</span>
        <span class="cl-demo-label-desc">
          Listen to <code>@open-change</code> to inspect <code>reason</code> (<code>"trigger"</code> or <code>"programmatic"</code>)
          and optionally call <code>details.cancel()</code> to prevent the change.
        </span>
      </div>
      <div class="cl-demo-canvas cl-demo-canvas--col">
        <Collapsible
          v-model="open9"
          :ui="{ root: 'cl-root', trigger: 'cl-trigger', content: 'cl-content-body' }"
          @open-change="onCollapsibleChange"
        >
          <template #trigger>
            <span class="cl-trigger-label">Click to toggle</span>
          </template>
          <template #content>
            Every open/close fires <code class="cl-code">@open-change</code> with a details object.
          </template>
        </Collapsible>
        <div v-if="clLog.length" class="cl-event-log">
          <code v-for="(entry, i) in clLog" :key="i" class="cl-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Shared collapsible shell ────────────────────────────────────────────── */
.cl-root {
  width: 100%;
  max-width: 28rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--background);
}

.cl-trigger {
  padding: 12px 16px;
  color: var(--foreground);
  transition: background 0.1s;
}

.cl-trigger:hover:not(:disabled):not([data-akaza-disabled]) {
  background: var(--muted);
}

.cl-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.cl-trigger:focus:not(:focus-visible) { outline: none; }

.cl-trigger[data-akaza-disabled] {
  opacity: 0.5;
}

.akaza-collapsible-icon {
  color: var(--muted-foreground);
}

.cl-trigger-label {
  font-size: 13px;
  font-weight: 500;
}

.cl-content-body {
  padding: 4px 16px 14px;
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.55;
  border-top: 1px solid var(--border);
}

/* ── Utilities ───────────────────────────────────────────────────────────── */
.cl-code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.cl-code-block {
  display: block;
  font-family: monospace;
  font-size: 12px;
  background: var(--muted);
  color: var(--foreground);
  padding: 8px 12px;
  border-radius: 6px;
}

.cl-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--muted);
  color: var(--muted-foreground);
}

.cl-hint {
  font-size: 11px;
  color: var(--muted-foreground);
  margin: 0;
}

/* ── Custom trigger example ───────────────────────────────────────────────── */
.cl-trigger--custom {
  padding: 12px 16px;
}

.cl-custom-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.cl-custom-trigger-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted-foreground);
  flex-shrink: 0;
  transition: background 0.15s;
}

.cl-custom-trigger-dot--open {
  background: var(--primary);
}

/* ── Keyboard shortcuts example ──────────────────────────────────────────── */
.cl-kbd-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--muted-foreground);
}

.cl-kbd {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
  color: var(--foreground);
}

.cl-release-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Programmatic control ────────────────────────────────────────────────── */
.cl-prog-actions {
  display: flex;
  gap: 8px;
}

.cl-prog-btn {
  padding: 5px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.cl-prog-btn:hover { background: var(--muted); }

/* ── ui prop example ─────────────────────────────────────────────────────── */
.cl-ui-root {
  width: 100%;
  max-width: 28rem;
  border-radius: 10px;
  border: 2px solid var(--primary);
  overflow: hidden;
  background: color-mix(in srgb, var(--primary) 4%, var(--background));
}

.cl-ui-trigger {
  padding: 12px 16px;
  color: var(--primary);
  font-weight: 600;
  font-size: 13px;
  transition: background 0.1s;
}

.cl-ui-trigger:hover { background: color-mix(in srgb, var(--primary) 8%, transparent); }
.cl-ui-trigger:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.cl-ui-trigger:focus:not(:focus-visible) { outline: none; }

.cl-ui-trigger-label { font-size: 13px; }

.cl-ui-content {
  padding: 10px 16px 14px;
  font-size: 13px;
  color: var(--muted-foreground);
  border-top: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.cl-demo-block { margin-bottom: 32px; }
.cl-demo-label { margin-bottom: 12px; }

.cl-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.cl-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.cl-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.cl-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: flex-start;
}

.cl-demo-canvas--col {
  flex-direction: column;
  gap: 12px;
}

/* Event log */
.cl-event-log {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cl-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
