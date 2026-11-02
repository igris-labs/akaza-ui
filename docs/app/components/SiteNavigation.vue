<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { NavigationMenu } from "./ui/navigation-menu";
const props = defineProps<{ compact?: boolean }>();
const route = useRoute();
const link = resolveComponent("NuxtLink");
const { data: navigation } = await useDocsNavigation();
const open = ref<string | null>(null);
watch(
  () => route.path,
  () => (open.value = null),
);
function pages(nodes: ContentNavigationItem[]): ContentNavigationItem[] {
  return nodes.flatMap((node) =>
    node.children?.length ? pages(node.children) : node.page === false ? [] : [node],
  );
}
function entry(page: ContentNavigationItem, featured = true) {
  return {
    value: page.path,
    label: page.title,
    description: featured && typeof page.description === "string" ? page.description : undefined,
    as: link,
    to: page.path,
  };
}
const guides = computed(() =>
  pages(navigation.value?.find((group) => group.path === "/getting-started")?.children ?? []),
);
const resources = [
  { value: "composables", label: "Composables", as: link, to: "/composables" },
  { value: "builders", label: "Layout builder", as: link, to: "/builders/layout-builder" },
  { value: "github", label: "GitHub", href: "https://github.com/igris-labs/akaza-ui" },
  {
    value: "ipex",
    label: "IPEX design system",
    description: "Design system foundation built on Akaza UI.",
    href: "https://ipex.igrislabs.com",
  },
];
const groups = computed(() => [
  {
    value: "documentation",
    label: "Documentation",
    children: [...guides.value.map((page) => entry(page)), ...resources],
  },
  {
    value: "components",
    label: "Components",
    as: link,
    to: "/components",
    active: route.path.startsWith("/components"),
  },
  { value: "playground", label: "Playground", href: "https://playground.akaza-ui.com/" },
]);
const mobileItems = computed(() => [
  {
    value: "browse",
    label: "Menu",
    children: [
      ...guides.value.map((page) => entry(page, false)),
      { value: "components", label: "Components", as: link, to: "/components" },
      ...resources,
      { value: "playground", label: "Playground", href: "https://playground.akaza-ui.com/" },
    ],
  },
]);
const ui = computed(() => ({
  trigger: props.compact ? "text-xs leading-4" : "text-[13px] leading-4",
  link: props.compact ? "text-xs leading-4" : "text-[13px] leading-4",
  content: "rounded-xl border-border/70 bg-background p-2 shadow-lg",
  viewport: "rounded-lg bg-muted/40",
  panel: "w-[min(48rem,calc(100vw-3.125rem))] max-w-none p-0",
  contentList:
    "relative isolate grid max-h-[min(32rem,75dvh)] grid-cols-1 gap-1 overflow-y-auto p-2 sm:block sm:columns-3 sm:gap-x-6 sm:p-5 sm:before:pointer-events-none sm:before:absolute sm:before:inset-y-5 sm:before:left-1/3 sm:before:w-px sm:before:bg-border/50 sm:after:pointer-events-none sm:after:absolute sm:after:inset-y-5 sm:after:left-2/3 sm:after:w-px sm:after:bg-border/50",
  contentItem: "relative z-10 break-inside-avoid sm:mb-1 sm:[&:nth-child(3)]:break-before-column sm:[&:nth-child(5)]:break-before-column",
  contentLink: "justify-start gap-2 px-3 py-3 text-left text-[13px] leading-5",
  description: "max-w-none text-[13px] leading-5 text-muted-foreground",
}));
const mobileUi = computed(() => ({
  ...ui.value,
  content: "rounded-xl border-border/70 bg-background p-2 shadow-lg",
  panel: "w-[min(22rem,calc(100vw-2rem))] max-w-none p-0",
  contentList: "grid max-h-[min(32rem,75dvh)] grid-cols-1 gap-1 overflow-y-auto p-2",
  contentItem: "",
  contentLink: "gap-1 px-3 py-2 text-[13px] leading-5",
}));
</script>

<template>
  <NavigationMenu
    v-model:open="open"
    :items="groups"
    content-mode="flyout"
    teleport="#teleports"
    size="md"
    :side-offset="2"
    :ui="ui"
    aria-label="Main navigation"
    class="hidden md:block"
  />
  <NavigationMenu
    v-model:open="open"
    :items="mobileItems"
    content-mode="flyout"
    teleport="#teleports"
    size="md"
    :side-offset="2"
    :ui="mobileUi"
    aria-label="Main navigation"
    class="md:hidden"
  />
</template>
