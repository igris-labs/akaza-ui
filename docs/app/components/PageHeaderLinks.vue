<script setup lang="ts">
import type { MenuItem } from "akaza-ui";
import { Button } from "./ui/button";
import { Menu } from "./ui/menu";
const route = useRoute();
const site = useSiteConfig();
const status = ref("Copy page");
const mdPath = computed(() => `${site.url || "https://akaza-ui.com"}/raw${route.path}.md`);
const items = computed<MenuItem[]>(() => [
  { value: "copy-link", label: "Copy Markdown link", onSelect: () => copy(true) },
  {
    value: "markdown",
    label: "View as Markdown",
    onSelect: () => openLink(`/raw${route.path}.md`),
  },
  {
    value: "chatgpt",
    label: "Open in ChatGPT",
    onSelect: () =>
      openLink(
        `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`,
      ),
  },
  {
    value: "claude",
    label: "Open in Claude",
    onSelect: () =>
      openLink(
        `https://claude.ai/new?q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`,
      ),
  },
]);
watch(
  () => route.path,
  () => (status.value = "Copy page"),
);
function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
async function copy(link = false) {
  try {
    const text = link ? mdPath.value : await $fetch<string>(`/raw${route.path}.md`);
    await navigator.clipboard.writeText(text);
    status.value = "Copied";
  } catch {
    status.value = "Copy failed. Use Markdown view.";
  }
}
</script>
<template>
  <div
    class="flex items-center gap-1"
    data-ui
  >
    <Button
      variant="soft"
      color="secondary"
      size="sm"
      @click="copy()"
    >
      <Icon
        :name="status === 'Copied' ? 'lucide:check' : 'lucide:copy'"
        class="size-3.5"
        aria-hidden="true"
      />{{ status }}
    </Button>
    <Menu
      teleport="body"
      :items="items"
      align="end"
    >
      <template #trigger="{ toggle, triggerProps }">
        <Button
          v-bind="triggerProps"
          variant="ghost"
          size="sm"
          shape="icon"
          aria-label="More page actions"
          @click="toggle"
        >
          <Icon
            name="lucide:chevron-down"
            class="size-4"
            aria-hidden="true"
          />
        </Button>
      </template>
    </Menu>
    <span
      class="sr-only"
      role="status"
    >{{ status === "Copy page" ? "" : status }}</span>
  </div>
</template>
