<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import type { ListboxOption } from "akaza-ui";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";

import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Listbox } from "../ui/listbox";

interface SearchResult {
  id: string;
  title: string;
  detail: string;
  section: string;
  icon: string;
}
const legacyIconPrefix = /^i-([^-]+)-/;
const searchWords = /\s+/;
const open = defineModel<boolean>("open", { required: true });
const query = ref("");
const activeIndex = ref(0);
const searchField = useTemplateRef<InstanceType<typeof Input>>("searchField");
function pinDialog() {
  if (!open.value) return;
  const dialog = searchField.value?.$el?.closest('[role="dialog"]') as HTMLElement | null;
  if (!dialog) return;
  const viewport = window.visualViewport;
  const height = viewport?.height ?? window.innerHeight;
  dialog.style.top = `${(viewport?.offsetTop ?? 0) + Math.max(16, (height - dialog.offsetHeight) / 2)}px`;
  dialog.style.translate = "-50% 0";
}
const route = useRoute();
const { data: navigation } = await useDocsNavigation();
const {
  data: sections,
  status,
  error,
  execute,
} = useAsyncData("docs-search-sections", () => queryCollectionSearchSections("docs"), {
  server: false,
  immediate: false,
});
function pagesFrom(nodes: ContentNavigationItem[], section = "Documentation"): SearchResult[] {
  return nodes.flatMap((node) => {
    const category = node.children?.length || node.page === false ? node.title : section;
    const icon =
      typeof node.icon === "string"
        ? node.icon
        : node.navigation && typeof node.navigation === "object" && "icon" in node.navigation
          ? String(node.navigation.icon)
          : "tabler:file-text";
    return [
      ...(node.page === false || node.children?.some((child) => child.path === node.path)
        ? []
        : [
            {
              id: node.path,
              title: node.title,
              detail: String(node.description ?? ""),
              section: category,
              icon: icon.replace(legacyIconPrefix, "$1:"),
            },
          ]),
      ...pagesFrom(node.children ?? [], category),
    ];
  });
}
const pages = computed(() => pagesFrom(navigation.value ?? []));
const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  if (!term) return pages.value;
  const terms = term.split(searchWords);
  const matches = (text: string) => terms.every((word) => text.toLocaleLowerCase().includes(word));
  const pageMap = new Map(pages.value.map((page) => [page.id, page]));
  const matchingPages = pages.value
    .filter((page) => matches(`${page.title} ${page.detail}`))
    .sort(
      (a, b) =>
        Number(b.title.toLocaleLowerCase() === term) - Number(a.title.toLocaleLowerCase() === term),
    );
  const matchingSections = (sections.value ?? []).flatMap((section) => {
    const parent = pageMap.get(section.id.split("#")[0]!);
    if (!parent || !matches(`${section.title} ${section.content}`)) return [];
    return [{ ...parent, id: section.id, title: section.title, detail: parent.title }];
  });
  const candidates = [...matchingPages, ...matchingSections];
  const groups = new Map(
    Array.from(new Set(candidates.map((result) => result.section)), (section, index) => [
      section,
      index,
    ]),
  );
  const seen = new Set<string>();
  return candidates
    .filter((result) => {
      if (seen.has(result.id)) return false;
      seen.add(result.id);
      return true;
    })
    .sort((a, b) => groups.get(a.section)! - groups.get(b.section)!)
    .slice(0, 20);
});
const options = computed<ListboxOption[]>(() =>
  results.value.flatMap((result, index) => [
    ...(results.value[index - 1]?.section === result.section
      ? []
      : [{ type: "label" as const, label: result.section }]),
    { value: result.id, label: result.title },
  ]),
);
const active = computed(() => results.value[activeIndex.value]);
const activeId = computed(() => {
  const index = options.value.findIndex(
    (option) => option.value === active.value?.id && option.type !== "label",
  );
  return index < 0 ? undefined : `docs-search-results-content-option-${index}`;
});
const resultMap = computed(() => new Map(results.value.map((result) => [result.id, result])));
async function choose(value: unknown) {
  if (typeof value !== "string" || !resultMap.value.has(value)) return;
  open.value = false;
  await navigateTo(value);
}
function highlight(option?: ListboxOption) {
  const index = results.value.findIndex((result) => result.id === option?.value);
  if (index >= 0) activeIndex.value = index;
}
function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (results.value.length) {
      activeIndex.value =
        (activeIndex.value + (event.key === "ArrowDown" ? 1 : -1) + results.value.length) %
        results.value.length;
    }
  } else if (event.key === "Enter" && active.value) {
    event.preventDefault();
    void choose(active.value.id);
  }
}
function onShortcut(event: KeyboardEvent) {
  if (
    event.isComposing ||
    event.repeat ||
    event.altKey ||
    !(event.metaKey || event.ctrlKey) ||
    event.key.toLowerCase() !== "k"
  )
    return;
  event.preventDefault();
  open.value = !open.value;
}
watch(results, () => {
  activeIndex.value = 0;
});
watch(activeId, async (id) => {
  await nextTick();
  if (open.value && id) document.getElementById(id)?.scrollIntoView({ block: "nearest" });
});
watch(open, async (value) => {
  query.value = "";
  activeIndex.value = 0;
  if (value && status.value === "idle") void execute();
  await nextTick();
  // Keep the opening position while result changes resize only the lower edge.
  if (value) pinDialog();
});
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);
onMounted(() => {
  window.addEventListener("keydown", onShortcut);
  window.addEventListener("resize", pinDialog);
  window.visualViewport?.addEventListener("resize", pinDialog);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onShortcut);
  window.removeEventListener("resize", pinDialog);
  window.visualViewport?.removeEventListener("resize", pinDialog);
});
</script>

<template>
  <Dialog
    v-model="open"
    title="Search documentation"
    width="lg"
    class="max-h-[calc(100dvh-2rem)] overflow-hidden rounded-xl"
    :ui="{ header: 'sr-only', body: 'p-0', footer: 'hidden' }"
  >
    <template #body>
      <div class="flex items-center gap-2 border-b border-border px-3">
        <Icon
          name="tabler:search"
          class="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref="searchField"
          v-model="query"
          variant="bare"
          size="md"
          class="h-12 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-akaza-focused:ring-0"
          aria-label="Search documentation"
          placeholder="Type a page or search..."
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="open"
          aria-controls="docs-search-results-content"
          :aria-activedescendant="activeId"
          autocomplete="off"
          @keydown="onInputKeydown"
        />
        <kbd class="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
      </div>
      <Listbox
        id="docs-search-results"
        aria-label="Documentation pages"
        :options="options"
        :model-value="active?.id ?? ''"
        :ui="{
          root: 'rounded-none border-0 bg-transparent',
          content: 'max-h-[min(26rem,52dvh)] p-1.5 outline-none',
          option:
            'min-h-8 gap-2.5 px-2 text-[13px] hover:before:bg-transparent data-akaza-highlighted:before:bg-transparent data-[akaza-state=checked]:bg-muted data-[akaza-state=checked]:before:bg-transparent',
          groupLabel: 'px-2 pt-3 pb-1 text-[11px] font-medium text-dimmed',
        }"
        @value-change="choose"
        @highlight-change="highlight"
      >
        <template #option="{ value }">
          <Icon
            :name="resultMap.get(String(value))?.icon ?? 'tabler:hash'"
            mode="svg"
            :size="16"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1 truncate">{{ resultMap.get(String(value))?.title }}</span>
          <span
            v-if="query"
            class="max-w-32 truncate text-xs text-dimmed"
          >{{ resultMap.get(String(value))?.detail }}</span>
        </template>
        <template #empty>
          <span role="status">{{
            status === "pending"
              ? "Searching documentation…"
              : error
                ? "Section search unavailable. Try a page title."
                : "No matching pages or sections"
          }}</span>
        </template>
      </Listbox>
      <div
        class="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted-foreground"
      >
        <span><kbd>↑↓</kbd> Navigate <span class="mx-2">·</span> <kbd>↵</kbd> Open</span>
        <span><kbd>Esc</kbd> Close</span>
      </div>
    </template>
  </Dialog>
</template>
