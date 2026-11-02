<script setup lang="ts">
import type {
  AppLayoutConfig,
  AppLayoutScroll,
  SidebarCollapsible,
  SidebarController,
} from "akaza-ui";
import { useSidebar } from "akaza-ui";
import { ref, useTemplateRef } from "vue";
import { AppLayout } from "../../ui/app-layout";
import { Button } from "../../ui/button";
import { NavigationMenu } from "../../ui/navigation-menu";
import { Sidebar } from "../../ui/sidebar";

withDefaults(
  defineProps<{
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
  }>(),
  {
    scroll: "content",
    showHeader: true,
    showFooter: true,
    showLeft: true,
    showRight: false,
    collapsible: "icon",
    mobile: undefined,
  },
);
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
const projects = [
  "Website",
  "Customer portal",
  "API",
  "Documentation",
  "Mobile app",
  "Design system",
];
</script>

<template>
  <div
    class="grid w-full min-w-0 gap-3"
    data-layout-demo
  >
    <div
      v-if="!showHeader && (showLeft || showRight)"
      class="flex flex-wrap gap-2"
    >
      <Button
        v-if="showLeft"
        color="secondary"
        variant="outline"
        size="sm"
        type="button"
        @click="left.toggle"
      >
        Navigation
      </Button>
      <Button
        v-if="showRight"
        color="secondary"
        variant="outline"
        size="sm"
        type="button"
        @click="right.toggle"
      >
        Inspector
      </Button>
    </div>
    <div
      class="h-96 min-w-0 overflow-auto border border-border"
      data-layout-frame
    >
      <AppLayout
        :ui="{
          header: 'flex-wrap gap-2',
          main: 'p-4',
          footer: 'flex flex-wrap items-center justify-between gap-2',
        }"
        :viewport="false"
        :layout="layout"
        :scroll="scroll"
        :sticky-header="stickyHeader"
        :sticky-footer="stickyFooter"
        main-as="div"
        main-label="Workspace preview"
      >
        <template
          v-if="showHeader"
          #header
        >
          <Button
            v-if="showLeft"
            color="secondary"
            variant="outline"
            size="sm"
            type="button"
            :aria-expanded="left.isMobile.value ? left.open.value : !left.collapsed.value"
            @click="left.toggle"
          >
            <Icon
              name="lucide:panel-left"
              class="size-4"
              aria-hidden="true"
            />Navigation
          </Button>
          <span class="min-w-0 flex-1 text-sm font-semibold">Workspace</span>
          <Button
            v-if="showRight"
            color="secondary"
            variant="outline"
            size="sm"
            type="button"
            :aria-expanded="right.isMobile.value ? right.open.value : !right.collapsed.value"
            @click="right.toggle"
          >
            <Icon
              name="lucide:panel-right"
              class="size-4"
              aria-hidden="true"
            />Inspector
          </Button>
          <span class="text-xs text-muted-foreground">Header</span>
        </template>
        <template
          v-if="showLeft"
          #left
        >
          <Sidebar
            ref="leftSidebar"
            v-model:size="leftSize"
            :ui="{
              root: 'h-full',
              header: 'px-2',
              panel: 'data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l',
              mobileWrapper: 'h-full',
            }"
            :default-size="168"
            :min-size="128"
            :max-size="240"
            :collapsible="collapsible"
            :mobile="mobile"
            resizable
            aria-label="Workspace navigation"
          >
            <template #header="{ collapsed, isMobile, closeMobile }">
              <span class="text-xs font-medium text-muted-foreground">{{
                collapsed ? "L" : "Left · Navigation"
              }}</span>
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
            <template #default="{ collapsed, isMobile, closeMobile }">
              <NavigationMenu
                v-model="selected"
                :items="items"
                orientation="vertical"
                :collapsed="collapsed"
                :tooltip="collapsed"
                aria-label="Workspace sections"
                @select="isMobile && closeMobile()"
              >
                <template #item-leading="{ item }">
                  <Icon
                    :name="String(item.iconName || 'lucide:circle')"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                </template>
              </NavigationMenu>
            </template>
          </Sidebar>
        </template>
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-base font-semibold">
            {{ items.find((item) => item.value === selected)?.label }}
          </h3>
          <span class="text-xs text-muted-foreground">Main · {{ scroll === "content" ? "Scroll here" : "Scroll the preview" }}</span>
        </div>
        <template v-if="selected === 'projects'">
          <p class="mb-4 text-sm text-muted-foreground">Recent work across your team.</p>
          <ul class="divide-y divide-border">
            <li
              v-for="(project, index) in projects"
              :key="project"
              class="flex flex-wrap items-center justify-between gap-2 py-4 text-sm"
            >
              <span class="flex min-w-0 items-center gap-2"><Icon
                name="lucide:folder"
                class="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />{{ project }}</span>
              <span class="text-xs text-muted-foreground">{{
                index < 3 ? "In progress" : "In review"
              }}</span>
            </li>
          </ul>
        </template>
        <div
          v-else-if="selected === 'overview'"
          class="grid gap-4 text-sm"
        >
          <p>6 projects in this workspace. 3 are in progress and 3 are ready for review.</p>
          <p class="text-muted-foreground">
            Select Projects in the navigation to see the full list.
          </p>
        </div>
        <div
          v-else
          class="grid gap-4 text-sm"
        >
          <p>Workspace: Acme</p>
          <p class="text-muted-foreground">
            Members can create projects. Administrators manage workspace access.
          </p>
        </div>
        <template
          v-if="showRight"
          #right
        >
          <Sidebar
            ref="rightSidebar"
            v-model:size="rightSize"
            :ui="{
              root: 'h-full',
              header: 'px-2',
              panel: 'data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l',
              mobileWrapper: 'h-full',
            }"
            side="right"
            :default-size="160"
            :min-size="128"
            :max-size="240"
            :collapsible="collapsible"
            :mobile="mobile"
            resizable
            aria-label="Workspace inspector"
          >
            <template #header="{ collapsed, isMobile, closeMobile }">
              <span class="text-xs font-medium text-muted-foreground">{{
                collapsed ? "R" : "Right · Inspector"
              }}</span>
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
              <Icon
                v-if="collapsed"
                name="lucide:info"
                class="mx-auto size-4"
                aria-label="Project details"
              />
              <dl
                v-else
                class="grid gap-4 p-2 text-xs"
              >
                <div>
                  <dt class="text-muted-foreground">Workspace</dt>
                  <dd class="mt-1">Acme</dd>
                </div>
                <div>
                  <dt class="text-muted-foreground">Members</dt>
                  <dd class="mt-1">12</dd>
                </div>
                <div>
                  <dt class="text-muted-foreground">Access</dt>
                  <dd class="mt-1">Team only</dd>
                </div>
              </dl>
            </template>
          </Sidebar>
        </template>
        <template
          v-if="showFooter"
          #footer
        >
          <span>All changes saved</span><span>Footer</span>
        </template>
      </AppLayout>
    </div>
  </div>
</template>
