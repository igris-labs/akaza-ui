<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { NavigationMenu, Sidebar } from "akaza-ui";
import { ref } from "vue";

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

const navigationUi = {
  root: "w-full",
  list: "grid gap-1",
  inlineList: "ml-4 grid gap-1 border-l border-neutral-200 pl-2 dark:border-neutral-800",
  trigger:
    "min-h-9 gap-2 rounded-md px-2 text-sm text-neutral-600 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-active]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:data-[akaza-active]:text-neutral-100",
  link: "min-h-9 gap-2 rounded-md px-2 text-sm text-neutral-600 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=active]:bg-neutral-200 data-[akaza-state=active]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:data-[akaza-state=active]:bg-neutral-900 dark:data-[akaza-state=active]:text-neutral-100",
  itemLabel: "min-w-0 flex-1 truncate",
  badge: "ml-auto rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] dark:bg-neutral-800",
  childIndicator: "ml-auto transition-transform data-[akaza-state=open]:rotate-90",
  groupLabel: "px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500",
  content: "z-[1100]",
  viewport:
    "min-w-44 rounded-md border border-neutral-300 bg-white p-1 text-neutral-900 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
  panel: "grid min-w-42 gap-1",
  contentList: "grid gap-1",
  contentItem: "min-w-0",
  contentLink:
    "flex min-h-9 w-full items-center rounded-md px-3 py-2 text-left text-sm text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=active]:bg-neutral-100 data-[akaza-state=active]:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-[akaza-state=active]:bg-neutral-800 dark:data-[akaza-state=active]:text-white",
  label: "truncate",
  tooltip:
    "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs shadow-md dark:border-neutral-800 dark:bg-neutral-900",
};
</script>

<template>
  <div
    class="flex h-80 w-full max-w-xl overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950"
  >
    <Sidebar
      v-model:collapsed="collapsed"
      :mobile="false"
      collapsible="icon"
      :collapsed-size="52"
      aria-label="Project navigation"
      :ui="{
        root: 'h-full',
        panel:
          'border-r border-neutral-300 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950',
        header:
          'flex h-12 items-center gap-2 border-b border-neutral-300 px-2 dark:border-neutral-800',
        body: 'p-2',
        footer: 'border-t border-neutral-300 p-2 dark:border-neutral-800',
      }"
    >
      <template #header="{ collapsed: isCollapsed, toggleCollapsed }">
        <span
          v-if="!isCollapsed"
          class="grid size-8 shrink-0 place-items-center rounded-md bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900"
        >
          A
        </span>
        <span v-if="!isCollapsed" class="min-w-0 flex-1 truncate text-sm font-semibold">Akaza</span>
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-md text-neutral-500 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-500 dark:hover:bg-neutral-800"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="() => toggleCollapsed()"
        >
          <UIcon
            :name="isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            class="size-4"
          />
        </button>
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
          :ui="navigationUi"
          aria-label="Projects"
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
      </template>

      <template #footer="{ collapsed: isCollapsed }">
        <span class="block truncate px-2 text-xs text-neutral-500">
          {{ isCollapsed ? "RV" : "rahul@example.com" }}
        </span>
      </template>
    </Sidebar>

    <div class="min-w-0 flex-1 p-5">
      <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{{ selected }}</p>
      <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Selected navigation value</p>
    </div>
  </div>
</template>
