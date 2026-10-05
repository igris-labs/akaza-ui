<script setup lang="ts">
import type { AppLayoutConfig, AppLayoutScroll, SidebarCollapsible, SidebarController } from "akaza-ui";
import { AppLayout, Sidebar, useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";

withDefaults(defineProps<{
  layout: AppLayoutConfig;
  scroll: AppLayoutScroll;
  showHeader: boolean;
  showFooter: boolean;
  showLeft: boolean;
  showRight: boolean;
  stickyHeader: boolean;
  stickyFooter: boolean;
  leftCollapsible: SidebarCollapsible;
  rightCollapsible: SidebarCollapsible;
  stickyLeft: boolean;
  stickyRight: boolean;
  mobile?: boolean;
}>(), { mobile: undefined });
const leftSize = defineModel<number>("leftSize", { required: true });
const rightSize = defineModel<number>("rightSize", { required: true });
const left = useSidebar(useTemplateRef<SidebarController>("leftSidebar"));
const right = useSidebar(useTemplateRef<SidebarController>("rightSidebar"));
const button = "inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 bg-white px-3 text-xs text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800";
const leftColor = "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100";
const rightColor = "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100";
const shellUi = {
  root: "min-h-96 bg-white text-sm dark:bg-neutral-950",
  header: "flex min-h-14 items-center justify-center border-b border-sky-300 bg-sky-100 px-2 text-sky-950 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
  main: "grid place-items-center bg-indigo-50 px-2 text-indigo-950 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:bg-indigo-950 dark:text-indigo-100",
  footer: "flex min-h-12 items-center justify-center border-t border-rose-300 bg-rose-100 px-2 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100",
  skipLink: "bg-white px-3 py-2 text-black ring-2 ring-neutral-500 dark:bg-neutral-900 dark:text-white",
};
const sideUi = {
  body: "grid flex-1 place-items-center overflow-hidden px-1",
  header: "flex justify-end",
  resizeHandle: "outline-none hover:bg-black/10 focus-visible:bg-black/10 dark:hover:bg-white/20 dark:focus-visible:bg-white/20",
  mobileOverlay: "bg-black/45",
  mobileWrapper: "h-full",
};
</script>

<template>
  <div class="grid min-w-0 gap-3" data-layout-structure>
    <div v-if="showLeft || showRight" class="flex flex-wrap gap-2">
      <button v-if="showLeft" type="button" :class="button" :disabled="!left.isMobile.value && leftCollapsible === false" :aria-expanded="left.isMobile.value ? left.open.value : !left.collapsed.value" @click="left.toggle"><span class="size-2 bg-emerald-500" aria-hidden="true" />Left sidebar</button>
      <button v-if="showRight" type="button" :class="button" :disabled="!right.isMobile.value && rightCollapsible === false" :aria-expanded="right.isMobile.value ? right.open.value : !right.collapsed.value" @click="right.toggle"><span class="size-2 bg-amber-500" aria-hidden="true" />Right sidebar</button>
    </div>
    <div class="h-96 min-w-0 overflow-auto border border-neutral-300 dark:border-neutral-700" style="--akaza-app-layout-viewport-height: 24rem" data-layout-frame>
      <AppLayout :viewport="false" :layout="layout" :scroll="scroll" :sticky-header="stickyHeader" :sticky-footer="stickyFooter" :sticky-left="stickyLeft" :sticky-right="stickyRight" main-as="div" main-label="Main region preview" :ui="shellUi">
        <template v-if="showHeader" #header><span data-layout-region="header">Header</span></template>
        <template v-if="showLeft" #left>
          <Sidebar ref="leftSidebar" v-model:size="leftSize" :default-size="168" :min-size="128" :max-size="240" :collapsible="leftCollapsible" :mobile="mobile" resizable :ui="{ ...sideUi, panel: leftColor, mobileContent: leftColor }" aria-label="Left sidebar preview">
            <template #header="{ isMobile, closeMobile }"><button v-if="isMobile" type="button" :class="button" @click="closeMobile">Close</button></template>
            <template #default="{ collapsed }"><span class="text-center" data-layout-region="left">{{ collapsed ? 'L' : 'Left sidebar' }}</span></template>
          </Sidebar>
        </template>
        <span class="text-center" data-layout-region="main">Main</span>
        <template v-if="showRight" #right>
          <Sidebar ref="rightSidebar" v-model:size="rightSize" side="right" :default-size="160" :min-size="128" :max-size="240" :collapsible="rightCollapsible" :mobile="mobile" resizable :ui="{ ...sideUi, panel: rightColor, mobileContent: rightColor }" aria-label="Right sidebar preview">
            <template #header="{ isMobile, closeMobile }"><button v-if="isMobile" type="button" :class="button" @click="closeMobile">Close</button></template>
            <template #default="{ collapsed }"><span class="text-center" data-layout-region="right">{{ collapsed ? 'R' : 'Right sidebar' }}</span></template>
          </Sidebar>
        </template>
        <template v-if="showFooter" #footer><span data-layout-region="footer">Footer</span></template>
      </AppLayout>
    </div>
  </div>
</template>
