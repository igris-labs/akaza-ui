<script setup lang="ts">
import { ref, computed } from "vue";
import { Menu } from "akaza-ui";
import type { MenuItem, AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  canvasCol,
  canvasRow,
  codePill,
  eventEntry,
  eventLog as eventLogClass,
  inlineCode,
  menuUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

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
    <h2 :class="sectionTitle">Menu</h2>
    <p :class="sectionDescription">
      A dropdown menu with items-based API, keyboard navigation, typeahead,
      checkbox/radio items, submenus, and anchor positioning.
    </p>

    <!-- ── 1. Basic ────────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Basic</span>
        <span class="text-xs text-muted-foreground">
          Pass a flat <code :class="inlineCode">items</code> array. Items with <code :class="inlineCode">type: 'separator'</code> render dividers.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="basicItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Actions</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 2. Groups ───────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Groups (auto separators)</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">MenuItem[][]</code> to group items. Separators are inserted between groups automatically.
          Use <code :class="inlineCode">type: 'label'</code> for group headings.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="groupedItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Account</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 3. Disabled ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Disabled items</span>
        <span class="text-xs text-muted-foreground">
          Set <code :class="inlineCode">disabled: true</code> on items. They are skipped by keyboard navigation and
          get <code :class="inlineCode">data-akaza-disabled</code> + <code :class="inlineCode">aria-disabled</code>.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="disabledItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Edit</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 4. Checkbox items ───────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Checkbox items</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">type: 'checkbox'</code> with <code :class="inlineCode">checked</code> and <code :class="inlineCode">onUpdateChecked</code>.
          The menu stays open on toggle. Items get <code :class="inlineCode">role="menuitemcheckbox"</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <Menu :items="checkboxItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">View</button>
          </template>
          <template #checkbox-item="{ item, checked }">
            <span class="w-3.5 shrink-0 text-center text-xs text-primary">{{ checked ? '✓' : '' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
        <code :class="codePill">minimap: {{ showMinimap }}, sidebar: {{ showSidebar }}, lineNumbers: {{ showLineNumbers }}</code>
      </div>
    </div>

    <!-- ── 5. Radio items ──────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Radio items</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">type: 'radio'</code> with a shared <code :class="inlineCode">radioGroup</code> name.
          Bind state via <code :class="inlineCode">:radio-values</code> + <code :class="inlineCode">@update:radio-values</code>.
          Items get <code :class="inlineCode">role="menuitemradio"</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <Menu
          :items="radioItems"
          :radio-values="radioState"
          :ui="menuUi"
          @update:radio-values="radioState = $event"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Sort: {{ radioState.sort }}</button>
          </template>
          <template #radio-item="{ item, checked }">
            <span class="w-3.5 shrink-0 text-center text-xs text-primary">{{ checked ? '●' : '○' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
        <code :class="codePill">sort: {{ radioState.sort }}</code>
      </div>
    </div>

    <!-- ── 6. Submenus ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Submenus</span>
        <span class="text-xs text-muted-foreground">
          Add <code :class="inlineCode">children</code> to an item to create a submenu. Hover or press <code :class="inlineCode">ArrowRight</code> to open,
          <code :class="inlineCode">ArrowLeft</code> or <code :class="inlineCode">Escape</code> to close the sub-panel.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="submenuItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">File</button>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="ml-auto text-sm text-muted-foreground">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 6b. Deep nested submenus ────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Deep nested submenus (recursive)</span>
        <span class="text-xs text-muted-foreground">
          Submenus nest indefinitely — each level manages its own open state.
          Use <code :class="inlineCode">ArrowRight</code>/<code :class="inlineCode">ArrowLeft</code> to navigate in and out.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="deepItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Deep menu</button>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="ml-auto text-sm text-muted-foreground">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 7. Mixed (all features) ─────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Mixed (radio + checkbox + submenu)</span>
        <span class="text-xs text-muted-foreground">
          Groups, labels, radio items, checkbox items, and submenus all in one menu.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu
          :items="mixedItems"
          :radio-values="mixedRadio"
          :ui="menuUi"
          @update:radio-values="mixedRadio = $event"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">View</button>
          </template>
          <template #checkbox-item="{ item, checked }">
            <span class="w-3.5 shrink-0 text-center text-xs text-primary">{{ checked ? '✓' : '' }}</span>
            <span>{{ item.label }}</span>
          </template>
          <template #radio-item="{ item, checked }">
            <span class="w-3.5 shrink-0 text-center text-xs text-primary">{{ checked ? '●' : '○' }}</span>
            <span>{{ item.label }}</span>
          </template>
          <template #item="{ item, hasSubmenu }">
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="ml-auto text-sm text-muted-foreground">›</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 8. Positioning ──────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Anchor positioning</span>
        <span class="text-xs text-muted-foreground">
          Control placement with <code :class="inlineCode">side</code>, <code :class="inlineCode">align</code>, and <code :class="inlineCode">side-offset</code>.
        </span>
      </div>
      <div :class="[canvasRow, 'gap-4']">
        <Menu :items="posItems" side="bottom" align="start" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">bottom-start</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="bottom" align="end" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">bottom-end</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="top" align="start" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">top-start</button>
          </template>
        </Menu>
        <Menu :items="posItems" side="right" align="start" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">right-start</button>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 9. Custom #item slot ────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Custom #item slot</span>
        <span class="text-xs text-muted-foreground">
          Override item rendering with the <code :class="inlineCode">#item</code> scoped slot.
          Extra properties on the item object are passed through.
        </span>
      </div>
      <div :class="canvasRow">
        <Menu :items="slotItems" :ui="menuUi">
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Navigate</button>
          </template>
          <template #item="{ item }">
            <span class="w-4 shrink-0 text-center text-sm text-muted-foreground">{{ item.icon === 'grid' ? '⊞' : item.icon === 'chart' ? '◩' : '⚙' }}</span>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
      </div>
    </div>

    <!-- ── 10. @open-change + @select event details ────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">@open-change + @select event details</span>
        <span class="text-xs text-muted-foreground">
          Listen to <code :class="inlineCode">@open-change</code> and <code :class="inlineCode">@select</code> to inspect
          <code :class="inlineCode">reason</code> and optionally <code :class="inlineCode">cancel()</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <Menu
          :items="eventItems"
          :ui="menuUi"
          @open-change="onMenuChange"
          @select="onMenuSelect"
        >
          <template #trigger="{ toggle, triggerProps }">
            <button :class="buttonGhost" v-bind="triggerProps" @click="toggle">Edit</button>
          </template>
        </Menu>
        <div v-if="eventLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in eventLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
