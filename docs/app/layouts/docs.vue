<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import type { SidebarController } from "akaza-ui";
import type { SidebarItem } from "../components/ui/sidebar";
import { useSidebar } from "akaza-ui";
import { AppLayout } from "../components/ui/app-layout";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
const route = useRoute();
const sidebar = useSidebar(useTemplateRef<SidebarController>("navigation"));
watch(
  () => route.path,
  () => sidebar.closeMobile(),
);
const { data: navigation } = await useDocsNavigation();
const link = resolveComponent("NuxtLink");
const iconPrefix = /^i-([^-]+)-/;
function navigationIcon(node: ContentNavigationItem) {
  const icon =
    node.navigation && typeof node.navigation === "object" && "icon" in node.navigation
      ? node.navigation.icon
      : node.icon;
  return typeof icon === "string" ? icon.replace(iconPrefix, "$1:") : undefined;
}
function navigationBadge(node: ContentNavigationItem) {
  const navigation = node.navigation;
  const badge =
    navigation && typeof navigation === "object" && "badge" in navigation
      ? navigation.badge
      : undefined;
  if (!badge || typeof badge !== "object" || !("label" in badge) || typeof badge.label !== "string")
    return {};
  return {
    statusLabel: badge.label,
    statusColor: "color" in badge ? String(badge.color) : undefined,
  };
}
function menuItems(nodes: ContentNavigationItem[]): SidebarItem[] {
  return nodes.flatMap((node) => [
    ...(node.children?.length
      ? [{ value: `${node.path}-group`, label: node.title, type: "label" as const }]
      : []),
    ...(node.page === false || node.children?.some((child) => child.path === node.path)
      ? []
      : [
          {
            value: node.path,
            label: node.children?.length ? "Overview" : node.title,
            to: node.path,
            as: link,
            navigationIcon: navigationIcon(node),
            ...navigationBadge(node),
          },
        ]),
    ...menuItems(node.children ?? []),
  ]);
}
const items = computed(() => menuItems(navigation.value ?? []));
</script>
<template>
  <AppLayout
    scroll="page"
    sticky-header
    sticky-sides
    :ui="{
      root: 'min-h-dvh bg-background text-foreground',
      header: 'z-30 h-14 border-b border-border/60 bg-background',
      left: 'max-lg:w-0',
      main: 'min-w-0 outline-none',
    }"
  >
    <template #header>
      <AppHeader docs @menu="sidebar.openMobile" />
    </template>
    <template #left>
      <Sidebar
        ref="navigation"
        aria-label="Documentation navigation"
        navigation-label="Documentation"
        variant="soft"
        :items="items"
        :model-value="route.path"
        breakpoint="(max-width: 1023px)"
        :default-size="240"
        :mobile-size="288"
        :ui="{
          root: 'h-[calc(100dvh-3.5rem)]',
          body: 'px-4 py-6',
          navigation: { list: '[--sidebar-group-gap:28px]' },
        }"
      >
        <template #header="{ closeMobile }">
          <span class="font-semibold">Documentation</span>
          <Button variant="ghost" size="xs" @click="closeMobile"> Close </Button>
        </template>
        <template #item-leading="{ item }">
          <Icon
            v-if="item.navigationIcon"
            :name="String(item.navigationIcon)"
            class="size-3.5"
            aria-hidden="true"
          />
        </template>
        <template #item-trailing="{ item }">
          <span
            v-if="item.statusLabel"
            class="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] leading-4 font-medium inset-ring"
            :class="
              item.statusColor === 'success'
                ? 'bg-success/10 text-success inset-ring-success/20'
                : item.statusColor === 'warning'
                  ? 'bg-warning/10 text-warning inset-ring-warning/20'
                  : 'bg-muted text-muted-foreground inset-ring-border'
            "
          >
            {{ item.statusLabel }}
          </span>
        </template>
        <template #footer>
          <a href="https://github.com/igris-labs/akaza-ui" class="hover:text-foreground">
            Akaza UI · Open source on GitHub ↗
          </a>
        </template>
      </Sidebar>
    </template>
    <slot />
  </AppLayout>
</template>
