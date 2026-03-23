<script setup lang="ts">
import { ref } from "vue";
import type { AccordionItem, AkazaChangeEventDetails } from "akaza-ui";
import { Accordion } from "akaza-ui";

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
    <h2 class="text-lg font-semibold mb-1">Accordion</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Collapsible sections with full keyboard navigation, per-item disabled state, named slots, and optional DOM unmounting.
    </p>

    <!-- ── 1. Zero-config ─────────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Zero-config</span>
        <span class="demo-label-desc">Items with <code>label</code> + <code>content</code> fields render without any slots.</span>
      </div>
      <div class="demo-canvas">
        <Accordion
          :items="autoItems"
          collapsible
          :ui="{ trigger: 'acc-trigger', content: 'acc-content-inner' }"
          class="acc-root"
        />
      </div>
    </div>

    <!-- ── 2. Collapsible ─────────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Collapsible (single)</span>
        <span class="demo-label-desc">Click an open item's trigger again to collapse it. Uses <code>collapsible</code> prop.</span>
      </div>
      <div class="demo-canvas">
        <Accordion
          v-model="collapsibleOpen"
          :items="collapsibleItems"
          collapsible
          :ui="{ trigger: 'acc-trigger', content: 'acc-content-inner' }"
          class="acc-root"
        />
      </div>
    </div>

    <!-- ── 3. Multiple ────────────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Multiple open</span>
        <span class="demo-label-desc">
          <code>type="multiple"</code> lets any number of items be open simultaneously. Bind <code>v-model</code> as a <code>string[]</code>.
        </span>
      </div>
      <div class="demo-canvas">
        <Accordion
          v-model="multipleOpen"
          :items="multipleItems"
          type="multiple"
          :ui="{ trigger: 'acc-trigger' }"
          class="acc-root"
        >
          <template #trigger="{ item, isOpen }">
            <div class="flex items-center gap-2">
              <span
                class="acc-step-badge"
                :class="isOpen ? 'acc-step-badge--active' : ''"
              >
                {{ item.label?.split(' ')[0] }}
              </span>
              <span class="text-sm font-medium text-foreground">{{ item.label?.split('—')[1]?.trim() }}</span>
            </div>
          </template>
          <template #content="{ item }">
            <div class="acc-content-inner">
              <code class="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">{{ item.content }}</code>
            </div>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 4. Custom trigger + content slots ─────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Custom trigger + content slots</span>
        <span class="demo-label-desc">
          Use <code>#trigger</code> and <code>#content</code> slots for full customisation. Both receive <code>{ item, value, isOpen }</code>.
        </span>
      </div>
      <div class="demo-canvas">
        <Accordion
          :items="customItems"
          collapsible
          :ui="{ trigger: 'acc-trigger acc-trigger--settings' }"
          class="acc-root"
        >
          <template #trigger="{ item, isOpen }">
            <div class="flex items-center gap-3">
              <span class="acc-settings-dot" :class="isOpen ? 'acc-settings-dot--active' : ''" />
              <span class="text-sm font-medium text-foreground">{{ item.label }}</span>
            </div>
          </template>
          <template #content="{ item }">
            <div class="acc-content-inner">
              <p class="text-sm text-muted-foreground mb-3">{{ item.content }}</p>
              <button class="acc-cta-btn">Configure →</button>
            </div>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 5. Per-item named slots ────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Per-item named slots</span>
        <span class="demo-label-desc">
          Set <code>slot: 'name'</code> on an item to use a dedicated slot for that item's body. Falls back to <code>#content</code>.
        </span>
      </div>
      <div class="demo-canvas">
        <Accordion
          :items="slottedItems"
          collapsible
          :ui="{ trigger: 'acc-trigger' }"
          class="acc-root"
        >
          <!-- only the "colors" item gets this slot -->
          <template #colors="{ item }">
            <div class="acc-content-inner flex gap-2 flex-wrap">
              <span
                v-for="color in ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']"
                :key="color"
                class="acc-swatch"
                :style="{ background: color }"
                :title="color"
              />
              <p class="w-full text-xs text-muted-foreground mt-1">{{ item.content }}</p>
            </div>
          </template>

          <!-- only the "stats" item gets this slot -->
          <template #stats="{ item }">
            <div class="acc-content-inner">
              <p class="text-xs text-muted-foreground mb-2">{{ item.content }}</p>
              <div class="flex gap-4">
                <div class="acc-stat"><span class="acc-stat-value">1.2k</span><span class="acc-stat-label">Requests</span></div>
                <div class="acc-stat"><span class="acc-stat-value">98%</span><span class="acc-stat-label">Uptime</span></div>
                <div class="acc-stat"><span class="acc-stat-value">42ms</span><span class="acc-stat-label">Avg latency</span></div>
              </div>
            </div>
          </template>

          <!-- fallback for items with no slot property -->
          <template #content="{ item }">
            <div class="acc-content-inner">
              <p class="text-sm text-muted-foreground">{{ item.content }}</p>
            </div>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 6. Disabled ────────────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">Disabled</span>
        <span class="demo-label-desc">
          Set <code>disabled: true</code> on individual items, or pass the <code>disabled</code> prop to the root to disable all at once.
        </span>
      </div>
      <div class="demo-canvas flex-col gap-4">
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
          :ui="{ trigger: 'acc-trigger' }"
          class="acc-root"
        >
          <template #content="{ item }">
            <div class="acc-content-inner">
              <p class="text-sm text-muted-foreground">{{ item.content }}</p>
            </div>
          </template>
        </Accordion>
      </div>
    </div>

    <!-- ── 7. ui prop ─────────────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">ui prop</span>
        <span class="demo-label-desc">
          Pass extra classes to <code>item</code>, <code>trigger</code>, <code>icon</code>, and <code>content</code> parts without slots.
        </span>
      </div>
      <div class="demo-canvas">
        <Accordion
          :items="uiItems"
          collapsible
          :ui="{
            item: 'acc-ui-item',
            trigger: 'acc-trigger acc-ui-trigger',
            icon: 'acc-ui-icon',
            content: 'acc-ui-content',
          }"
          class="w-full max-w-sm"
        />
      </div>
    </div>

    <!-- ── 8. unmountOnHide ───────────────────────────────────────────────── -->
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">unmountOnHide</span>
        <span class="demo-label-desc">
          When <code>unmount-on-hide</code> is set, closed panel content is removed from the DOM — useful for lazy-loading or resetting state on close.
        </span>
      </div>
      <div class="demo-canvas">
        <Accordion
          v-model="unmountOpen"
          :items="unmountItems"
          collapsible
          unmount-on-hide
          :ui="{ trigger: 'acc-trigger' }"
          class="acc-root"
        >
          <template #content="{ item, value }">
            <div class="acc-content-inner">
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
    <div class="demo-block">
      <div class="demo-label">
        <span class="demo-label-title">@value-change event details</span>
        <span class="demo-label-desc">
          Listen to <code>@value-change</code> to inspect <code>reason</code> and optionally
          call <code>details.cancel()</code> to prevent the change.
        </span>
      </div>
      <div class="demo-canvas" style="flex-direction: column; align-items: stretch; gap: 12px;">
        <Accordion
          v-model="eventOpen"
          :items="eventItems"
          collapsible
          :ui="{ trigger: 'acc-trigger', content: 'acc-content-inner' }"
          class="acc-root"
          @value-change="onAccordionChange"
        />
        <div v-if="accLog.length" class="acc-event-log">
          <code v-for="(entry, i) in accLog" :key="i" class="acc-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Shared accordion chrome ─────────────────────────────────────────────── */
.acc-root {
  width: 100%;
  max-width: 28rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--background);
}

.acc-root .akaza-accordion-item {
  border-bottom: 1px solid var(--border);
}

.acc-root .akaza-accordion-item:last-child {
  border-bottom: none;
}

.acc-trigger {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--foreground);
  transition: background 0.1s;
}

.acc-trigger:hover:not(:disabled):not([data-akaza-disabled]) {
  /* var(--muted) == canvas color in dark mode; use a lighter blend instead */
  background: color-mix(in oklch, var(--muted-foreground) 12%, var(--background));
}

.acc-trigger[data-akaza-state="open"] {
  background: color-mix(in oklch, var(--muted-foreground) 8%, var(--background));
}

.acc-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.acc-trigger:focus:not(:focus-visible) {
  outline: none;
}

.acc-root .akaza-accordion-icon {
  color: var(--muted-foreground);
}

.acc-content-inner {
  padding: 4px 16px 16px;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.demo-block {
  margin-bottom: 32px;
}

.demo-label {
  margin-bottom: 12px;
}

.demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: flex-start;
}

.demo-canvas.flex-col {
  flex-direction: column;
}

/* ── Example: multiple — step badges ─────────────────────────────────────── */
.acc-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--muted);
  color: var(--muted-foreground);
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.acc-step-badge--active {
  background: var(--primary);
  color: var(--primary-foreground);
}

/* ── Example: custom settings ────────────────────────────────────────────── */
.acc-trigger--settings {
  padding: 14px 16px;
}

.acc-settings-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted-foreground);
  flex-shrink: 0;
  transition: background 0.15s;
}

.acc-settings-dot--active {
  background: var(--primary);
}

.acc-cta-btn {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  background: none;
  border: 1px solid var(--primary);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.acc-cta-btn:hover {
  background: var(--primary);
  color: var(--primary-foreground);
}

/* ── Example: per-item slots — swatches ──────────────────────────────────── */
.acc-swatch {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
}

.acc-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.acc-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--foreground);
}

.acc-stat-label {
  font-size: 10px;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Example: ui prop ────────────────────────────────────────────────────── */
.acc-ui-item {
  border-radius: 6px;
  border: 1px solid var(--border);
  margin-bottom: 6px;
  overflow: hidden;
}

.acc-ui-trigger {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--foreground);
}

.acc-ui-trigger:hover:not(:disabled) {
  background: color-mix(in oklch, var(--muted-foreground) 12%, var(--background));
}

.acc-ui-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.acc-ui-trigger:focus:not(:focus-visible) {
  outline: none;
}

.acc-ui-icon {
  color: var(--primary);
}

.acc-ui-content {
  padding: 4px 14px 12px;
  font-size: 13px;
  color: var(--muted-foreground);
}

/* Event log */
.acc-event-log {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.acc-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
