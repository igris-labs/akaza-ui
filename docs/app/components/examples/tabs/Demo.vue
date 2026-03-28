<script setup lang="ts">
import { Tabs } from "akaza-ui";
import { ref } from "vue";

const tabs = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "notifications", label: "Notifications" },
];
const active = ref("account");
</script>

<template>
  <div class="w-full max-w-sm">
    <Tabs
      v-model="active"
      :items="tabs"
      :ui="{
        list: 'tabs-list',
        tab: 'tabs-tab',
        indicator: 'tabs-indicator',
        panels: 'tabs-panels',
        panel: 'tabs-panel',
      }"
    >
      <template #tab="{ item, isActive }">
        <span
          :class="
            isActive
              ? 'text-neutral-900 dark:text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          "
        >
          {{ item.label }}
        </span>
      </template>

      <template #panel-account>
        <div
          class="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Account settings</p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Manage your name, email, and profile picture.
          </p>
        </div>
      </template>

      <template #panel-security>
        <div
          class="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Security settings
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Change your password and enable two-factor authentication.
          </p>
        </div>
      </template>

      <template #panel-notifications>
        <div
          class="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Notification preferences
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Choose what you want to be notified about.
          </p>
        </div>
      </template>
    </Tabs>
  </div>
</template>

<style>
@reference "tailwindcss";

.tabs-list {
  @apply relative mb-4 flex border-b border-neutral-200 dark:border-neutral-800;
}

.tabs-tab {
  @apply cursor-pointer px-3 pb-3 pt-1 text-sm font-medium transition-colors;
}

.tabs-indicator {
  @apply absolute bottom-0 h-0.5 bg-neutral-900 transition-all duration-200 dark:bg-white;
}

.tabs-panels {
  @apply w-full;
}

.tabs-panel {
  @apply outline-none;
}
</style>
