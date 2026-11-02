<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { Button } from "../../ui/button";
import { NavigationMenu } from "../../ui/navigation-menu";
import { Sidebar } from "../../ui/sidebar";

const collapsed = ref(false);
const selected = ref("akaza-ui");
const expanded = ref(["projects"]);

const items: NavigationMenuItem[] = [
  { label: "Workspace", value: "workspace-label", type: "label" },
  { label: "Overview", value: "overview" },
  { label: "Inbox", value: "inbox", badge: 8 },
  {
    label: "Projects",
    value: "projects",
    children: [
      { label: "Akaza UI", value: "akaza-ui" },
      { label: "Website", value: "website" },
    ],
  },
  { label: "Settings", value: "settings" },
];

const icons: Record<string, string> = {
  overview: "i-lucide-layout-dashboard",
  inbox: "i-lucide-inbox",
  projects: "i-lucide-folder",
  "akaza-ui": "i-lucide-snowflake",
  website: "i-lucide-globe",
  settings: "i-lucide-settings",
};
</script>

<template>
  <div
    class="flex h-80 w-full max-w-xl overflow-hidden rounded-lg border border-border bg-background"
  >
    <Sidebar
      v-model:collapsed="collapsed"
      :ui="{
        root: 'h-full',
        header: 'px-2',
        panel: 'data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l',
        mobileWrapper: 'h-full',
      }"
      :mobile="false"
      collapsible="icon"
      :collapsed-size="52"
      aria-label="Project navigation"
    >
      <template #header="{ collapsed: isCollapsed, toggleCollapsed }">
        <span
          v-if="!isCollapsed"
          class="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
        >
          A
        </span>
        <span
          v-if="!isCollapsed"
          class="min-w-0 flex-1 truncate text-sm font-semibold"
        >Akaza</span>
        <Button
          color="secondary"
          variant="ghost"
          size="sm"
          shape="icon"
          type="button"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="() => toggleCollapsed()"
        >
          <Icon
            :name="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
            class="size-4"
          />
        </Button>
      </template>

      <template #default="{ collapsed: isCollapsed }">
        <NavigationMenu
          v-model="selected"
          v-model:expanded="expanded"
          orientation="vertical"
          :collapsed="isCollapsed"
          :tooltip="isCollapsed"
          teleport="body"
          :items="items"
          aria-label="Projects"
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
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <span class="block truncate px-2 text-xs text-muted-foreground">
          {{ isCollapsed ? "RV" : "rahul@example.com" }}
        </span>
      </template>
    </Sidebar>

    <div class="min-w-0 flex-1 p-5">
      <p class="text-sm font-semibold text-foreground">{{ selected }}</p>
      <p class="mt-1 text-xs text-muted-foreground">Selected navigation value</p>
    </div>
  </div>
</template>
