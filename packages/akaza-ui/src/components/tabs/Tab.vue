<script setup lang="ts">
import { computed, inject } from 'vue'
import { TABS_CONTEXT_KEY } from './context'
import type { TabProps } from '.'

const { value, as = 'button', disabled = false } = defineProps<TabProps>()

const ctx = inject(TABS_CONTEXT_KEY)
if (ctx === undefined) throw new Error('Tab must be used inside Tabs')
const { activeTab, setTab } = ctx()

const isSelected = computed(() => activeTab.value === value)
const panelId = `akaza-tab-panel-${value}`
const tabId = `akaza-tab-${value}`

function activate() {
  if (!disabled) setTab(value)
}
</script>

<template>
  <component
    :is="as"
    :id="tabId"
    role="tab"
    :aria-selected="isSelected"
    :aria-controls="panelId"
    :aria-disabled="disabled || undefined"
    :tabindex="isSelected ? 0 : -1"
    :data-akaza-state="isSelected ? 'active' : 'inactive'"
    :data-akaza-value="value"
    :data-akaza-disabled="disabled ? '' : undefined"
    class="akaza-tab"
    @click="activate"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <slot />
  </component>
</template>
