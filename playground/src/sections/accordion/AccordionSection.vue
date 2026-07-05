<script setup lang="ts">
import { ref } from "vue";
import type { AccordionItem, AkazaChangeEventDetails } from "akaza-ui";
import { Accordion } from "akaza-ui";
import {
  accordionCustomUi,
  accordionRoot,
  accordionUi,
  buttonGhost,
  canvas,
  canvasCol,
  codePill,
  eventEntry,
  eventLog,
  inlineCode,
  sectionDescription,
  sectionTitle,
} from "../styles";

// ── 1. Zero-config ───────────────────────────────────────────────────────────
const autoItems: AccordionItem[] = [
  {
    label: "What is Akaza UI?",
    content: "A Vue-native headless component library. Pass items with label + content and the accordion renders itself — no slots required.",
  },
  {
    label: "How does styling work?",
    content: "Components own their DOM structure. Style via the ui prop for class overrides, or fill named slots to take full control.",
  },
  {
    label: "Does it support keyboard navigation?",
    content: "Yes. Arrow Up / Down moves between triggers. Home jumps to the first, End to the last. All follows WAI-ARIA best practices.",
  },
];

// ── 2. Collapsible (single) ──────────────────────────────────────────────────
const collapsibleOpen = ref("");
const collapsibleItems: AccordionItem[] = [
  { label: "Click to open", content: "Click the same trigger again to close this item. This is the collapsible behaviour." },
  { label: "Another item", content: "Opening this item automatically closes the previous one." },
];

// ── 3. Multiple open ─────────────────────────────────────────────────────────
const multipleOpen = ref<string[]>([]);
const multipleItems: AccordionItem[] = [
  { label: "Step 1 — Install", content: "npm install akaza-ui" },
  { label: "Step 2 — Import", content: "import { Accordion } from 'akaza-ui'" },
  { label: "Step 3 — Use", content: "Drop <Accordion :items=\"items\" /> into your template and you're done." },
];

// ── 4. Custom trigger + content slots ────────────────────────────────────────
const customItems: AccordionItem[] = [
  { value: "notifications", label: "Notifications", content: "Control how you receive notifications across all channels." },
  { value: "appearance", label: "Appearance", content: "Customise the look and feel of your workspace." },
  { value: "security", label: "Security", content: "Manage passwords, two-factor authentication, and active sessions." },
];

// ── 5. Per-item named slots ──────────────────────────────────────────────────
const slottedItems: AccordionItem[] = [
  {
    label: "Color Palette",
    slot: "colors",
    content: "Pick your brand colors",
  },
  {
    label: "Stats",
    slot: "stats",
    content: "Your usage this month",
  },
  {
    label: "Plain text",
    content: "This item has no custom slot — it falls back to the shared content slot.",
  },
];

// ── 6. Disabled ──────────────────────────────────────────────────────────────
const disabledItems: AccordionItem[] = [
  { label: "Available", content: "This item can be opened and closed normally." },
  { label: "Disabled item", content: "You will never see this.", disabled: true },
  { label: "Also available", content: "This one works fine too." },
];
const rootDisabled = ref(false);

// ── 7. ui prop ───────────────────────────────────────────────────────────────
const uiItems: AccordionItem[] = [
  { label: "Design tokens", content: "Override colours, spacing, and radius using CSS variables." },
  { label: "ui prop", content: "Pass class strings to item, trigger, icon, and content slots via the ui prop." },
  { label: "Scoped slots", content: "For full control, replace any slot with your own markup." },
];

// ── 8. unmountOnHide ─────────────────────────────────────────────────────────
const unmountOpen = ref("");
const unmountItems: AccordionItem[] = [
  {
    value: "lazy",
    label: "Lazy panel",
    content: "This panel is removed from the DOM when closed — great for resetting forms or lazy-loading heavy content.",
  },
  {
    value: "always",
    label: "Always-mounted panel",
    content: "This panel uses the default behaviour (unmountOnHide=false). It stays in the DOM hidden via CSS grid.",
  },
];

// ── 9. @value-change event details ──────────────────────────────────────────
const eventOpen = ref("");
const eventItems: AccordionItem[] = [
  { label: "First panel", content: "Open or close panels and watch the event log below." },
  { label: "Second panel", content: "Each change shows the new value and the reason." },
];
const accLog = ref<string[]>([]);
function onAccordionChange(value: string | string[], details: AkazaChangeEventDetails) {
  accLog.value = [`→ ${JSON.stringify(value)} — reason: ${details.reason}`, ...accLog.value].slice(0, 5);
}
</script>

<template>
  <section id="accordion">
    <h2 :class="sectionTitle">Accordion</h2>
    <p :class="sectionDescription">
      Collapsible sections with full keyboard navigation, per-item disabled state, named slots, and optional DOM unmounting.
    </p>

    <!-- ── 1. Zero-config ─────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Zero-config</span>
        <span class="text-xs text-muted-foreground">Items with <code :class="inlineCode">label</code> + <code :class="inlineCode">content</code> fields render without any slots.</span>
      </div>
      <div :class="canvas">
        <Accordion
          :items="autoItems"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
        />
      </div>
    </div>

    <!-- ── 2. Collapsible ─────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Collapsible (single)</span>
        <span class="text-xs text-muted-foreground">Click an open item's trigger again to collapse it. Uses <code :class="inlineCode">collapsible</code> prop.</span>
      </div>
      <div :class="canvas">
        <Accordion
          v-model="collapsibleOpen"
          :items="collapsibleItems"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
        />
      </div>
    </div>

    <!-- ── 3. Multiple ────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Multiple open</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">type="multiple"</code> lets any number of items be open simultaneously. Bind <code :class="inlineCode">v-model</code> as a <code :class="inlineCode">string[]</code>.
        </span>
      </div>
      <div :class="canvas">
        <Accordion
          v-model="multipleOpen"
          :items="multipleItems"
          type="multiple"
          :ui="accordionUi"
          :class="accordionRoot"
        >
          <template #trigger="{ item, isOpen }">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground transition-colors"
                :class="isOpen ? 'bg-primary text-primary-foreground' : ''"
              >
                {{ item.label?.split(' ')[0] }}
              </span>
              <span class="text-sm font-medium text-foreground">{{ item.label?.split('—')[1]?.trim() }}</span>
            </div>
          </template>
          <template #content="{ item }">
            <code :class="codePill">{{ item.content }}</code>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 4. Custom trigger + content slots ─────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Custom trigger + content slots</span>
        <span class="text-xs text-muted-foreground">
          Use <code :class="inlineCode">#trigger</code> and <code :class="inlineCode">#content</code> slots for full customisation. Both receive <code :class="inlineCode">{ item, value, isOpen }</code>.
        </span>
      </div>
      <div :class="canvas">
        <Accordion
          :items="customItems"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
        >
          <template #trigger="{ item, isOpen }">
            <div class="flex items-center gap-3">
              <span class="size-2 shrink-0 rounded-full bg-muted-foreground transition-colors" :class="isOpen ? 'bg-primary' : ''" />
              <span class="text-sm font-medium text-foreground">{{ item.label }}</span>
            </div>
          </template>
          <template #content="{ item }">
            <p class="mb-3 text-sm text-muted-foreground">{{ item.content }}</p>
            <button :class="buttonGhost">Configure →</button>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 5. Per-item named slots ────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Per-item named slots</span>
        <span class="text-xs text-muted-foreground">
          Set <code :class="inlineCode">slot: 'name'</code> on an item to use a dedicated slot for that item's body. Falls back to <code :class="inlineCode">#content</code>.
        </span>
      </div>
      <div :class="canvas">
        <Accordion
          :items="slottedItems"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
        >
          <!-- only the "colors" item gets this slot -->
          <template #colors="{ item }">
            <div class="flex flex-wrap gap-2">
              <span class="block size-7 rounded-md border border-border bg-primary" title="primary" />
              <span class="block size-7 rounded-md border border-border bg-destructive" title="destructive" />
              <span class="block size-7 rounded-md border border-border bg-muted" title="muted" />
              <span class="block size-7 rounded-md border border-border bg-background" title="background" />
              <span class="block size-7 rounded-md border border-border bg-accent" title="accent" />
              <p class="w-full text-xs text-muted-foreground mt-1">{{ item.content }}</p>
            </div>
          </template>

          <!-- only the "stats" item gets this slot -->
          <template #stats="{ item }">
            <div>
              <p class="mb-2 text-xs text-muted-foreground">{{ item.content }}</p>
              <div class="flex gap-4">
                <div class="flex flex-col gap-px"><span class="text-base font-bold text-foreground">1.2k</span><span class="text-[10px] uppercase tracking-wide text-muted-foreground">Requests</span></div>
                <div class="flex flex-col gap-px"><span class="text-base font-bold text-foreground">98%</span><span class="text-[10px] uppercase tracking-wide text-muted-foreground">Uptime</span></div>
                <div class="flex flex-col gap-px"><span class="text-base font-bold text-foreground">42ms</span><span class="text-[10px] uppercase tracking-wide text-muted-foreground">Avg latency</span></div>
              </div>
            </div>
          </template>

          <!-- fallback for items with no slot property -->
          <template #content="{ item }">
            <p class="text-sm text-muted-foreground">{{ item.content }}</p>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 6. Disabled ────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Disabled</span>
        <span class="text-xs text-muted-foreground">
          Set <code :class="inlineCode">disabled: true</code> on individual items, or pass the <code :class="inlineCode">disabled</code> prop to the root to disable all at once.
        </span>
      </div>
      <div :class="canvasCol">
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
            <input
              v-model="rootDisabled"
              type="checkbox"
              class="rounded border border-border"
            />
            Disable entire accordion
          </label>
        </div>
        <Accordion
          :items="disabledItems"
          :disabled="rootDisabled"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
        >
          <template #content="{ item }">
            <p class="text-sm text-muted-foreground">{{ item.content }}</p>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 7. ui prop ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">ui prop</span>
        <span class="text-xs text-muted-foreground">
          Pass extra classes to <code :class="inlineCode">item</code>, <code :class="inlineCode">trigger</code>, <code :class="inlineCode">icon</code>, and <code :class="inlineCode">content</code> parts without slots.
        </span>
      </div>
      <div :class="canvas">
        <Accordion
          :items="uiItems"
          collapsible
          :ui="accordionCustomUi"
          class="w-full max-w-sm"
        />
      </div>
    </div>

    <!-- ── 8. unmountOnHide ───────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">unmountOnHide</span>
        <span class="text-xs text-muted-foreground">
          When <code :class="inlineCode">unmount-on-hide</code> is set, closed panel content is removed from the DOM — useful for lazy-loading or resetting state on close.
        </span>
      </div>
      <div :class="canvas">
        <Accordion
          v-model="unmountOpen"
          :items="unmountItems"
          collapsible
          unmount-on-hide
          :ui="accordionUi"
          :class="accordionRoot"
        >
          <template #content="{ item, value }">
            <div>
              <p class="text-sm text-muted-foreground">{{ item.content }}</p>
              <p v-if="value === 'lazy'" class="text-xs text-muted-foreground mt-2 font-mono">
                Inspect the DOM — this node disappears when you close the panel.
              </p>
            </div>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 9. @value-change event details ─────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">@value-change event details</span>
        <span class="text-xs text-muted-foreground">
          Listen to <code :class="inlineCode">@value-change</code> to inspect <code :class="inlineCode">reason</code> and optionally
          call <code :class="inlineCode">details.cancel()</code> to prevent the change.
        </span>
      </div>
      <div :class="canvasCol">
        <Accordion
          v-model="eventOpen"
          :items="eventItems"
          collapsible
          :ui="accordionUi"
          :class="accordionRoot"
          @value-change="onAccordionChange"
        />
        <div v-if="accLog.length" :class="eventLog">
          <code v-for="(entry, i) in accLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
