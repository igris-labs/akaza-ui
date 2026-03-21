import type { Component } from 'vue'

export { default as Tabs } from './Tabs.vue'
export { default as TabList } from './TabList.vue'
export { default as Tab } from './Tab.vue'
export { default as TabPanels } from './TabPanels.vue'
export { default as TabPanel } from './TabPanel.vue'
export { TABS_CONTEXT_KEY } from './context'
export type { TabsContextState, TabsContextFactory } from './context'

export interface TabsProps {
  as?: string
  orientation?: 'horizontal' | 'vertical'
}

export interface TabListProps {
  as?: string
}

export interface TabProps {
  value: string
  as?: string | Component
  disabled?: boolean
}

export interface TabPanelsProps {
  as?: string
}

export interface TabPanelProps {
  value: string
  as?: string
}
