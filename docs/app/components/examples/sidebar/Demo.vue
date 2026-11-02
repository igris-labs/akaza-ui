<script setup lang="ts">
import type { NavigationMenuItem, SidebarController } from "akaza-ui";
import { useSidebar } from "akaza-ui";
import { ref, useTemplateRef } from "vue";
import { Button } from "../../ui/button";
import { NavigationMenu } from "../../ui/navigation-menu";
import { Sidebar } from "../../ui/sidebar";

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
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-border bg-background">
    <header class="flex h-12 items-center gap-3 border-b border-border px-3">
      <Button
        color="secondary"
        variant="ghost"
        size="sm"
        shape="icon"
        type="button"
        :aria-expanded="isMobile ? open : !collapsed"
        :aria-label="
          isMobile ? 'Open navigation' : collapsed ? 'Expand navigation' : 'Collapse navigation'
        "
        @click="toggle"
      >
        <Icon
          :name="
            isMobile
              ? 'lucide:menu'
              : collapsed
                ? 'lucide:panel-left-open'
                : 'lucide:panel-left-close'
          "
          class="size-4"
        />
      </Button>
      <span class="text-sm font-semibold text-foreground">Workspace</span>
    </header>

    <div class="flex h-80 min-w-0">
      <Sidebar
        ref="sidebar"
        v-model:size="size"
        :ui="{
          root: 'h-full',
          header: 'px-2',
          panel: 'data-[akaza-side=right]:border-r-0 data-[akaza-side=right]:border-l',
          mobileWrapper: 'h-full',
        }"
        collapsible="icon"
        resizable
        :default-size="224"
        :min-size="176"
        :max-size="320"
        aria-label="Workspace navigation"
      >
        <template #header="{ collapsed: isCollapsed, closeMobile }">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
          >A</span>
          <span
            v-if="!isCollapsed"
            class="min-w-0 flex-1 truncate text-sm font-semibold"
          >Akaza</span>
          <Button
            v-if="isMobile"
            color="secondary"
            variant="ghost"
            size="sm"
            shape="icon"
            type="button"
            aria-label="Close navigation"
            @click="closeMobile"
          >
            <Icon
              name="lucide:x"
              class="size-4"
            />
          </Button>
        </template>

        <template #default="{ collapsed: isCollapsed, closeMobile }">
          <NavigationMenu
            v-model="selected"
            orientation="vertical"
            :collapsed="isCollapsed"
            :tooltip="isCollapsed"
            teleport="body"
            :items="links"
            aria-label="Workspace"
            @select="() => isMobile && closeMobile()"
          >
            <template #item-leading="{ item }">
              <Icon
                :name="icons[item.value ?? item.label] || 'lucide:circle'"
                class="size-4 shrink-0"
              />
            </template>
          </NavigationMenu>
        </template>

        <template #footer="{ collapsed: isCollapsed }">
          <div class="flex items-center gap-2 px-1">
            <span
              class="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold"
            >RV</span>
            <span
              v-if="!isCollapsed"
              class="truncate text-xs text-muted-foreground"
            >rahul@example.com</span>
          </div>
        </template>
      </Sidebar>

      <div class="min-w-0 flex-1 p-5">
        <p class="text-sm font-semibold text-foreground">Dashboard</p>
        <p class="mt-1 text-xs text-muted-foreground">
          Resize the sidebar or reduce the preview width to see mobile modal behavior.
        </p>
        <p class="mt-2 text-xs text-muted-foreground">Selected: {{ selected }}</p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="h-20 rounded-md border border-border bg-muted" />
          <div class="h-20 rounded-md border border-border bg-muted" />
        </div>
      </div>
    </div>
  </div>
</template>
