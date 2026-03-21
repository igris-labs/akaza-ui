<script setup lang="ts">
import type { TabPanelProps } from ".";
import { computed, inject } from "vue";

import { TABS_CONTEXT_KEY } from "./context";
const { value, as = "div" } = defineProps<TabPanelProps>();

const ctx = inject(TABS_CONTEXT_KEY);
if (ctx === undefined) throw new Error("TabPanel must be used inside Tabs");
const { activeTab } = ctx();

const isActive = computed(() => activeTab.value === value);
const panelId = `akaza-tab-panel-${value}`;
const tabId = `akaza-tab-${value}`;
</script>

<template>
  <component
    :is="as"
    v-show="isActive"
    :id="panelId"
    role="tabpanel"
    :aria-labelledby="tabId"
    :tabindex="0"
    :data-akaza-state="isActive ? 'active' : 'inactive'"
    class="akaza-tab-panel"
  >
    <slot />
  </component>
</template>
