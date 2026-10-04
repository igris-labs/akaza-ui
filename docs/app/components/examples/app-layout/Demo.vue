<script setup lang="ts">
import type { AppLayoutConfig, AppLayoutScroll, SidebarCollapsible, SidebarController } from "akaza-ui";
import { AppLayout, NavigationMenu, Sidebar, useSidebar } from "akaza-ui";
import { ref, useTemplateRef } from "vue";

withDefaults(defineProps<{
  layout?: AppLayoutConfig;
  scroll?: AppLayoutScroll;
  showHeader?: boolean;
  showFooter?: boolean;
  showLeft?: boolean;
  showRight?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  collapsible?: SidebarCollapsible;
  mobile?: boolean | undefined;
}>(), {
  scroll: "content",
  showHeader: true,
  showFooter: true,
  showLeft: true,
  showRight: false,
  collapsible: "icon",
  mobile: undefined,
});
const leftSize = defineModel<number>("leftSize", { default: 168 });
const rightSize = defineModel<number>("rightSize", { default: 160 });
const left = useSidebar(useTemplateRef<SidebarController>("leftSidebar"));
const right = useSidebar(useTemplateRef<SidebarController>("rightSidebar"));
const selected = ref("projects");
const items = [
  { label: "Overview", value: "overview", iconName: "i-lucide-house" },
  { label: "Projects", value: "projects", iconName: "i-lucide-folder" },
  { label: "Settings", value: "settings", iconName: "i-lucide-settings" },
];
const projects = ["Website", "Customer portal", "API", "Documentation", "Mobile app", "Design system"];
const control = "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 border border-neutral-300 bg-white px-2 text-xs text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800";
const shellUi = {
  root: "bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100",
  header: "flex min-h-12 flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950",
  main: "p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-500",
  footer: "flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400",
  skipLink: "bg-white px-3 py-2 text-sm text-black ring-2 ring-neutral-500 dark:bg-neutral-900 dark:text-white",
};
const sidebarUi = {
  panel: "border-r border-neutral-200 bg-neutral-50 data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l dark:border-neutral-800 dark:bg-neutral-900",
  header: "flex min-h-12 items-center justify-between gap-2 border-b border-neutral-200 px-2 dark:border-neutral-800",
  body: "p-2",
  resizeHandle: "outline-none hover:bg-neutral-300/40 focus-visible:bg-neutral-300/40 dark:hover:bg-neutral-600/40 dark:focus-visible:bg-neutral-600/40",
  mobileOverlay: "bg-black/45",
  mobileContent: "bg-neutral-50 text-neutral-900 shadow-xl dark:bg-neutral-900 dark:text-neutral-100",
  mobileWrapper: "h-full",
};
const navigationUi = {
  list: "grid gap-1",
  link: "min-h-10 gap-2 px-2 text-sm text-neutral-600 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-500 data-[akaza-state=active]:bg-neutral-200 data-[akaza-state=active]:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:data-[akaza-state=active]:bg-neutral-800 dark:data-[akaza-state=active]:text-white",
  itemLabel: "min-w-0 flex-1 truncate",
  tooltip: "border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
};
</script>

<template>
  <div class="grid w-full min-w-0 gap-3" data-layout-demo>
    <div v-if="!showHeader && (showLeft || showRight)" class="flex flex-wrap gap-2">
      <button v-if="showLeft" type="button" :class="control" @click="left.toggle">Navigation</button>
      <button v-if="showRight" type="button" :class="control" @click="right.toggle">Inspector</button>
    </div>
    <div class="h-96 min-w-0 overflow-auto border border-neutral-300 dark:border-neutral-800" data-layout-frame>
      <AppLayout :viewport="false" :layout="layout" :scroll="scroll" :sticky-header="stickyHeader" :sticky-footer="stickyFooter" main-as="div" main-label="Workspace preview" :ui="shellUi">
        <template v-if="showHeader" #header>
          <button v-if="showLeft" type="button" :class="control" :aria-expanded="left.isMobile.value ? left.open.value : !left.collapsed.value" @click="left.toggle">
            <UIcon name="i-lucide-panel-left" class="size-4" aria-hidden="true" />Navigation
          </button>
          <span class="min-w-0 flex-1 text-sm font-semibold">Workspace</span>
          <button v-if="showRight" type="button" :class="control" :aria-expanded="right.isMobile.value ? right.open.value : !right.collapsed.value" @click="right.toggle">
            <UIcon name="i-lucide-panel-right" class="size-4" aria-hidden="true" />Inspector
          </button>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">Header</span>
        </template>
        <template v-if="showLeft" #left>
          <Sidebar ref="leftSidebar" v-model:size="leftSize" :default-size="168" :min-size="128" :max-size="240" :collapsible="collapsible" :mobile="mobile" resizable :ui="sidebarUi" aria-label="Workspace navigation">
            <template #header="{ collapsed, isMobile, closeMobile }">
              <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">{{ collapsed ? 'L' : 'Left · Navigation' }}</span>
              <button v-if="isMobile" type="button" :class="control" @click="closeMobile">Close</button>
            </template>
            <template #default="{ collapsed, isMobile, closeMobile }">
              <NavigationMenu v-model="selected" :items="items" orientation="vertical" :collapsed="collapsed" :tooltip="collapsed" :ui="navigationUi" aria-label="Workspace sections" @select="isMobile && closeMobile()">
                <template #item-leading="{ item }"><UIcon :name="item.iconName" class="size-4 shrink-0" aria-hidden="true" /></template>
              </NavigationMenu>
            </template>
          </Sidebar>
        </template>
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-base font-semibold">{{ items.find(item => item.value === selected)?.label }}</h3>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">Main · {{ scroll === 'content' ? 'Scroll here' : 'Scroll the preview' }}</span>
        </div>
        <template v-if="selected === 'projects'">
          <p class="mb-4 text-sm text-neutral-500 dark:text-neutral-400">Recent work across your team.</p>
          <ul class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <li v-for="(project, index) in projects" :key="project" class="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
              <span class="flex min-w-0 items-center gap-2"><UIcon name="i-lucide-folder" class="size-4 shrink-0 text-neutral-500" aria-hidden="true" />{{ project }}</span>
              <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ index < 3 ? 'In progress' : 'In review' }}</span>
            </li>
          </ul>
        </template>
        <div v-else-if="selected === 'overview'" class="grid gap-4 text-sm">
          <p>6 projects in this workspace. 3 are in progress and 3 are ready for review.</p>
          <p class="text-neutral-500 dark:text-neutral-400">Select Projects in the navigation to see the full list.</p>
        </div>
        <div v-else class="grid gap-4 text-sm">
          <p>Workspace: Acme</p>
          <p class="text-neutral-500 dark:text-neutral-400">Members can create projects. Administrators manage workspace access.</p>
        </div>
        <template v-if="showRight" #right>
          <Sidebar ref="rightSidebar" v-model:size="rightSize" side="right" :default-size="160" :min-size="128" :max-size="240" :collapsible="collapsible" :mobile="mobile" resizable :ui="sidebarUi" aria-label="Workspace inspector">
            <template #header="{ collapsed, isMobile, closeMobile }">
              <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">{{ collapsed ? 'R' : 'Right · Inspector' }}</span>
              <button v-if="isMobile" type="button" :class="control" @click="closeMobile">Close</button>
            </template>
            <template #default="{ collapsed }">
              <UIcon v-if="collapsed" name="i-lucide-info" class="mx-auto size-4" aria-label="Project details" />
              <dl v-else class="grid gap-4 p-2 text-xs">
                <div><dt class="text-neutral-500 dark:text-neutral-400">Workspace</dt><dd class="mt-1">Acme</dd></div>
                <div><dt class="text-neutral-500 dark:text-neutral-400">Members</dt><dd class="mt-1">12</dd></div>
                <div><dt class="text-neutral-500 dark:text-neutral-400">Access</dt><dd class="mt-1">Team only</dd></div>
              </dl>
            </template>
          </Sidebar>
        </template>
        <template v-if="showFooter" #footer><span>All changes saved</span><span>Footer</span></template>
      </AppLayout>
    </div>
  </div>
</template>
