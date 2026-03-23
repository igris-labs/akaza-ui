<script setup lang="ts">
import { ref, computed } from "vue";
import { Menu } from "akaza-ui";
import type { MenuItem, AkazaChangeEventDetails } from "akaza-ui";

// ── 1. Basic ────────────────────────────────────────────────────────────────
const basicItems: MenuItem[] = [
  { label: "Profile" },
  { label: "Settings" },
  { type: "separator" },
  { label: "Sign out" },
];

// ── 2. Groups (auto separators) ─────────────────────────────────────────────
const groupedItems: MenuItem[][] = [
  [
    { type: "label", label: "Account" },
    { label: "Profile" },
    { label: "Billing" },
  ],
  [
    { type: "label", label: "Team" },
    { label: "Members" },
    { label: "Invitations" },
  ],
  [{ label: "Sign out" }],
];

// ── 3. Disabled items ───────────────────────────────────────────────────────
const disabledItems: MenuItem[] = [
  { label: "Edit" },
  { label: "Duplicate" },
  { type: "separator" },
  { label: "Archive", disabled: true },
  { label: "Delete", disabled: true },
];

// ── 4. Checkbox items ───────────────────────────────────────────────────────
const showMinimap = ref(true);
const showSidebar = ref(false);
const showLineNumbers = ref(true);

const checkboxItems = computed<MenuItem[]>(() => [
  { type: "label", label: "View" },
  { type: "checkbox", label: "Minimap", checked: showMinimap.value, onUpdateChecked: (v) => (showMinimap.value = v) },
  { type: "checkbox", label: "Sidebar", checked: showSidebar.value, onUpdateChecked: (v) => (showSidebar.value = v) },
  { type: "checkbox", label: "Line numbers", checked: showLineNumbers.value, onUpdateChecked: (v) => (showLineNumbers.value = v) },
]);

// ── 5. Radio items ──────────────────────────────────────────────────────────
const radioState = ref<Record<string, string>>({ sort: "date" });

const radioItems: MenuItem[] = [
  { type: "label", label: "Sort by" },
  { type: "radio", label: "Date", value: "date", radioGroup: "sort" },
  { type: "radio", label: "Name", value: "name", radioGroup: "sort" },
  { type: "radio", label: "Size", value: "size", radioGroup: "sort" },
];

// ── 6. Submenus ─────────────────────────────────────────────────────────────
const submenuItems: MenuItem[] = [
  { label: "New file" },
  {
    label: "Share",
    children: [
      { label: "Email" },
      { label: "Copy link" },
      { label: "Slack" },
    ],
  },
  { type: "separator" },
  { label: "Delete" },
];

// ── 6b. Deep nesting ────────────────────────────────────────────────────────
const deepItems: MenuItem[] = [
  { label: "Level 1 — A" },
  {
    label: "Level 1 — B",
    children: [
      { label: "Level 2 — A" },
      {
        label: "Level 2 — B",
        children: [
          { label: "Level 3 — A" },
          { label: "Level 3 — B" },
          {
            label: "Level 3 — C",
            children: [
              { label: "Level 4 — A" },
              { label: "Level 4 — B" },
            ],
          },
        ],
      },
      { label: "Level 2 — C" },
    ],
  },
  { label: "Level 1 — C" },
];

// ── 7. Mixed (all features) ─────────────────────────────────────────────────
const wordWrap = ref(false);

const mixedItems = computed<MenuItem[][]>(() => [
  [
    { type: "label", label: "Sort by" },
    { type: "radio", label: "Date", value: "date", radioGroup: "sort-mix" },
    { type: "radio", label: "Name", value: "name", radioGroup: "sort-mix" },
  ],
  [
    { type: "label", label: "Editor" },
    { type: "checkbox", label: "Word wrap", checked: wordWrap.value, onUpdateChecked: (v) => (wordWrap.value = v) },
  ],
  [
    {
      label: "Export",
      children: [
        { label: "PDF" },
        { label: "CSV" },
      ],
    },
  ],
  [{ label: "Sign out" }],
]);
const mixedRadio = ref<Record<string, string>>({ "sort-mix": "date" });

// ── 8. Positioning ──────────────────────────────────────────────────────────
const posItems: MenuItem[] = [
  { label: "Item 1" },
  { label: "Item 2" },
  { label: "Item 3" },
];

// ── 9. Custom #item slot ────────────────────────────────────────────────────
const slotItems: MenuItem[] = [
  { label: "Dashboard", value: "dashboard", icon: "grid" },
  { label: "Reports", value: "reports", icon: "chart" },
  { type: "separator" },
  { label: "Settings", value: "settings", icon: "gear" },
];

// ── 10. @open-change + @select event details ────────────────────────────────
const eventItems: MenuItem[] = [
  { label: "Cut", value: "cut" },
  { label: "Copy", value: "copy" },
  { label: "Paste", value: "paste" },
];
const eventLog = ref<string[]>([]);
function onMenuChange(open: boolean, details: AkazaChangeEventDetails) {
  eventLog.value = [`${open ? "open" : "close"} — reason: ${details.reason}`, ...eventLog.value].slice(0, 6);
}
function onMenuSelect(item: MenuItem, details: AkazaChangeEventDetails) {
  eventLog.value = [`select: ${item.label} — reason: ${details.reason}`, ...eventLog.value].slice(0, 6);
}
</script>

<template>
  <section id="menu">
    <h2 class="text-lg font-semibold mb-1">Menu</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      A dropdown menu with items-based API, keyboard navigation, typeahead,
      checkbox/radio items, submenus, and anchor positioning.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Basic</span>
        <span class="mn-demo-label-desc">
          Pass a flat <code>items</code> array. Items with <code>type: 'separator'</code> render dividers.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="basicItems" :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Actions</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 2. Groups ───────────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Groups (auto separators)</span>
        <span class="mn-demo-label-desc">
          Pass <code>MenuItem[][]</code> to group items. Separators are inserted between groups automatically.
          Use <code>type: 'label'</code> for group headings.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="groupedItems" :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep', label: 'mn-label' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Account</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 3. Disabled ─────────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Disabled items</span>
        <span class="mn-demo-label-desc">
          Set <code>disabled: true</code> on items. They are skipped by keyboard navigation and
          get <code>data-akaza-disabled</code> + <code>aria-disabled</code>.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="disabledItems" :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Edit</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 4. Checkbox items ───────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Checkbox items</span>
        <span class="mn-demo-label-desc">
          <code>type: 'checkbox'</code> with <code>checked</code> and <code>onUpdateChecked</code>.
          The menu stays open on toggle. Items get <code>role="menuitemcheckbox"</code>.
        </span>
      </div>
      <div class="mn-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Menu :items="checkboxItems" :ui="{ content: 'mn-panel', item: 'mn-item', label: 'mn-label' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">View</button>
          </template>
          <template #checkbox-item="{ item, checked }">
            <span class="mn-check-icon">{{ checked ? '✓' : '' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
        <code class="mn-state">minimap: {{ showMinimap }}, sidebar: {{ showSidebar }}, lineNumbers: {{ showLineNumbers }}</code>
      </div>
    </div>

    <!-- ── 5. Radio items ──────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Radio items</span>
        <span class="mn-demo-label-desc">
          <code>type: 'radio'</code> with a shared <code>radioGroup</code> name.
          Bind state via <code>:radio-values</code> + <code>@update:radio-values</code>.
          Items get <code>role="menuitemradio"</code>.
        </span>
      </div>
      <div class="mn-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Menu
          :items="radioItems"
          :radio-values="radioState"
          :ui="{ content: 'mn-panel', item: 'mn-item', label: 'mn-label' }"
          @update:radio-values="radioState = $event"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Sort: {{ radioState.sort }}</button>
          </template>
          <template #radio-item="{ item, checked }">
            <span class="mn-check-icon">{{ checked ? '●' : '○' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
        <code class="mn-state">sort: {{ radioState.sort }}</code>
      </div>
    </div>

    <!-- ── 6. Submenus ─────────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Submenus</span>
        <span class="mn-demo-label-desc">
          Add <code>children</code> to an item to create a submenu. Hover or press <code>ArrowRight</code> to open,
          <code>ArrowLeft</code> or <code>Escape</code> to close the sub-panel.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="submenuItems" :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep', submenuContent: 'mn-panel mn-panel-sub' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">File</button>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="mn-submenu-arrow">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 6b. Deep nested submenus ────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Deep nested submenus (recursive)</span>
        <span class="mn-demo-label-desc">
          Submenus nest indefinitely — each level manages its own open state.
          Use <code>ArrowRight</code>/<code>ArrowLeft</code> to navigate in and out.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="deepItems" :ui="{ content: 'mn-panel', item: 'mn-item', submenuContent: 'mn-panel mn-panel-sub' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Deep menu</button>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="mn-submenu-arrow">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 7. Mixed (all features) ─────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Mixed (radio + checkbox + submenu)</span>
        <span class="mn-demo-label-desc">
          Groups, labels, radio items, checkbox items, and submenus all in one menu.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu
          :items="mixedItems"
          :radio-values="mixedRadio"
          :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep', label: 'mn-label', submenuContent: 'mn-panel mn-panel-sub' }"
          @update:radio-values="mixedRadio = $event"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">View</button>
          </template>
          <template #checkbox-item="{ item, checked }">
            <span class="mn-check-icon">{{ checked ? '✓' : '' }}</span>
            <span>{{ item.label }}</span>
          </template>
          <template #radio-item="{ item, checked }">
            <span class="mn-check-icon">{{ checked ? '●' : '○' }}</span>
            <span>{{ item.label }}</span>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="mn-submenu-arrow">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 8. Positioning ──────────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Anchor positioning</span>
        <span class="mn-demo-label-desc">
          Control placement with <code>side</code>, <code>align</code>, and <code>side-offset</code>.
        </span>
      </div>
      <div class="mn-demo-canvas" style="gap: 16px;">
        <Menu :items="posItems" side="bottom" align="start" :ui="{ content: 'mn-panel', item: 'mn-item' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn mn-btn-sm" v-bind="triggerProps" @click="toggle">bottom-start</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="bottom" align="end" :ui="{ content: 'mn-panel', item: 'mn-item' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn mn-btn-sm" v-bind="triggerProps" @click="toggle">bottom-end</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="top" align="start" :ui="{ content: 'mn-panel', item: 'mn-item' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn mn-btn-sm" v-bind="triggerProps" @click="toggle">top-start</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="right" align="start" :ui="{ content: 'mn-panel', item: 'mn-item' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn mn-btn-sm" v-bind="triggerProps" @click="toggle">right-start</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 9. Custom #item slot ────────────────────────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">Custom #item slot</span>
        <span class="mn-demo-label-desc">
          Override item rendering with the <code>#item</code> scoped slot.
          Extra properties on the item object are passed through.
        </span>
      </div>
      <div class="mn-demo-canvas">
        <Menu :items="slotItems" :ui="{ content: 'mn-panel', item: 'mn-item', separator: 'mn-sep' }">
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Navigate</button>
          </template>
          <template #item="{ item }">
            <span class="mn-icon">{{ item.icon === 'grid' ? '⊞' : item.icon === 'chart' ? '◩' : '⚙' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 10. @open-change + @select event details ────────────────────────── -->
    <div class="mn-demo-block">
      <div class="mn-demo-label">
        <span class="mn-demo-label-title">@open-change + @select event details</span>
        <span class="mn-demo-label-desc">
          Listen to <code>@open-change</code> and <code>@select</code> to inspect
          <code>reason</code> and optionally <code>cancel()</code>.
        </span>
      </div>
      <div class="mn-demo-canvas" style="flex-direction: column; align-items: flex-start; gap: 12px;">
        <Menu
          :items="eventItems"
          :ui="{ content: 'mn-panel', item: 'mn-item' }"
          @open-change="onMenuChange"
          @select="onMenuSelect"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button class="mn-btn" v-bind="triggerProps" @click="toggle">Edit</button>
          </template>
        </Menu>
        <div v-if="eventLog.length" class="mn-event-log">
          <code v-for="(entry, i) in eventLog" :key="i" class="mn-event-entry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Button ──────────────────────────────────────────────────────────────── */
.mn-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s;
}
.mn-btn:hover { background: color-mix(in oklch, var(--muted-foreground) 15%, transparent); }
.mn-btn-sm { padding: 4px 10px; font-size: 12px; }

/* ── Panel ───────────────────────────────────────────────────────────────── */
.mn-panel {
  min-width: 180px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
}
.mn-panel-sub {
  min-width: 160px;
}

/* ── Item ────────────────────────────────────────────────────────────────── */
.mn-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  background: transparent;
  border: none;
  color: inherit;
  outline: none;
}
.mn-item:hover,
.mn-item:focus,
.mn-item[data-akaza-highlighted] {
  background: var(--accent);
}
.mn-item[data-akaza-disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Separator ───────────────────────────────────────────────────────────── */
.mn-sep {
  height: 1px;
  background: var(--border);
  margin: 4px 2px;
}

/* ── Label ───────────────────────────────────────────────────────────────── */
.mn-label {
  padding: 6px 10px 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Checkbox / radio indicator ──────────────────────────────────────────── */
.mn-check-icon {
  width: 14px;
  text-align: center;
  font-size: 11px;
  flex-shrink: 0;
  color: var(--primary);
}

/* ── Submenu arrow ───────────────────────────────────────────────────────── */
.mn-submenu-arrow {
  margin-left: auto;
  font-size: 14px;
  color: var(--muted-foreground);
}

/* ── Icon (custom slot example) ──────────────────────────────────────────── */
.mn-icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
  flex-shrink: 0;
  color: var(--muted-foreground);
}

/* ── State badge ─────────────────────────────────────────────────────────── */
.mn-state {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

/* ── Event log ───────────────────────────────────────────────────────────── */
.mn-event-log {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mn-event-entry {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 4px;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.mn-demo-block { margin-bottom: 32px; }
.mn-demo-label { margin-bottom: 12px; }

.mn-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.mn-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.mn-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.mn-demo-canvas {
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
