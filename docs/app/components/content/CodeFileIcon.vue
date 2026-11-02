<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ filename: string }>();
const extension = computed(() => props.filename.split(".").at(-1)?.toLowerCase() ?? "");
const icon = computed(() => {
  const types: Record<string, { name: string; color: string }> = {
    vue: { name: "tabler:brand-vue", color: "text-success" },
    ts: { name: "tabler:brand-typescript", color: "text-info" },
    tsx: { name: "tabler:file-type-tsx", color: "text-info" },
    js: { name: "tabler:brand-javascript", color: "text-warning" },
    mjs: { name: "tabler:brand-javascript", color: "text-warning" },
    jsx: { name: "tabler:file-type-jsx", color: "text-warning" },
    css: { name: "tabler:brand-css3", color: "text-info" },
    html: { name: "tabler:brand-html5", color: "text-warning" },
    json: { name: "tabler:json", color: "text-warning" },
    md: { name: "tabler:markdown", color: "text-muted-foreground" },
    svg: { name: "tabler:file-type-svg", color: "text-warning" },
    sh: { name: "tabler:terminal-2", color: "text-muted-foreground" },
  };
  return types[extension.value] ?? { name: "tabler:file-code", color: "text-muted-foreground" };
});
</script>

<template>
  <Icon
    :name="icon.name"
    class="size-4 shrink-0"
    :class="icon.color"
    :data-file-extension="extension"
    aria-hidden="true"
  />
</template>
