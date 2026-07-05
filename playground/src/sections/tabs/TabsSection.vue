<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "akaza-ui";
import {
  canvas,
  exampleStack,
  exampleTitle,
  inlineCode,
  sectionDescriptionTight,
  sectionTitle,
  tabsPillUi,
  tabsUi,
  tabsVerticalUi,
} from "../styles";

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
    <h2 :class="sectionTitle">Tabs</h2>
    <p :class="sectionDescriptionTight">Tabbed navigation with keyboard support.</p>

    <div :class="exampleStack">

      <!-- 1. Basic (underline indicator) -->
      <div>
        <h3 :class="exampleTitle">Basic</h3>
        <div :class="canvas">
          <Tabs v-model="basic" :items="basicItems" aria-label="Main navigation" :ui="tabsUi">
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
        <h3 :class="exampleTitle">Custom #tab slot — pill style</h3>
        <div :class="canvas">
          <Tabs v-model="pill" :items="pillItems" aria-label="Account settings" :ui="tabsPillUi">
            <template #tab="{ item, isActive }">
              <span
                class="inline-flex rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                :class="isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'"
              >
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
        <h3 :class="exampleTitle">Vertical orientation</h3>
        <div :class="canvas">
          <Tabs
            v-model="vertical"
            :items="verticalItems"
            orientation="vertical"
            aria-label="Settings sections"
            :ui="tabsVerticalUi"
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
        <h3 :class="exampleTitle">Disabled tab</h3>
        <div :class="canvas">
          <Tabs v-model="withDisabled" :items="disabledItems" aria-label="Status filter" :ui="tabsUi">
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
        <h3 :class="exampleTitle">Manual activation mode</h3>
        <div :class="canvas">
          <Tabs
            v-model="manual"
            :items="manualItems"
            activation-mode="manual"
            aria-label="Code language"
            :ui="tabsUi"
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
        <h3 :class="exampleTitle">unmountOnHide</h3>
        <div :class="canvas">
          <Tabs v-model="unmountTab" :items="unmountItems" :unmount-on-hide="true" aria-label="Mount demo" :ui="tabsUi">
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
            With <code :class="inlineCode">unmountOnHide</code>, Tab B is removed from the DOM when inactive. Switch away and back to see the mount counter increment.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>
