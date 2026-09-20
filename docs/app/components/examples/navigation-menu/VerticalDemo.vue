<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { NavigationMenu } from "akaza-ui";
import { ref } from "vue";

const selected = ref("overview");
const expanded = ref(["workspace"]);
const items: NavigationMenuItem[] = [
  { label: "Workspace", value: "workspace-label", type: "label" },
  { label: "Overview", value: "overview" },
  { label: "Inbox", value: "inbox", badge: 8 },
  {
    label: "Workspace",
    value: "workspace",
    children: [
      { label: "Members", value: "members" },
      { label: "Billing", value: "billing" },
      {
        label: "Projects",
        value: "projects",
        children: [
          { label: "Akaza UI", value: "akaza-ui" },
          { label: "Website", value: "website" },
        ],
      },
    ],
  },
  { label: "Divider", value: "divider", type: "separator" },
  {
    label: "Settings",
    value: "settings",
    children: [
      { label: "Profile", value: "profile" },
      { label: "Security", value: "security" },
    ],
  },
];

const icons: Record<string, string> = {
  overview: "i-lucide-layout-dashboard",
  inbox: "i-lucide-inbox",
  workspace: "i-lucide-building-2",
  members: "i-lucide-users",
  billing: "i-lucide-credit-card",
  projects: "i-lucide-folder",
  "akaza-ui": "i-lucide-component",
  website: "i-lucide-globe",
  settings: "i-lucide-settings",
  profile: "i-lucide-user",
  security: "i-lucide-shield-check",
};
</script>

<template>
  <div class="w-full max-w-72 rounded-xl border border-neutral-300 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950">
    <NavigationMenu
      v-model="selected"
      v-model:expanded="expanded"
      orientation="vertical"
      :items="items"
      aria-label="Workspace"
      :ui="{
        root: 'w-full',
        list: 'grid gap-1',
        inlineList: 'ml-4 grid gap-1 border-l border-neutral-200 pl-2 dark:border-neutral-800',
        inlineItem: 'min-w-0',
        trigger: 'min-h-9 gap-2 rounded-lg px-2 text-left text-sm text-neutral-600 outline-none hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=open]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:data-[akaza-state=open]:text-neutral-100',
        link: 'min-h-9 gap-2 rounded-lg px-2 text-left text-sm text-neutral-600 outline-none hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=active]:bg-neutral-100 data-[akaza-state=active]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:data-[akaza-state=active]:bg-neutral-900 dark:data-[akaza-state=active]:text-neutral-100',
        itemLabel: 'min-w-0 flex-1 truncate',
        badge: 'ml-auto rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400',
        childIndicator: 'ml-auto text-xs transition-transform data-[akaza-state=open]:rotate-90',
        groupLabel: 'px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500',
        separator: 'my-2 border-t border-neutral-200 dark:border-neutral-800',
      }"
    >
      <template #item-leading="{ item }">
        <UIcon
          v-if="icons[item.value ?? item.label]"
          :name="icons[item.value ?? item.label]"
          class="size-4 shrink-0"
        />
      </template>
      <template #child-indicator>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
      </template>
    </NavigationMenu>
  </div>
</template>
