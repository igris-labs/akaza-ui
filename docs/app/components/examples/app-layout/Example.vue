<script setup lang="ts">
import type { AppLayoutConfig } from "akaza-ui";
import { computed } from "vue";
import Demo from "./Demo.vue";

const { variant } = defineProps<{ variant: "between" | "page" | "contained" | "overlay" }>();
const layout = computed<AppLayoutConfig>(() => variant === "between"
  ? { header: "content", footer: "content" }
  : variant === "overlay" ? { left: "overlay" } : {});
</script>

<template>
  <Demo
    :layout="layout"
    :show-right="variant === 'between'"
    :show-left="variant !== 'contained'"
    :show-footer="variant !== 'contained'"
    :scroll="variant === 'page' ? 'page' : 'content'"
    :sticky-header="variant === 'page'"
    :collapsible="variant === 'overlay' ? 'offcanvas' : 'icon'"
  />
</template>
