<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { Collapsible } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  canvas,
  canvasCol,
  codePill,
  collapsibleCustomUi,
  collapsibleUi,
  eventEntry,
  eventLog,
  inlineCode,
  sectionDescription,
  sectionTitle,
} from "../styles";

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
    <h2 :class="sectionTitle">Collapsible</h2>
    <p :class="sectionDescription">
      An expandable panel with a trigger. Supports keyboard interaction, CSS
      grid animation, DOM unmounting, and programmatic control.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Basic</span>
        <span class="text-xs text-muted-foreground">
          Bind <code :class="inlineCode">v-model</code> to control open state.
          The trigger has <code :class="inlineCode">aria-expanded</code> and <code :class="inlineCode">aria-controls</code> wired automatically.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible v-model="open1" :ui="collapsibleUi">
          <template #trigger>
            <span>What is Akaza UI?</span>
          </template>
          <template #content>
            A Vue-native headless component library. Components expose slots and
            a <code :class="inlineCode">ui</code> prop — you own all the styling.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 2. Initially open ───────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Initially open</span>
        <span class="text-xs text-muted-foreground">
          Set the <code :class="inlineCode">v-model</code> initial value to <code :class="inlineCode">true</code> to start expanded.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible v-model="open2" :ui="collapsibleUi">
          <template #trigger>
            <span>Installation</span>
          </template>
          <template #content>
            <code :class="codePill">npm install akaza-ui</code>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 3. unmountOnHide ────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">unmountOnHide</span>
        <span class="text-xs text-muted-foreground">
          When <code :class="inlineCode">unmount-on-hide</code> is set, the content is removed from the DOM on close —
          mount count below increments each time you open it.
        </span>
      </div>
      <div :class="canvasCol">
        <Collapsible
          v-model="open3"
          unmount-on-hide
          :ui="collapsibleUi"
        >
          <template #trigger>
            <span>Lazy panel</span>
          </template>
          <template #content>
            <div @vue:mounted="mountCount++">
              This panel remounts each time it opens.
              <span :class="codePill">Mounted {{ mountCount }}×</span>
            </div>
          </template>
        </Collapsible>
        <p class="m-0 text-xs text-muted-foreground">Inspect the DOM — this node disappears when closed.</p>
      </div>
    </div>

    <!-- ── 4. Custom trigger slot ──────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Custom trigger slot</span>
        <span class="text-xs text-muted-foreground">
          The <code :class="inlineCode">#trigger</code> slot receives <code :class="inlineCode">{ isOpen, open, close, toggle }</code>.
          Use them to build any trigger UI — badges, icons, buttons inside buttons.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible v-model="open4" :ui="collapsibleUi">
          <template #trigger="{ isOpen }">
            <div class="flex w-full items-center gap-2">
              <span class="size-2 shrink-0 rounded-full bg-muted-foreground transition-colors" :class="isOpen ? 'bg-primary' : ''" />
              <span>Release notes</span>
              <span :class="codePill">v1.4.0</span>
            </div>
          </template>
          <template #content>
            <ul class="m-0 grid gap-1 pl-4">
              <li>Added <code :class="inlineCode">unmountOnHide</code> to Collapsible</li>
              <li>Fixed ARIA <code :class="inlineCode">aria-controls</code> linking</li>
              <li>New <code :class="inlineCode">defineExpose</code> API for programmatic control</li>
            </ul>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 5. Custom icon slot ─────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">#icon slot</span>
        <span class="text-xs text-muted-foreground">
          Replace the default chevron entirely. The <code :class="inlineCode">#icon</code> slot receives
          <code :class="inlineCode">{ isOpen }</code>.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible v-model="open5" :ui="collapsibleUi">
          <template #trigger>
            <span>Keyboard shortcuts</span>
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
            <div class="flex items-center gap-2.5 py-1 text-xs text-muted-foreground"><kbd :class="codePill">⌘ K</kbd><span>Open command palette</span></div>
            <div class="flex items-center gap-2.5 py-1 text-xs text-muted-foreground"><kbd :class="codePill">⌘ /</kbd><span>Toggle comment</span></div>
            <div class="flex items-center gap-2.5 py-1 text-xs text-muted-foreground"><kbd :class="codePill">⌘ ⇧ P</kbd><span>Command mode</span></div>
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 6. Disabled ────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Disabled</span>
        <span class="text-xs text-muted-foreground">
          The <code :class="inlineCode">disabled</code> prop blocks interaction and sets
          <code :class="inlineCode">data-akaza-disabled</code> on both root and trigger.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible
          v-model="open6"
          disabled
          :ui="collapsibleUi"
        >
          <template #trigger>
            <span>Restricted section</span>
          </template>
          <template #content>
            You won't see this.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 7. Programmatic control (defineExpose) ─────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Programmatic control</span>
        <span class="text-xs text-muted-foreground">
          Use a template ref to call <code :class="inlineCode">open()</code>, <code :class="inlineCode">close()</code>, and
          <code :class="inlineCode">toggle()</code> exposed by the component — no v-model needed for the buttons.
        </span>
      </div>
      <div :class="canvasCol">
        <div class="flex gap-2">
          <button :class="buttonGhost" @click="collapsibleRef?.open()">Open</button>
          <button :class="buttonGhost" @click="collapsibleRef?.close()">Close</button>
          <button :class="buttonGhost" @click="collapsibleRef?.toggle()">Toggle</button>
        </div>
        <Collapsible
          ref="collapsibleRef"
          v-model="open7"
          :ui="collapsibleUi"
        >
          <template #trigger>
            <span>Controlled externally</span>
          </template>
          <template #content>
            This panel's state is driven by the buttons above.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 8. ui prop ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">ui prop</span>
        <span class="text-xs text-muted-foreground">
          Pass extra classes to <code :class="inlineCode">root</code>, <code :class="inlineCode">trigger</code>, and <code :class="inlineCode">content</code>
          to style every part without modifying the slots.
        </span>
      </div>
      <div :class="canvas">
        <Collapsible
          v-model="open8"
          :ui="collapsibleCustomUi"
        >
          <template #trigger>
            <span>Styled via ui prop</span>
          </template>
          <template #content>
            All three parts — root, trigger, and content — receive custom classes
            through the <code :class="inlineCode">ui</code> prop.
          </template>
        </Collapsible>
      </div>
    </div>

    <!-- ── 9. @open-change event details ──────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">@open-change event details</span>
        <span class="text-xs text-muted-foreground">
          Listen to <code :class="inlineCode">@open-change</code> to inspect <code :class="inlineCode">reason</code> (<code :class="inlineCode">"trigger"</code> or <code :class="inlineCode">"programmatic"</code>)
          and optionally call <code :class="inlineCode">details.cancel()</code> to prevent the change.
        </span>
      </div>
      <div :class="canvasCol">
        <Collapsible
          v-model="open9"
          :ui="collapsibleUi"
          @open-change="onCollapsibleChange"
        >
          <template #trigger>
            <span>Click to toggle</span>
          </template>
          <template #content>
            Every open/close fires <code :class="inlineCode">@open-change</code> with a details object.
          </template>
        </Collapsible>
        <div v-if="clLog.length" :class="eventLog">
          <code v-for="(entry, i) in clLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
