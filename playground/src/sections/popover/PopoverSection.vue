<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";

// ── 1. Basic ─────────────────────────────────────────────────────────────────
// (uncontrolled — no v-model needed)

// ── 2. Controlled ────────────────────────────────────────────────────────────
const isOpen = ref(false);

// ── 3. Alignment ─────────────────────────────────────────────────────────────
// (static props, no state needed)

// ── 4. Side ──────────────────────────────────────────────────────────────────
// (static props, no state needed)

// ── 5. sideOffset ────────────────────────────────────────────────────────────
// (static props, no state needed)

// ── 6. triggerProps (ARIA) ───────────────────────────────────────────────────
// (demonstrated via slot binding)

// ── 7. @open-change ─────────────────────────────────────────────────────────
const eventLog = ref<string[]>([]);

function onOpenChange(open: boolean, details: AkazaChangeEventDetails) {
  const entry = `${open ? "opened" : "closed"} · reason: ${details.reason}`;
  eventLog.value = [entry, ...eventLog.value].slice(0, 5);
}

// ── 8. Cancelable close ──────────────────────────────────────────────────────
const cancelLog = ref<string[]>([]);

function onOpenChangeCancelEscape(open: boolean, details: AkazaChangeEventDetails) {
  if (!open && details.reason === "escape") {
    details.cancel();
    cancelLog.value = ["escape blocked", ...cancelLog.value].slice(0, 5);
    return;
  }
  cancelLog.value = [`${open ? "opened" : "closed"} · ${details.reason}`, ...cancelLog.value].slice(0, 5);
}
</script>

<template>
  <section id="popover">
    <h2 class="text-lg font-semibold mb-1">Popover</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      A floating panel anchored to a trigger. Supports auto-flip, alignment, and programmatic control.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Basic</span>
        <span class="po-demo-label-desc">
          Click the trigger. Close via Escape, clicking outside, or the close button inside.
        </span>
      </div>
      <div class="po-demo-canvas">
        <Popover :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">Open popover</button>
          </template>
          <template #content="{ close }">
            <div class="po-body">
              <p class="po-body-title">Popover content</p>
              <p class="po-body-desc">Click outside or press Escape to close.</p>
              <button class="po-close-btn" @click="close()">Close</button>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 2. Controlled (v-model) ────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Controlled (v-model)</span>
        <span class="po-demo-label-desc">
          Bind <code>v-model</code> to read and control open state externally.
        </span>
      </div>
      <div class="po-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <Popover v-model="isOpen" :ui="{ content: 'po-content' }">
            <template #trigger="{ triggerProps, toggle }">
              <button class="po-btn" v-bind="triggerProps" @click="toggle()">Toggle</button>
            </template>
            <template #content>
              <div class="po-body">
                <p class="po-body-title">Controlled popover</p>
                <p class="po-body-desc">State is held externally via <code>v-model</code>.</p>
              </div>
            </template>
          </Popover>
          <button class="po-btn-ghost" @click="isOpen = true">Force open</button>
          <button class="po-btn-ghost" @click="isOpen = false">Force close</button>
        </div>
        <code class="po-state">isOpen: {{ isOpen }}</code>
      </div>
    </div>

    <!-- ── 3. Alignment ───────────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Alignment — <code>align</code></span>
        <span class="po-demo-label-desc">
          <code>align</code> controls cross-axis placement: <code>start</code>, <code>center</code>, <code>end</code>.
        </span>
      </div>
      <div class="po-demo-canvas" style="justify-content: center; gap: 16px;">
        <Popover v-for="a in ['start', 'center', 'end']" :key="a" :align="(a as any)" :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">{{ a }}</button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">align="{{ a }}"</p>
              <p class="po-body-desc">Content aligns to the {{ a }} of the trigger.</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 4. Side ────────────────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Side — <code>side</code></span>
        <span class="po-demo-label-desc">
          Preferred side: <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>.
          Auto-flips if there's not enough room.
        </span>
      </div>
      <div class="po-demo-canvas" style="justify-content: center; gap: 16px;">
        <Popover v-for="s in ['top', 'bottom', 'left', 'right']" :key="s" :side="(s as any)" :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">{{ s }}</button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">side="{{ s }}"</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 5. sideOffset ──────────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Gap — <code>sideOffset</code></span>
        <span class="po-demo-label-desc">
          <code>sideOffset</code> controls the px gap between trigger and content (default: 6).
        </span>
      </div>
      <div class="po-demo-canvas" style="justify-content: center; gap: 16px;">
        <Popover v-for="offset in [0, 6, 16]" :key="offset" :side-offset="offset" :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">offset={{ offset }}</button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">sideOffset={{ offset }}</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 6. triggerProps (ARIA) ─────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">triggerProps (ARIA)</span>
        <span class="po-demo-label-desc">
          Spread <code>triggerProps</code> onto the trigger element to get
          <code>aria-haspopup</code>, <code>aria-expanded</code>, and <code>aria-controls</code> automatically.
        </span>
      </div>
      <div class="po-demo-canvas">
        <Popover :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps, isOpen }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">
              {{ isOpen ? "Close" : "Open" }} (inspect ARIA attrs)
            </button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">ARIA attributes applied</p>
              <p class="po-body-desc">Inspect the trigger button in DevTools to see the attributes.</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 7. @open-change ────────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">@open-change event</span>
        <span class="po-demo-label-desc">
          Emits <code>(open, details)</code> with <code>details.reason</code>:
          <code>outside-click</code>, <code>escape</code>, <code>programmatic</code>.
        </span>
      </div>
      <div class="po-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Popover :ui="{ content: 'po-content' }" @open-change="onOpenChange">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">Open &amp; watch events</button>
          </template>
          <template #content="{ close }">
            <div class="po-body">
              <p class="po-body-title">Trigger a close</p>
              <p class="po-body-desc">Press Escape, click outside, or use the button.</p>
              <button class="po-close-btn" @click="close()">Close (programmatic)</button>
            </div>
          </template>
        </Popover>
        <div v-if="eventLog.length" class="po-event-log">
          <code v-for="(entry, i) in eventLog" :key="i" class="po-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- ── 8. Cancelable close ────────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Cancelable close</span>
        <span class="po-demo-label-desc">
          Call <code>details.cancel()</code> inside <code>@open-change</code> to prevent the state change.
          This example blocks Escape — only clicking outside or the button closes it.
        </span>
      </div>
      <div class="po-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Popover :ui="{ content: 'po-content' }" @open-change="onOpenChangeCancelEscape">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">Open (Escape blocked)</button>
          </template>
          <template #content="{ close }">
            <div class="po-body">
              <p class="po-body-title">Escape is blocked</p>
              <p class="po-body-desc">Click outside or use the button to close.</p>
              <button class="po-close-btn" @click="close()">Close</button>
            </div>
          </template>
        </Popover>
        <div v-if="cancelLog.length" class="po-event-log">
          <code v-for="(entry, i) in cancelLog" :key="i" class="po-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- ── 9. Custom transition ───────────────────────────────────────────── -->
    <div class="po-demo-block">
      <div class="po-demo-label">
        <span class="po-demo-label-title">Custom transition / no transition</span>
        <span class="po-demo-label-desc">
          Pass a custom <code>transition</code> name or <code>:transition="false"</code> to disable animation.
        </span>
      </div>
      <div class="po-demo-canvas" style="gap: 16px;">
        <Popover transition="po-slide" :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">Slide transition</button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">Custom slide</p>
            </div>
          </template>
        </Popover>

        <Popover :transition="false" :ui="{ content: 'po-content' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="po-btn" v-bind="triggerProps" @click="toggle()">No transition</button>
          </template>
          <template #content>
            <div class="po-body">
              <p class="po-body-title">No animation</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Content ────────────────────────────────────────────────────────────────── */
.po-content {
  position: fixed;
  z-index: 50;
  min-width: 200px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.po-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.po-body-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
  margin: 0;
}

.po-body-desc {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin: 0;
}

.po-close-btn {
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--primary);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-align: left;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.po-btn {
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
.po-btn:hover { opacity: 0.9; }

.po-btn-ghost {
  padding: 6px 14px;
  border-radius: 6px;
  background: transparent;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
}
.po-btn-ghost:hover { background: color-mix(in oklch, var(--muted-foreground) 15%, transparent); }

/* ── State / log ────────────────────────────────────────────────────────── */
.po-state {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

.po-event-log { display: flex; flex-direction: column; gap: 4px; }
.po-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

/* ── Demo layout ────────────────────────────────────────────────────────── */
.po-demo-block { margin-bottom: 32px; }
.po-demo-label { margin-bottom: 12px; }

.po-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.po-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.po-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.po-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

/* ── Custom transition ──────────────────────────────────────────────────── */
.po-slide-enter-active,
.po-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.po-slide-enter-from,
.po-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
