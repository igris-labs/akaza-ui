<script setup lang="ts">
import type { TabsItem, TabsProps } from ".";
import { onKeyStroke } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";

const {
  items,
  orientation = "horizontal",
  activationMode = "automatic",
  unmountOnHide = false,
  ariaLabel,
  labelKey = "label",
  ui,
} = defineProps<TabsProps>();

const model = defineModel<string>({ default: "" });

function getLabel(item: TabsItem): string {
  if (labelKey && (item as any)[labelKey] !== undefined) return String((item as any)[labelKey]);
  return item.label ?? item.value;
}

function isActive(item: TabsItem): boolean {
  return model.value === item.value;
}

// Roving tabindex: active tab, or first enabled if none active
const rovingValue = computed(() => {
  if (model.value && items.some((i) => i.value === model.value && !i.disabled)) return model.value;
  return items.find((i) => !i.disabled)?.value ?? "";
});

// ── Element refs for indicator ─────────────────────────────────

const tabEls: (HTMLElement | null)[] = [];
function setTabRef(el: HTMLElement | null, index: number) {
  tabEls[index] = el;
}

const listRef = ref<HTMLElement | null>(null);
const indicatorStyle = ref({ left: "0px", width: "0px", top: "0px", height: "0px" });

function updateIndicator() {
  if (!listRef.value) return;
  const activeIdx = items.findIndex((i) => isActive(i));
  const activeEl = activeIdx >= 0 ? tabEls[activeIdx] : null;
  if (!activeEl) return;
  const containerRect = listRef.value.getBoundingClientRect();
  const tabRect = activeEl.getBoundingClientRect();
  if (orientation === "horizontal") {
    indicatorStyle.value = { left: `${tabRect.left - containerRect.left}px`, width: `${tabRect.width}px`, top: "", height: "" };
  } else {
    indicatorStyle.value = { top: `${tabRect.top - containerRect.top}px`, height: `${tabRect.height}px`, left: "", width: "" };
  }
}

watch(() => model.value, async () => { await nextTick(); updateIndicator(); });
onMounted(async () => { await nextTick(); updateIndicator(); });

// ── Keyboard navigation ────────────────────────────────────────

onKeyStroke(["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"], (e) => {
  if (!listRef.value?.contains(document.activeElement)) return;

  const enabled = items.filter((i) => !i.disabled);
  if (enabled.length === 0) return;

  const isHorizontal = orientation === "horizontal";
  const isPrev = (isHorizontal && e.key === "ArrowLeft") || (!isHorizontal && e.key === "ArrowUp");
  const isNext = (isHorizontal && e.key === "ArrowRight") || (!isHorizontal && e.key === "ArrowDown");
  if (!isPrev && !isNext && e.key !== "Home" && e.key !== "End") return;

  e.preventDefault();

  const focusedValue = (document.activeElement as HTMLElement)?.dataset?.akazaValue ?? "";
  const fromIdx = enabled.findIndex((i) => i.value === focusedValue);
  const currentIdx = fromIdx >= 0 ? fromIdx : enabled.findIndex((i) => i.value === model.value);

  let nextIdx = currentIdx;
  if (isPrev) nextIdx = currentIdx > 0 ? currentIdx - 1 : enabled.length - 1;
  else if (isNext) nextIdx = currentIdx < enabled.length - 1 ? currentIdx + 1 : 0;
  else if (e.key === "Home") nextIdx = 0;
  else if (e.key === "End") nextIdx = enabled.length - 1;

  const nextItem = enabled[nextIdx];
  if (!nextItem) return;

  const nextOrigIdx = items.findIndex((i) => i.value === nextItem.value);
  tabEls[nextOrigIdx]?.focus();

  if (activationMode === "automatic") model.value = nextItem.value;
});

function activate(item: TabsItem) {
  if (!item.disabled) model.value = item.value;
}
</script>

<template>
  <div
    :data-akaza-orientation="orientation"
    :class="ui?.root"
    class="akaza-tabs"
  >
    <!-- Tab list -->
    <div
      ref="listRef"
      role="tablist"
      :aria-label="ariaLabel"
      :aria-orientation="orientation"
      :class="ui?.list"
      class="akaza-tab-list"
    >
      <button
        v-for="(item, index) in items"
        :key="item.value"
        :ref="(el) => setTabRef(el as HTMLElement | null, index)"
        type="button"
        role="tab"
        :id="`akaza-tab-${item.value}`"
        :aria-selected="isActive(item)"
        :aria-controls="`akaza-panel-${item.value}`"
        :aria-disabled="item.disabled || undefined"
        :tabindex="rovingValue === item.value ? 0 : -1"
        :data-akaza-state="isActive(item) ? 'active' : 'inactive'"
        :data-akaza-value="item.value"
        :data-akaza-disabled="item.disabled || undefined"
        :disabled="item.disabled"
        :class="ui?.tab"
        class="akaza-tab"
        @click="activate(item)"
        @keydown.enter.prevent="activate(item)"
        @keydown.space.prevent="activate(item)"
      >
        <slot name="tab" :item="item" :is-active="isActive(item)" :select="() => activate(item)">
          {{ getLabel(item) }}
        </slot>
      </button>

      <span
        class="akaza-tab-indicator"
        :class="ui?.indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />
    </div>

    <!-- Panels -->
    <div :class="ui?.panels" class="akaza-tab-panels">
      <template v-for="item in items" :key="item.value">
        <div
          v-if="!unmountOnHide || isActive(item)"
          v-show="isActive(item)"
          :id="`akaza-panel-${item.value}`"
          role="tabpanel"
          :aria-labelledby="`akaza-tab-${item.value}`"
          :tabindex="0"
          :data-akaza-state="isActive(item) ? 'active' : 'inactive'"
          :class="ui?.panel"
          class="akaza-tab-panel"
        >
          <slot :name="`panel-${item.value}`" :item="item" :is-active="isActive(item)" />
        </div>
      </template>
    </div>
  </div>
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

.akaza-tab-list[aria-orientation="horizontal"] .akaza-tab-indicator {
  bottom: 0;
  height: 2px;
}

.akaza-tab-list[aria-orientation="vertical"] .akaza-tab-indicator {
  left: 0;
  width: 2px;
}
</style>
