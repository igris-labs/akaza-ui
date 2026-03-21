<script setup lang="ts">
import type { TabListProps } from ".";
import { onKeyStroke } from "@vueuse/core";
import { inject, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

import { TABS_CONTEXT_KEY } from "./context";
const { as = "div" } = defineProps<TabListProps>();

const ctx = inject(TABS_CONTEXT_KEY);
if (ctx === undefined) throw new Error("TabList must be used inside Tabs");
const { activeTab, orientation, setTab } = ctx();

const rootRef = useTemplateRef<HTMLElement>("rootRef");
const indicatorStyle = ref({ left: "0px", width: "0px", top: "0px", height: "0px" });

function updateIndicator() {
  if (!rootRef.value) return;
  const activeEl = rootRef.value.querySelector<HTMLElement>('[data-akaza-state="active"]');
  if (!activeEl) return;
  const containerRect = rootRef.value.getBoundingClientRect();
  const tabRect = activeEl.getBoundingClientRect();
  if (orientation.value === "horizontal") {
    indicatorStyle.value = {
      left: `${tabRect.left - containerRect.left}px`,
      width: `${tabRect.width}px`,
      top: "",
      height: "",
    };
  } else {
    indicatorStyle.value = {
      top: `${tabRect.top - containerRect.top}px`,
      height: `${tabRect.height}px`,
      left: "",
      width: "",
    };
  }
}

watch(activeTab, async () => {
  await nextTick();
  updateIndicator();
});

onMounted(async () => {
  await nextTick();
  updateIndicator();
});

onKeyStroke(["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"], (e) => {
  if (!rootRef.value) return;
  const tabs = Array.from(
    rootRef.value.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled])'),
  );
  if (tabs.length === 0) return;

  const isHorizontal = orientation.value === "horizontal";
  const isPrev = (isHorizontal && e.key === "ArrowLeft") || (!isHorizontal && e.key === "ArrowUp");
  const isNext =
    (isHorizontal && e.key === "ArrowRight") || (!isHorizontal && e.key === "ArrowDown");
  if (!isPrev && !isNext && e.key !== "Home" && e.key !== "End") return;

  e.preventDefault();
  const currentIdx = tabs.findIndex((t) => t.dataset.akazaState === "active");
  let next = currentIdx;

  if (isPrev) next = currentIdx > 0 ? currentIdx - 1 : tabs.length - 1;
  else if (isNext) next = currentIdx < tabs.length - 1 ? currentIdx + 1 : 0;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = tabs.length - 1;

  const nextTab = tabs[next];
  if (nextTab) {
    const value = nextTab.dataset.akazaValue ?? "";
    setTab(value);
    nextTab.focus();
  }
});
</script>

<template>
  <component
    :is="as"
    ref="rootRef"
    role="tablist"
    :aria-orientation="orientation"
    class="akaza-tab-list"
  >
    <slot />
    <span
      class="akaza-tab-indicator"
      :style="indicatorStyle"
      aria-hidden="true"
    />
  </component>
</template>

<style>
.akaza-tab-list {
  position: relative;
}

.akaza-tab-indicator {
  position: absolute;
  background: var(--akaza-tab-indicator-color, currentColor);
  transition:
    left 0.2s ease,
    width 0.2s ease,
    top 0.2s ease,
    height 0.2s ease;
  pointer-events: none;
}

/* Horizontal: indicator sits on the bottom edge */
.akaza-tab-list[aria-orientation="horizontal"] .akaza-tab-indicator {
  bottom: 0;
  height: 2px;
}

/* Vertical: indicator sits on the left edge */
.akaza-tab-list[aria-orientation="vertical"] .akaza-tab-indicator {
  left: 0;
  width: 2px;
}
</style>
