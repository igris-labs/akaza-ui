<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { NavigationMenu, Sidebar } from "akaza-ui";
import {
  buttonGhost,
  buttonPrimary,
  canvasCol,
  codePill,
  exampleStack,
  exampleTitle,
  sectionDescription,
  sectionTitle,
  sidebarUi,
} from "../styles";

const iconCollapsed = ref(false);
const offcanvasCollapsed = ref(false);
const rightCollapsed = ref(false);
const mobileOpen = ref(false);
const size = ref(224);
const selected = ref("overview");
const projectSelected = ref("website");

const navigation: NavigationMenuItem[] = [
  { label: "Overview", value: "overview" },
  { label: "Orders", value: "orders" },
  { label: "Customers", value: "customers" },
  { label: "Settings", value: "settings" },
];

const projects: NavigationMenuItem[] = [
  { label: "Website", value: "website" },
  { label: "Dashboard", value: "dashboard" },
  { label: "API", value: "api" },
];

const navigationUi = {
  root: "w-full",
  list: "grid gap-1",
  item: "min-w-0",
  link: "min-h-9 gap-2 rounded-md px-2 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:bg-accent data-[akaza-state=active]:text-foreground",
  itemLabel: "min-w-0 flex-1 truncate",
  content: "z-[1100]",
  tooltip: "rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
};

function shortLabel(item: NavigationMenuItem) {
  return item.label.slice(0, 1).toUpperCase();
}
</script>

<template>
  <section id="sidebar">
    <h2 :class="sectionTitle">Sidebar</h2>
    <p :class="sectionDescription">
      Persistent desktop navigation with icon and off-canvas collapse modes, accessible resizing, and modal mobile behavior.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Icon collapse + resizing</h3>
        <div class="flex h-80 min-w-0 overflow-hidden rounded-lg border border-border bg-background">
          <Sidebar
            v-model:collapsed="iconCollapsed"
            v-model:size="size"
            :mobile="false"
            collapsible="icon"
            resizable
            :default-size="224"
            :min-size="176"
            :max-size="320"
            aria-label="Workspace navigation"
            :ui="sidebarUi"
          >
            <template #header="{ collapsed, toggleCollapsed }">
              <span class="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">A</span>
              <span v-if="!collapsed" class="min-w-0 flex-1 truncate text-sm font-semibold">Akaza</span>
              <button
                type="button"
                :class="[buttonGhost, 'size-8 shrink-0 px-0']"
                :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                @click="toggleCollapsed"
              >
                {{ collapsed ? ">" : "<" }}
              </button>
            </template>

            <template #default="{ collapsed }">
              <NavigationMenu
                v-model="selected"
                orientation="vertical"
                :collapsed="collapsed"
                :tooltip="collapsed"
                teleport="body"
                :items="navigation"
                :ui="navigationUi"
                aria-label="Workspace"
              >
                <template #item-leading="{ item }">
                  <span aria-hidden="true" class="grid size-6 shrink-0 place-items-center rounded border border-border text-[10px] font-semibold">
                    {{ shortLabel(item) }}
                  </span>
                </template>
              </NavigationMenu>
            </template>

            <template #footer="{ collapsed }">
              <div class="flex items-center gap-2 px-1">
                <span class="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold">RV</span>
                <span v-if="!collapsed" class="truncate text-xs text-muted-foreground">rahul@example.com</span>
              </div>
            </template>
          </Sidebar>

          <div class="min-w-0 flex-1 p-5">
            <p class="text-sm font-semibold text-foreground">Workspace</p>
            <p class="mt-1 text-xs text-muted-foreground">Drag the divider or focus it and use Arrow keys.</p>
            <code :class="[codePill, 'mt-4 inline-flex']">selected: {{ selected }}, collapsed: {{ iconCollapsed }}, size: {{ size }}px</code>
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Off-canvas and right placement</h3>
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="flex h-64 min-w-0 overflow-hidden rounded-lg border border-border bg-background">
            <Sidebar
              v-model:collapsed="offcanvasCollapsed"
              :mobile="false"
              collapsible="offcanvas"
              :default-size="184"
              aria-label="Project navigation"
              :ui="sidebarUi"
            >
              <template #header><span class="px-1 text-sm font-semibold">Projects</span></template>
              <NavigationMenu
                v-model="projectSelected"
                orientation="vertical"
                :items="projects"
                :ui="navigationUi"
                aria-label="Projects"
              />
            </Sidebar>
            <div class="min-w-0 flex-1 p-4">
              <button type="button" :class="buttonGhost" @click="offcanvasCollapsed = !offcanvasCollapsed">
                {{ offcanvasCollapsed ? "Show" : "Hide" }} sidebar
              </button>
            </div>
          </div>

          <div class="flex h-64 min-w-0 overflow-hidden rounded-lg border border-border bg-background">
            <div class="min-w-0 flex-1 p-4">
              <button type="button" :class="buttonGhost" @click="rightCollapsed = !rightCollapsed">
                Toggle right
              </button>
            </div>
            <Sidebar
              v-model:collapsed="rightCollapsed"
              :mobile="false"
              side="right"
              collapsible="icon"
              :default-size="184"
              aria-label="Inspector"
              :ui="sidebarUi"
            >
              <template #header="{ collapsed }">
                <span class="grid size-7 shrink-0 place-items-center rounded border border-border text-xs">I</span>
                <span v-if="!collapsed" class="text-sm font-semibold">Inspector</span>
              </template>
              <template #default="{ collapsed }">
                <p class="px-2 text-xs text-muted-foreground">{{ collapsed ? "12" : "12 properties" }}</p>
              </template>
            </Sidebar>
          </div>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Mobile dialog</h3>
        <div :class="canvasCol">
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" :class="buttonPrimary" :aria-expanded="mobileOpen" @click="mobileOpen = true">
              Open mobile sidebar
            </button>
            <code :class="codePill">open: {{ mobileOpen }}</code>
          </div>

          <Sidebar
            v-model:open="mobileOpen"
            mobile
            aria-label="Mobile navigation"
            :ui="sidebarUi"
          >
            <template #header="{ closeMobile }">
              <span class="min-w-0 flex-1 truncate text-sm font-semibold">Navigation</span>
              <button type="button" :class="[buttonGhost, 'size-8 px-0']" aria-label="Close navigation" @click="closeMobile">x</button>
            </template>
            <template #default="{ closeMobile }">
              <NavigationMenu
                v-model="selected"
                orientation="vertical"
                :items="navigation"
                :ui="navigationUi"
                aria-label="Mobile"
                @select="() => closeMobile()"
              />
            </template>
            <template #footer>
              <p class="px-2 text-xs text-muted-foreground">Modal focus, Escape, backdrop, and swipe dismissal.</p>
            </template>
          </Sidebar>
        </div>
      </div>
    </div>
  </section>
</template>
