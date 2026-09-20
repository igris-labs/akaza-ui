<script setup lang="ts">
import type { NavigationMenuItem, SidebarController } from "akaza-ui";
import { NavigationMenu, Sidebar, useSidebar } from "akaza-ui";
import { ref, useTemplateRef } from "vue";

const sidebarRef = useTemplateRef<SidebarController>("sidebar");
const size = ref(224);
const selected = ref("overview");
const { collapsed, isMobile, open, toggle } = useSidebar(sidebarRef);

const links: NavigationMenuItem[] = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Customers", value: "customers" },
  { label: "Settings", value: "settings" },
];

const icons: Record<string, string> = {
  overview: "i-lucide-layout-dashboard",
  orders: "i-lucide-package",
  customers: "i-lucide-users",
  settings: "i-lucide-settings",
};

const control = "grid size-8 shrink-0 place-items-center rounded-md border border-neutral-300 bg-white text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";
const ui = {
  root: "h-full",
  panel:
    "border-r border-neutral-300 bg-neutral-50 text-neutral-900 data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
  header: "flex h-12 items-center gap-2 border-b border-neutral-300 px-2 dark:border-neutral-800",
  body: "p-2",
  footer: "border-t border-neutral-300 p-2 dark:border-neutral-800",
  resizeHandle:
    "outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent hover:after:bg-neutral-400 focus-visible:after:bg-neutral-900 data-[akaza-resizing]:after:bg-neutral-900 dark:hover:after:bg-neutral-600 dark:focus-visible:after:bg-white dark:data-[akaza-resizing]:after:bg-white",
  mobileOverlay: "bg-black/45",
  mobileContent:
    "bg-neutral-50 text-neutral-900 shadow-xl ring-1 ring-neutral-300 dark:bg-neutral-950 dark:text-neutral-100 dark:ring-neutral-800",
  mobileWrapper: "h-full",
};
const navigationUi = {
  root: "w-full",
  list: "grid gap-1",
  item: "min-w-0",
  link: "min-h-9 gap-2 rounded-md px-2 text-left text-sm text-neutral-600 outline-none hover:bg-neutral-200 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=active]:bg-neutral-200 data-[akaza-state=active]:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:data-[akaza-state=active]:bg-neutral-900 dark:data-[akaza-state=active]:text-neutral-100",
  itemLabel: "min-w-0 flex-1 truncate",
  content: "z-[1100]",
  tooltip: "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
};
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950">
    <header class="flex h-12 items-center gap-3 border-b border-neutral-300 px-3 dark:border-neutral-800">
      <button
        type="button"
        :class="control"
        :aria-expanded="isMobile ? open : !collapsed"
        :aria-label="isMobile ? 'Open navigation' : collapsed ? 'Expand navigation' : 'Collapse navigation'"
        @click="toggle"
      >
        <UIcon :name="isMobile ? 'i-lucide-menu' : collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'" class="size-4" />
      </button>
      <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Workspace</span>
    </header>

    <div class="flex h-80 min-w-0">
      <Sidebar
        ref="sidebar"
        v-model:size="size"
        collapsible="icon"
        resizable
        :default-size="224"
        :min-size="176"
        :max-size="320"
        aria-label="Workspace navigation"
        :ui="ui"
      >
        <template #header="{ collapsed: isCollapsed, closeMobile }">
          <span class="grid size-7 shrink-0 place-items-center rounded-md bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">A</span>
          <span v-if="!isCollapsed" class="min-w-0 flex-1 truncate text-sm font-semibold">Akaza</span>
          <button v-if="isMobile" type="button" :class="control" aria-label="Close navigation" @click="closeMobile">
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </template>

        <template #default="{ collapsed: isCollapsed, closeMobile }">
          <NavigationMenu
            v-model="selected"
            orientation="vertical"
            :collapsed="isCollapsed"
            :tooltip="isCollapsed"
            teleport="body"
            :items="links"
            :ui="navigationUi"
            aria-label="Workspace"
            @select="() => isMobile && closeMobile()"
          >
            <template #item-leading="{ item }">
              <UIcon :name="icons[item.value ?? item.label]" class="size-4 shrink-0" />
            </template>
          </NavigationMenu>
        </template>

        <template #footer="{ collapsed: isCollapsed }">
          <div class="flex items-center gap-2 px-1">
            <span class="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-200 text-[10px] font-semibold dark:bg-neutral-800">RV</span>
            <span v-if="!isCollapsed" class="truncate text-xs text-neutral-500 dark:text-neutral-400">rahul@example.com</span>
          </div>
        </template>
      </Sidebar>

      <div class="min-w-0 flex-1 p-5">
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Dashboard</p>
        <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Resize the sidebar or reduce the preview width to see mobile modal behavior.
        </p>
        <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Selected: {{ selected }}</p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="h-20 rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900" />
          <div class="h-20 rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900" />
        </div>
      </div>
    </div>
  </div>
</template>
