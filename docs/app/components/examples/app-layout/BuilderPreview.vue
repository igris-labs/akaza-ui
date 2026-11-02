<script setup lang="ts">
import type {
  AppLayoutConfig,
  AppLayoutScroll,
  SidebarCollapsible,
  SidebarController,
} from "akaza-ui";
import { useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";
import { AppLayout } from "../../ui/app-layout";
import { Button } from "../../ui/button";
import { Sidebar } from "../../ui/sidebar";
import { regionColors } from "./region-colors";

withDefaults(
  defineProps<{
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
  }>(),
  { mobile: undefined },
);
const leftSize = defineModel<number>("leftSize", { required: true });
const rightSize = defineModel<number>("rightSize", { required: true });
const left = useSidebar(useTemplateRef<SidebarController>("leftSidebar"));
const right = useSidebar(useTemplateRef<SidebarController>("rightSidebar"));
</script>

<template>
  <div
    class="grid min-w-0 gap-3"
    data-layout-structure
  >
    <div
      v-if="showLeft || showRight"
      class="flex flex-wrap gap-2"
    >
      <Button
        v-if="showLeft"
        color="secondary"
        variant="outline"
        size="sm"
        type="button"
        :disabled="!left.isMobile.value && leftCollapsible === false"
        :aria-expanded="left.isMobile.value ? left.open.value : !left.collapsed.value"
        @click="left.toggle"
      >
        <span
          class="size-2 rounded-full"
          :class="regionColors.left.dot"
          aria-hidden="true"
        />
        Left sidebar
      </Button>
      <Button
        v-if="showRight"
        color="secondary"
        variant="outline"
        size="sm"
        type="button"
        :disabled="!right.isMobile.value && rightCollapsible === false"
        :aria-expanded="right.isMobile.value ? right.open.value : !right.collapsed.value"
        @click="right.toggle"
      >
        <span
          class="size-2 rounded-full"
          :class="regionColors.right.dot"
          aria-hidden="true"
        />
        Right sidebar
      </Button>
    </div>
    <div
      class="h-96 min-w-0 overflow-auto rounded-lg border border-border"
      style="--akaza-app-layout-viewport-height: 24rem"
      data-layout-frame
    >
      <AppLayout
        :ui="{
          root: 'min-h-96 text-sm',
          header: `justify-center ${regionColors.header.surface}`,
          main: `grid place-items-center px-2 text-sm ${regionColors.main.surface}`,
          footer: `flex items-center justify-center ${regionColors.footer.surface}`,
        }"
        :viewport="false"
        :layout="layout"
        :scroll="scroll"
        :sticky-header="stickyHeader"
        :sticky-footer="stickyFooter"
        :sticky-left="stickyLeft"
        :sticky-right="stickyRight"
        main-as="div"
        main-label="Main region preview"
      >
        <template
          v-if="showHeader"
          #header
        >
          <span data-layout-region="header">Header</span>
        </template>
        <template
          v-if="showLeft"
          #left
        >
          <Sidebar
            ref="leftSidebar"
            v-model:size="leftSize"
            :ui="{
              panel: `${regionColors.left.surface} data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l`,
              mobileContent: regionColors.left.surface,
              body: 'grid flex-1 place-items-center overflow-hidden px-1',
              header: 'hidden justify-end in-data-akaza-mobile:flex',
              mobileWrapper: 'h-full',
            }"
            :default-size="168"
            :min-size="128"
            :max-size="240"
            :collapsible="leftCollapsible"
            :mobile="mobile"
            resizable
            aria-label="Left sidebar preview"
          >
            <template #header="{ isMobile, closeMobile }">
              <Button
                v-if="isMobile"
                color="secondary"
                variant="outline"
                size="sm"
                type="button"
                @click="closeMobile"
              >
                Close
              </Button>
            </template>
            <template #default="{ collapsed }">
              <span
                class="text-center"
                data-layout-region="left"
              >{{ collapsed ? "L" : "Left sidebar" }}</span>
            </template>
          </Sidebar>
        </template>
        <span
          class="text-center"
          data-layout-region="main"
        >Main</span>
        <template
          v-if="showRight"
          #right
        >
          <Sidebar
            ref="rightSidebar"
            v-model:size="rightSize"
            :ui="{
              panel: `${regionColors.right.surface} data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l`,
              mobileContent: regionColors.right.surface,
              body: 'grid flex-1 place-items-center overflow-hidden px-1',
              header: 'hidden justify-end in-data-akaza-mobile:flex',
              mobileWrapper: 'h-full',
            }"
            side="right"
            :default-size="160"
            :min-size="128"
            :max-size="240"
            :collapsible="rightCollapsible"
            :mobile="mobile"
            resizable
            aria-label="Right sidebar preview"
          >
            <template #header="{ isMobile, closeMobile }">
              <Button
                v-if="isMobile"
                color="secondary"
                variant="outline"
                size="sm"
                type="button"
                @click="closeMobile"
              >
                Close
              </Button>
            </template>
            <template #default="{ collapsed }">
              <span
                class="text-center"
                data-layout-region="right"
              >{{ collapsed ? "R" : "Right sidebar" }}</span>
            </template>
          </Sidebar>
        </template>
        <template
          v-if="showFooter"
          #footer
        >
          <span data-layout-region="footer">Footer</span>
        </template>
      </AppLayout>
    </div>
  </div>
</template>
