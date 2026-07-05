<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  buttonLink,
  buttonPrimary,
  canvasCol,
  canvasRow,
  codePill,
  eventEntry,
  eventLog as eventLogClass,
  inlineCode,
  popoverContent,
  sectionDescription,
  sectionTitle,
} from "../styles";

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
    <h2 :class="sectionTitle">Popover</h2>
    <p :class="sectionDescription">
      A floating panel anchored to a trigger. Supports auto-flip, alignment, and programmatic control.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Basic</span>
        <span class="text-xs text-muted-foreground">
          Click the trigger. Close via Escape, clicking outside, or the close button inside.
        </span>
      </div>
      <div :class="canvasRow">
        <Popover :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">Open popover</button>
          </template>
          <template #content="{ close }">
            <div class="grid gap-1.5">
              <p class="m-0 text-sm font-semibold text-foreground">Popover content</p>
              <p class="m-0 text-xs text-muted-foreground">Click outside or press Escape to close.</p>
              <button :class="buttonLink" @click="close()">Close</button>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 2. Controlled (v-model) ────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Controlled (v-model)</span>
        <span class="text-xs text-muted-foreground">
          Bind <code :class="inlineCode">v-model</code> to read and control open state externally.
        </span>
      </div>
      <div :class="canvasCol">
        <div class="flex flex-wrap items-center gap-2">
          <Popover v-model="isOpen" :ui="{ content: popoverContent }">
            <template #trigger="{ triggerProps, toggle }">
              <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">Toggle</button>
            </template>
            <template #content>
              <div class="grid gap-1.5">
                <p class="m-0 text-sm font-semibold text-foreground">Controlled popover</p>
                <p class="m-0 text-xs text-muted-foreground">State is held externally via <code :class="inlineCode">v-model</code>.</p>
              </div>
            </template>
          </Popover>
          <button :class="buttonGhost" @click="isOpen = true">Force open</button>
          <button :class="buttonGhost" @click="isOpen = false">Force close</button>
        </div>
        <code :class="codePill">isOpen: {{ isOpen }}</code>
      </div>
    </div>

    <!-- ── 3. Alignment ───────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Alignment — <code :class="inlineCode">align</code></span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">align</code> controls cross-axis placement: <code :class="inlineCode">start</code>, <code :class="inlineCode">center</code>, <code :class="inlineCode">end</code>.
        </span>
      </div>
      <div :class="[canvasRow, 'justify-center gap-4']">
        <Popover v-for="a in ['start', 'center', 'end']" :key="a" :align="(a as any)" :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">{{ a }}</button>
          </template>
          <template #content>
            <div class="grid gap-1.5">
              <p class="m-0 text-sm font-semibold text-foreground">align="{{ a }}"</p>
              <p class="m-0 text-xs text-muted-foreground">Content aligns to the {{ a }} of the trigger.</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 4. Side ────────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Side — <code :class="inlineCode">side</code></span>
        <span class="text-xs text-muted-foreground">
          Preferred side: <code :class="inlineCode">top</code>, <code :class="inlineCode">bottom</code>, <code :class="inlineCode">left</code>, <code :class="inlineCode">right</code>.
          Auto-flips if there's not enough room.
        </span>
      </div>
      <div :class="[canvasRow, 'justify-center gap-4']">
        <Popover v-for="s in ['top', 'bottom', 'left', 'right']" :key="s" :side="(s as any)" :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">{{ s }}</button>
          </template>
          <template #content>
            <p class="m-0 text-sm font-semibold text-foreground">side="{{ s }}"</p>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 5. sideOffset ──────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Gap — <code :class="inlineCode">sideOffset</code></span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">sideOffset</code> controls the px gap between trigger and content (default: 6).
        </span>
      </div>
      <div :class="[canvasRow, 'justify-center gap-4']">
        <Popover v-for="offset in [0, 6, 16]" :key="offset" :side-offset="offset" :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">offset={{ offset }}</button>
          </template>
          <template #content>
            <p class="m-0 text-sm font-semibold text-foreground">sideOffset={{ offset }}</p>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 6. triggerProps (ARIA) ─────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">triggerProps (ARIA)</span>
        <span class="text-xs text-muted-foreground">
          Spread <code :class="inlineCode">triggerProps</code> onto the trigger element to get
          <code :class="inlineCode">aria-haspopup</code>, <code :class="inlineCode">aria-expanded</code>, and <code :class="inlineCode">aria-controls</code> automatically.
        </span>
      </div>
      <div :class="canvasRow">
        <Popover :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps, isOpen }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">
              {{ isOpen ? "Close" : "Open" }} (inspect ARIA attrs)
            </button>
          </template>
          <template #content>
            <div class="grid gap-1.5">
              <p class="m-0 text-sm font-semibold text-foreground">ARIA attributes applied</p>
              <p class="m-0 text-xs text-muted-foreground">Inspect the trigger button in DevTools to see the attributes.</p>
            </div>
          </template>
        </Popover>
      </div>
    </div>

    <!-- ── 7. @open-change ────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">@open-change event</span>
        <span class="text-xs text-muted-foreground">
          Emits <code :class="inlineCode">(open, details)</code> with <code :class="inlineCode">details.reason</code>:
          <code :class="inlineCode">outside-click</code>, <code :class="inlineCode">escape</code>, <code :class="inlineCode">programmatic</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <Popover :ui="{ content: popoverContent }" @open-change="onOpenChange">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">Open &amp; watch events</button>
          </template>
          <template #content="{ close }">
            <div class="grid gap-1.5">
              <p class="m-0 text-sm font-semibold text-foreground">Trigger a close</p>
              <p class="m-0 text-xs text-muted-foreground">Press Escape, click outside, or use the button.</p>
              <button :class="buttonLink" @click="close()">Close (programmatic)</button>
            </div>
          </template>
        </Popover>
        <div v-if="eventLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in eventLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- ── 8. Cancelable close ────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Cancelable close</span>
        <span class="text-xs text-muted-foreground">
          Call <code :class="inlineCode">details.cancel()</code> inside <code :class="inlineCode">@open-change</code> to prevent the state change.
          This example blocks Escape — only clicking outside or the button closes it.
        </span>
      </div>
      <div :class="canvasCol">
        <Popover :ui="{ content: popoverContent }" @open-change="onOpenChangeCancelEscape">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">Open (Escape blocked)</button>
          </template>
          <template #content="{ close }">
            <div class="grid gap-1.5">
              <p class="m-0 text-sm font-semibold text-foreground">Escape is blocked</p>
              <p class="m-0 text-xs text-muted-foreground">Click outside or use the button to close.</p>
              <button :class="buttonLink" @click="close()">Close</button>
            </div>
          </template>
        </Popover>
        <div v-if="cancelLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in cancelLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- ── 9. Custom transition ───────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Custom transition / no transition</span>
        <span class="text-xs text-muted-foreground">
          Pass a custom <code :class="inlineCode">transition</code> name or <code :class="inlineCode">:transition="false"</code> to disable animation.
        </span>
      </div>
      <div :class="[canvasRow, 'gap-4']">
        <Popover transition="po-slide" :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">Slide transition</button>
          </template>
          <template #content>
            <p class="m-0 text-sm font-semibold text-foreground">Custom slide</p>
          </template>
        </Popover>

        <Popover :transition="false" :ui="{ content: popoverContent }">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle()">No transition</button>
          </template>
          <template #content>
            <p class="m-0 text-sm font-semibold text-foreground">No animation</p>
          </template>
        </Popover>
      </div>
    </div>
  </section>
</template>

<style>
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
