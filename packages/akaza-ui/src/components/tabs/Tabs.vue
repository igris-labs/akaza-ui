<script setup lang="ts">
import type { TabsProps } from ".";
import type { TabsContextState } from "./context";
import { createSharedComposable } from "@vueuse/core";
import { provide, ref } from "vue";
import { TABS_CONTEXT_KEY } from "./context";

const { as = "div", orientation: orientationProp = "horizontal" } = defineProps<TabsProps>();

const model = defineModel<string>({ default: "" });
const orientation = ref<"horizontal" | "vertical">(orientationProp);

// createSharedComposable called inside setup() creates an isolated factory
// for THIS Tabs instance. Multiple Tabs on a page each get their own factory.
const useTabsCtx = createSharedComposable(
  (): TabsContextState => ({
    activeTab: model,
    orientation,
    setTab: (v: string) => {
      model.value = v;
    },
  }),
);

provide(TABS_CONTEXT_KEY, useTabsCtx);
useTabsCtx(); // Subscribe so state stays alive while Tabs is mounted
</script>

<template>
  <component
    :is="as"
    :data-akaza-orientation="orientation"
    class="akaza-tabs"
  >
    <slot />
  </component>
</template>
