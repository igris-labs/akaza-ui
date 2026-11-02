<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { NavigationMenu } from "../../ui/navigation-menu";

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
  <div class="w-full max-w-72 rounded-xl border border-border bg-background p-2">
    <NavigationMenu
      v-model="selected"
      v-model:expanded="expanded"
      orientation="vertical"
      :items="items"
      aria-label="Workspace"
    >
      <template #item-leading="{ item }">
        <Icon
          v-if="icons[item.value ?? item.label]"
          :name="icons[item.value ?? item.label] || 'lucide:circle'"
          class="size-4 shrink-0"
        />
      </template>
      <template #child-indicator>
        <Icon
          name="lucide:chevron-right"
          class="size-4"
        />
      </template>
    </NavigationMenu>
  </div>
</template>
