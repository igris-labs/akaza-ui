<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
import { ref } from "vue";
import { NavigationMenu } from "akaza-ui";
import {
  canvasCol,
  codePill,
  exampleStack,
  exampleLabelDescription,
  exampleLabelTitle,
  navigationMenuUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const open = ref<string | null>(null);
const expanded = ref(["workspace", "settings"]);
const collapsedOpen = ref<string | null>(null);
const collapsed = ref(true);
const horizontalSelected = ref("components");
const verticalSelected = ref("overview");
const collapsedSelected = ref("overview");

const items: NavigationMenuItem[] = [
  {
    label: "Products",
    value: "products",
    children: [
      { label: "Components", href: "#components", description: "Headless Vue primitives.", active: true },
      { label: "Patterns", href: "#patterns", description: "Composed production workflows." },
      {
        label: "Resources",
        description: "More project information.",
        children: [
          { label: "Changelog", href: "#changelog" },
          { label: "Roadmap", href: "#roadmap" },
        ],
      },
    ],
  },
  {
    label: "Docs",
    value: "docs",
    children: [
      { label: "Getting started", href: "#getting-started", description: "Install and configure Akaza UI." },
      { label: "Styling", href: "#styling", description: "ui prop, semantic classes, and data attrs." },
      { label: "Accessibility", href: "#accessibility", description: "Keyboard and screen reader behavior." },
    ],
  },
  { label: "GitHub", href: "#github" },
  { label: "Disabled", href: "#disabled", disabled: true },
];

const sidebarItems: NavigationMenuItem[] = [
  { label: "Workspace", value: "workspace-label", type: "label" },
  { label: "Overview", value: "overview", active: true },
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
  { label: "Account divider", value: "account-divider", type: "separator" },
  {
    label: "Settings",
    value: "settings",
    children: [
      { label: "Profile", value: "profile" },
      { label: "Security", value: "security" },
    ],
  },
];

const verticalUi = {
  root: "w-full",
  list: "grid gap-1",
  inlineList: "ml-4 grid gap-1 border-l border-border pl-2",
  inlineItem: "min-w-0",
  trigger: "min-h-9 gap-2 rounded-md px-2 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=open]:text-foreground",
  link: "min-h-9 gap-2 rounded-md px-2 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:bg-accent data-[akaza-state=active]:text-foreground",
  itemLabel: "min-w-0 flex-1 truncate",
  badge: "ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground",
  childIndicator: "ml-auto text-xs transition-transform data-[akaza-state=open]:rotate-90",
  groupLabel: "px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
  separator: "my-2 border-t border-border",
  content: "min-w-52 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg",
  viewport: "w-full",
  contentList: "grid gap-1",
  contentItem: "min-w-0",
  contentLink: "grid min-h-9 gap-0.5 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
  label: "font-medium",
  description: "text-xs text-muted-foreground",
  tooltip: "rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
};

function shortLabel(label: string) {
  return label.slice(0, 1).toUpperCase();
}
</script>

<template>
  <section id="navigation-menu">
    <h2 :class="sectionTitle">Navigation Menu</h2>
    <p :class="sectionDescription">
      Horizontal flyouts and vertical application navigation with recursive disclosure, collapsed side panels, and semantic markup.
    </p>

    <div :class="exampleStack">
      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Horizontal flyout</h3>
          <p :class="exampleLabelDescription">Hover is delayed; keyboard navigation uses roving focus, Home/End, typeahead, and Escape.</p>
        </div>
        <NavigationMenu
          v-model="horizontalSelected"
          v-model:open="open"
          :items="items"
          :ui="navigationMenuUi"
        />
        <code :class="codePill">open: {{ open ?? "(closed)" }}, selected: {{ horizontalSelected }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Vertical groups and recursive expansion</h3>
          <p :class="exampleLabelDescription">Inline mode supports labels, separators, badges, multiple expanded branches, recursive children, and vertical arrow keys.</p>
        </div>
        <div class="w-full max-w-72 rounded-lg border border-border bg-background p-2">
          <NavigationMenu
            v-model="verticalSelected"
            v-model:expanded="expanded"
            orientation="vertical"
            :items="sidebarItems"
            :ui="verticalUi"
            aria-label="Workspace"
          >
            <template #item-leading="{ item }">
              <span aria-hidden="true" class="grid size-6 shrink-0 place-items-center rounded border border-border bg-card text-[10px] font-semibold text-foreground">
                {{ shortLabel(item.label) }}
              </span>
            </template>
            <template #child-indicator>›</template>
          </NavigationMenu>
        </div>
        <code :class="codePill">selected: {{ verticalSelected }}, expanded: {{ expanded.join(", ") || "(none)" }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Collapsed sidebar flyout</h3>
          <p :class="exampleLabelDescription">With <code>collapsed</code>, automatic mode keeps icons in the rail and opens children beside the active trigger.</p>
        </div>
        <div class="flex min-h-72 overflow-visible rounded-lg border border-border bg-background">
          <div class="border-r border-border p-2">
            <NavigationMenu
              v-model="collapsedSelected"
              v-model:open="collapsedOpen"
              orientation="vertical"
              :collapsed="collapsed"
              tooltip
              :items="sidebarItems.filter(item => item.type !== 'label' && item.type !== 'separator')"
              :ui="{
                ...verticalUi,
                root: collapsed ? 'w-11' : 'w-64',
                trigger: `${verticalUi.trigger} ${collapsed ? 'justify-center px-0' : ''}`,
                link: `${verticalUi.link} ${collapsed ? 'justify-center px-0' : ''}`,
              }"
              aria-label="Collapsed workspace"
            >
              <template #item-leading="{ item }">
                <span aria-hidden="true" class="grid size-6 shrink-0 place-items-center rounded border border-border bg-card text-[10px] font-semibold text-foreground">
                  {{ shortLabel(item.label) }}
                </span>
              </template>
              <template #child-indicator>›</template>
            </NavigationMenu>
          </div>
          <div class="min-w-0 flex-1 p-4">
            <button
              type="button"
              class="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              @click="collapsed = !collapsed"
            >
              {{ collapsed ? "Expand" : "Collapse" }} navigation
            </button>
            <p class="mt-3 text-xs text-muted-foreground">Open Workspace or Settings while collapsed to inspect the side flyout.</p>
          </div>
        </div>
        <code :class="codePill">selected: {{ collapsedSelected }}, collapsed: {{ collapsed }}, flyout: {{ collapsedOpen ?? "(closed)" }}</code>
      </div>
    </div>
  </section>
</template>
