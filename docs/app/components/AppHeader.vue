<script setup lang="ts">
import { Button } from "./ui/button";
defineProps<{ docs?: boolean }>();
const emit = defineEmits<{ menu: [] }>();
const route = useRoute();
const searchOpen = useState("docs-search-open", () => false);
const { data: navigation } = await useDocsNavigation();
const category = computed(() =>
  navigation.value?.find(
    (group) => route.path === group.path || route.path.startsWith(`${group.path}/`),
  ),
);
function pageTitle(nodes: typeof navigation.value): string | undefined {
  for (const node of nodes ?? []) {
    if (node.children?.length) {
      const title = pageTitle(node.children);
      if (title) return title;
    }
    if (node.path === route.path && node.page !== false) return node.title;
  }
}
const title = computed(() => pageTitle(navigation.value));
</script>
<template>
  <header
    v-if="docs"
    class="flex h-14 w-full items-center bg-background"
  >
    <div class="flex h-full shrink-0 items-center gap-2 px-3 text-[13px] lg:w-60">
      <Button
        variant="ghost"
        size="md"
        shape="icon"
        class="lg:hidden"
        aria-label="Open documentation navigation"
        @click="emit('menu')"
      >
        <Icon
          name="tabler:menu-2"
          class="size-4"
          aria-hidden="true"
        />
      </Button>
      <NuxtLink
        to="/"
        aria-label="Akaza UI home"
        class="inline-flex h-8 items-center rounded-sm text-base font-semibold leading-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <BrandLogo />
      </NuxtLink>
      <NuxtLink
        to="/getting-started"
        class="hidden h-6 items-center border-l border-border pl-2 font-medium leading-none text-muted-foreground hover:text-foreground sm:inline-flex"
      >
        Docs
      </NuxtLink>
      <Button
        variant="ghost"
        size="md"
        shape="icon"
        class="ml-auto"
        aria-label="Search documentation"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        title="Search documentation (Ctrl/Cmd+K)"
        @click="searchOpen = true"
      >
        <Icon
          name="tabler:search"
          class="size-4"
          aria-hidden="true"
        />
      </Button>
    </div>
    <div class="hidden min-w-0 items-center gap-2 px-6 text-xs text-muted-foreground xl:flex">
      <span>{{ category?.title }}</span><Icon
        name="tabler:chevron-right"
        class="size-3 shrink-0"
        aria-hidden="true"
      /><span class="truncate text-highlighted">{{ title }}</span>
    </div>
    <div class="mr-3 ml-auto flex items-center gap-1">
      <SiteNavigation compact /><HeaderActions />
    </div>
  </header>
  <header
    v-else
    class="h-14 bg-background"
  >
    <div class="mx-auto flex h-full w-full max-w-[90rem] items-center gap-2 px-4 sm:gap-3 sm:px-8">
      <NuxtLink
        to="/"
        aria-label="Akaza UI home"
        class="mr-auto inline-flex h-8 items-center rounded-sm text-xl font-semibold leading-none tracking-tight text-highlighted focus-visible:outline-1 focus-visible:outline-ring md:mr-4"
      >
        <BrandLogo />
      </NuxtLink>
      <SiteNavigation />
      <Button
        variant="soft"
        color="secondary"
        size="md"
        class="ml-auto gap-2 max-lg:size-8 max-lg:p-0 lg:w-56 lg:justify-start"
        :ui="{ content: 'min-w-0 w-full' }"
        aria-label="Search documentation"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        title="Search documentation (Ctrl/Cmd+K)"
        @click="searchOpen = true"
      >
        <Icon
          name="tabler:search"
          class="size-4"
          aria-hidden="true"
        /><span
          class="hidden min-w-0 truncate text-left text-[13px] text-muted-foreground lg:inline"
        >Search documentation…</span>
      </Button>
      <HeaderActions />
    </div>
  </header>
</template>
