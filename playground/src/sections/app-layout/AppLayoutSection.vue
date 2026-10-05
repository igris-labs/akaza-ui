<script setup lang="ts">
import type { AppLayoutConfig, SidebarController } from "akaza-ui";
import { AppLayout, NavigationMenu, Sidebar, useSidebar } from "akaza-ui";
import { computed, ref, useTemplateRef } from "vue";
import { buttonGhost, exampleStack, exampleTitle, sectionDescription, sectionTitle, sidebarUi } from "../styles";

const sidebarRef = useTemplateRef<SidebarController>("sidebar");
const { toggle, collapsed, open, isMobile } = useSidebar(sidebarRef);
const selected = ref("overview");
const rightCollapsed = ref(false);
const contentHeader = ref(false);
const overlay = ref(false);
const oppositeCorners = ref(false);
const config = computed<AppLayoutConfig>(() => ({
  header: contentHeader.value ? "content" : "full",
  left: overlay.value ? "overlay" : "inline",
}));
const navigation = [
  { value: "overview", label: "Overview" },
  { value: "projects", label: "Projects", children: [{ value: "website", label: "Website" }, { value: "api", label: "API" }] },
  { value: "settings", label: "Settings" },
];
const navigationUi = {
  list: "grid gap-1",
  link: "min-h-10 gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:bg-accent data-[akaza-state=active]:text-foreground",
  itemLabel: "min-w-0 flex-1 truncate",
  subList: "grid gap-1 pl-3",
  tooltip: "rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
};
const shellUi = {
  root: "rounded-lg border border-border bg-background",
  header: "flex min-h-12 items-center gap-3 border-b border-border bg-background px-3",
  footer: "border-t border-border bg-background px-3 py-2 text-xs text-muted-foreground",
  main: "p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
  skipLink: "rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring",
};

</script>

<template>
  <section id="app-layout">
    <h2 :class="sectionTitle">App Layout</h2>
    <p :class="sectionDescription">Application regions with independent scrolling, responsive sidebars, sticky bars, and readable layout options.</p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Fixed regions + responsive navigation</h3>
        <div class="mb-3 flex flex-wrap gap-4 text-sm text-foreground">
          <label class="flex items-center gap-2"><input v-model="contentHeader" type="checkbox"> Header over content only</label>
          <label class="flex items-center gap-2"><input v-model="overlay" type="checkbox"> Overlay left sidebar</label>
        </div>
        <div class="h-[420px] min-w-0" data-testid="app-layout-fixed">
          <AppLayout :viewport="false" :layout="config" main-as="div" main-label="Workspace content" :ui="shellUi">
            <template #header>
              <button type="button" :class="buttonGhost" :aria-expanded="isMobile ? open : !collapsed" @click="toggle">Navigation</button>
              <span class="min-w-0 flex-1 truncate text-sm font-semibold">Workspace</span>
              <button type="button" :class="buttonGhost" @click="rightCollapsed = !rightCollapsed">Inspector</button>
            </template>
            <template #left>
              <Sidebar ref="sidebar" collapsible="icon" resizable :default-size="208" :min-size="160" :max-size="300" aria-label="Workspace navigation" :ui="sidebarUi">
                <template #header="{ collapsed: iconOnly, isMobile: mobile, closeMobile }">
                  <span class="text-sm font-semibold">{{ iconOnly ? 'A' : 'Akaza' }}</span>
                  <button v-if="mobile" type="button" :class="buttonGhost" @click="closeMobile">Close navigation</button>
                </template>
                <template #default="{ collapsed: iconOnly }">
                  <NavigationMenu v-model="selected" orientation="vertical" :items="navigation" :collapsed="iconOnly" :tooltip="iconOnly" :ui="navigationUi" aria-label="Sections">
                    <template #item-leading="{ item }"><span class="grid size-5 shrink-0 place-items-center text-xs" aria-hidden="true">{{ item.label[0] }}</span></template>
                  </NavigationMenu>
                </template>
              </Sidebar>
            </template>
            <p class="mb-3 text-sm font-semibold">Selected: {{ selected }}</p>
            <div class="grid gap-2">
              <div v-for="row in 24" :key="row" class="border-b border-border py-3 text-sm text-muted-foreground">Workspace row {{ row }}</div>
            </div>
            <template #right>
              <Sidebar v-model:collapsed="rightCollapsed" side="right" collapsible="offcanvas" :default-size="192" :mobile="false" :ui="{ ...sidebarUi, root: 'hidden lg:flex' }" aria-label="Inspector">
                <template #header><span class="text-sm font-semibold">Inspector</span></template>
                <p class="p-2 text-xs text-muted-foreground">Independent right sidebar state.</p>
              </Sidebar>
            </template>
            <template #footer>Ready. Scroll the workspace; surrounding regions stay in place.</template>
          </AppLayout>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Independent header and footer corners</h3>
        <label class="mb-3 flex items-center gap-2 text-sm text-foreground"><input v-model="oppositeCorners" type="checkbox"> Swap which sidebar extends beside each bar</label>
        <div class="h-72 min-w-0" data-testid="app-layout-asymmetric">
          <AppLayout :viewport="false" :layout="{ header: oppositeCorners ? 'right' : 'left', footer: oppositeCorners ? 'left' : 'right' }" main-as="div" main-label="Asymmetric layout preview" :ui="shellUi">
            <template #header><span class="text-sm font-semibold">Header over {{ oppositeCorners ? 'right' : 'left' }} and main</span></template>
            <template #left><Sidebar :mobile="false" :default-size="128" :ui="sidebarUi" aria-label="Left region"><p class="p-3 text-sm">Left sidebar</p></Sidebar></template>
            <p class="text-sm text-muted-foreground">The bars choose their corners independently. Each side keeps its own width.</p>
            <template #right><Sidebar side="right" :mobile="false" :default-size="128" :ui="sidebarUi" aria-label="Right region"><p class="p-3 text-sm">Right sidebar</p></Sidebar></template>
            <template #footer>Footer under main and {{ oppositeCorners ? 'left' : 'right' }}</template>
          </AppLayout>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Page scrolling + sticky header</h3>
        <div class="h-72 overflow-auto rounded-lg border border-border" data-testid="app-layout-page">
          <AppLayout :viewport="false" scroll="page" sticky-header main-as="div" :ui="{ ...shellUi, root: 'bg-background' }">
            <template #header><span class="text-sm font-semibold">Sticky page header</span></template>
            <p class="text-sm text-muted-foreground">The document owns scrolling. Header sticks to the nearest scroll container.</p>
            <p v-for="row in 16" :key="row" class="border-b border-border py-4 text-sm text-muted-foreground">Page row {{ row }}</p>
            <template #footer>Page footer</template>
          </AppLayout>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Content only</h3>
        <div class="h-40">
          <AppLayout :viewport="false" main-as="div" :skip-link="false" :ui="shellUi">
            <p class="text-sm text-muted-foreground">All surrounding slots are optional. Style the root with class or ui.root.</p>
          </AppLayout>
        </div>
      </div>
    </div>
  </section>
</template>
