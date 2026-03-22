<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "akaza-ui";

// 1. Basic
const basic = ref("overview");
const basicItems = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "settings", label: "Settings" },
];

// 2. Custom #tab slot (pill style)
const pill = ref("account");
const pillItems = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "billing", label: "Billing" },
  { value: "team", label: "Team" },
];

// 3. Vertical orientation
const vertical = ref("profile");
const verticalItems = [
  { value: "profile", label: "Profile" },
  { value: "notifications", label: "Notifications" },
  { value: "appearance", label: "Appearance" },
  { value: "advanced", label: "Advanced" },
];

// 4. Disabled tab
const withDisabled = ref("active");
const disabledItems = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived", disabled: true },
];

// 5. Manual activation
const manual = ref("html");
const manualItems = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
];

// 6. unmountOnHide — demonstrate with a counter inside a panel
const unmountTab = ref("a");
const unmountItems = [
  { value: "a", label: "Tab A" },
  { value: "b", label: "Tab B" },
];
const mountCount = ref(0);
function onPanelBMount() { mountCount.value++; }
</script>

<template>
  <section id="tabs">
    <h2 class="text-lg font-semibold mb-1">Tabs</h2>
    <p class="text-sm mb-6 text-muted-foreground">Tabbed navigation with keyboard support.</p>

    <div class="space-y-10">

      <!-- 1. Basic (underline indicator) -->
      <div>
        <h3 class="text-sm font-medium mb-3">Basic</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs v-model="basic" :items="basicItems" aria-label="Main navigation" :ui="{ list: 'tabs-underline-list', tab: 'tabs-underline-tab', panel: 'tabs-panel' }">
            <template #panel-overview>
              <p class="text-sm text-muted-foreground">Overview — a summary of your project's key metrics and recent activity.</p>
            </template>
            <template #panel-analytics>
              <p class="text-sm text-muted-foreground">Analytics — detailed charts and breakdowns of usage data.</p>
            </template>
            <template #panel-settings>
              <p class="text-sm text-muted-foreground">Settings — configure preferences, integrations, and access control.</p>
            </template>
          </Tabs>
        </div>
      </div>

      <!-- 2. Custom #tab slot (pill style, no indicator) -->
      <div>
        <h3 class="text-sm font-medium mb-3">Custom #tab slot — pill style</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs v-model="pill" :items="pillItems" aria-label="Account settings" :ui="{ list: 'tabs-pill-list', tab: 'tabs-pill-btn', panel: 'tabs-panel' }">
            <template #tab="{ item, isActive }">
              <span class="tabs-pill" :class="isActive ? 'tabs-pill--active' : ''">
                {{ item.label }}
              </span>
            </template>
            <template #panel-account><p class="text-sm text-muted-foreground">Manage your account details and preferences.</p></template>
            <template #panel-security><p class="text-sm text-muted-foreground">Update password and two-factor authentication settings.</p></template>
            <template #panel-billing><p class="text-sm text-muted-foreground">View invoices and manage your subscription plan.</p></template>
            <template #panel-team><p class="text-sm text-muted-foreground">Invite members and manage team roles.</p></template>
          </Tabs>
        </div>
      </div>

      <!-- 3. Vertical orientation -->
      <div>
        <h3 class="text-sm font-medium mb-3">Vertical orientation</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs
            v-model="vertical"
            :items="verticalItems"
            orientation="vertical"
            aria-label="Settings sections"
            :ui="{ root: 'tabs-vertical-root', list: 'tabs-vertical-list', tab: 'tabs-vertical-tab', panel: 'tabs-panel tabs-panel--vertical' }"
          >
            <template #panel-profile><p class="text-sm text-muted-foreground">Update your display name, avatar, and bio.</p></template>
            <template #panel-notifications><p class="text-sm text-muted-foreground">Choose which events trigger email or push notifications.</p></template>
            <template #panel-appearance><p class="text-sm text-muted-foreground">Pick a theme and adjust interface density.</p></template>
            <template #panel-advanced><p class="text-sm text-muted-foreground">Developer options and experimental features.</p></template>
          </Tabs>
        </div>
      </div>

      <!-- 4. Disabled tab -->
      <div>
        <h3 class="text-sm font-medium mb-3">Disabled tab</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs v-model="withDisabled" :items="disabledItems" aria-label="Status filter" :ui="{ list: 'tabs-underline-list', tab: 'tabs-underline-tab', panel: 'tabs-panel' }">
            <template #panel-active><p class="text-sm text-muted-foreground">Showing active items.</p></template>
            <template #panel-paused><p class="text-sm text-muted-foreground">Showing paused items.</p></template>
            <template #panel-archived><p class="text-sm text-muted-foreground">Archived items.</p></template>
          </Tabs>
          <p class="text-xs text-muted-foreground mt-3">
            "Archived" is disabled — arrow keys skip it.
          </p>
        </div>
      </div>

      <!-- 5. Manual activation -->
      <div>
        <h3 class="text-sm font-medium mb-3">Manual activation mode</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs
            v-model="manual"
            :items="manualItems"
            activation-mode="manual"
            aria-label="Code language"
            :ui="{ list: 'tabs-underline-list', tab: 'tabs-underline-tab', panel: 'tabs-panel' }"
          >
            <template #panel-html><p class="text-sm text-muted-foreground font-mono">Arrow keys move focus without switching tabs. Press Space or Enter to activate.</p></template>
            <template #panel-css><p class="text-sm text-muted-foreground font-mono">CSS panel content.</p></template>
            <template #panel-js><p class="text-sm text-muted-foreground font-mono">JavaScript panel content.</p></template>
          </Tabs>
          <p class="text-xs text-muted-foreground mt-3">Arrow keys navigate without activating. Space / Enter activates the focused tab.</p>
        </div>
      </div>

      <!-- 6. unmountOnHide -->
      <div>
        <h3 class="text-sm font-medium mb-3">unmountOnHide</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <Tabs v-model="unmountTab" :items="unmountItems" :unmount-on-hide="true" aria-label="Mount demo" :ui="{ list: 'tabs-underline-list', tab: 'tabs-underline-tab', panel: 'tabs-panel' }">
            <template #panel-a>
              <p class="text-sm text-muted-foreground">Tab A — always here.</p>
            </template>
            <template #panel-b="{ isActive }">
              <div v-if="isActive" @vue:mounted="onPanelBMount">
                <p class="text-sm text-muted-foreground">Tab B mounted <span class="font-semibold text-foreground">{{ mountCount }}</span> time(s).</p>
              </div>
            </template>
          </Tabs>
          <p class="text-xs text-muted-foreground mt-3">
            With <code>unmountOnHide</code>, Tab B is removed from the DOM when inactive. Switch away and back to see the mount counter increment.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<style>
/* ── Underline style ───────────────────────────────────────────── */
.tabs-underline-list {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  --akaza-tab-indicator-color: var(--primary);
}

.tabs-underline-tab {
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted-foreground);
  background: none;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: color 0.15s;
  font-family: inherit;
  line-height: inherit;
}
.tabs-underline-tab:hover:not([disabled]) {
  color: var(--foreground);
}
.tabs-underline-tab[data-akaza-state="active"] {
  color: var(--foreground);
}
.tabs-underline-tab[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}
.tabs-underline-tab:focus-visible {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: -2px;
  border-radius: 4px;
}

/* ── Pill style ────────────────────────────────────────────────── */
.tabs-pill-list {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--muted);
  border-radius: 8px;
  margin-bottom: 16px;
}

/* Pill indicator becomes the sliding background pill */
.tabs-pill-list .akaza-tab-indicator {
  display: block;
  top: 4px !important;
  bottom: 4px !important;
  height: auto !important;
  border-radius: 6px;
  background: var(--background);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 0;
}

/* Button reset for pill tabs — rendered above indicator */
.tabs-pill-btn {
  all: unset;
  cursor: pointer;
  position: relative;
  z-index: 1;
}
.tabs-pill-btn:focus-visible .tabs-pill {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: 2px;
  border-radius: 6px;
}

.tabs-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted-foreground);
  transition: color 0.15s;
}
.tabs-pill:hover {
  color: var(--foreground);
}
.tabs-pill--active {
  color: var(--foreground);
}

/* ── Vertical ──────────────────────────────────────────────────── */
.tabs-vertical-root {
  display: flex;
  gap: 24px;
}

.tabs-vertical-list {
  display: flex;
  flex-direction: column;
  width: 148px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  --akaza-tab-indicator-color: var(--primary);
}

.tabs-vertical-tab {
  padding: 8px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: left;
  color: var(--muted-foreground);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  font-family: inherit;
  line-height: inherit;
}
.tabs-vertical-tab:hover:not([disabled]) {
  color: var(--foreground);
}
.tabs-vertical-tab[data-akaza-state="active"] {
  color: var(--foreground);
}
.tabs-vertical-tab:focus-visible {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: -2px;
  border-radius: 4px;
}

/* ── Panels ────────────────────────────────────────────────────── */
.tabs-panel {
  display: block;
}

.tabs-panel--vertical {
  flex: 1;
  padding-top: 4px;
}
</style>
