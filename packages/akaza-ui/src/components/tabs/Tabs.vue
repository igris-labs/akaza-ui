<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { TabsItem, TabsProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { isComposing } from "@ui-sdk/core";
import { computed, nextTick, onMounted, onUnmounted, ref, useId } from "vue";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { createChangeDetails } from "../../utils/changeEvent";

const {
  items,
  orientation = "horizontal",
  activationMode = "automatic",
  unmountOnHide = false,
  ariaLabel,
  labelKey = "label",
  ui,
} = defineProps<TabsProps>();

const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<string>({ default: "" });
const idBase = useId();

function getLabel(item: TabsItem): string {
  if (labelKey && (item as any)[labelKey] !== undefined) return String((item as any)[labelKey]);
  return item.label ?? item.value;
}

function isActive(item: TabsItem): boolean {
  return model.value === item.value;
}

function tabId(item: TabsItem): string {
  return `${idBase}-tab-${item.value}`;
}

function panelId(item: TabsItem): string {
  return `${idBase}-panel-${item.value}`;
}

// Roving tabindex: active tab, or first enabled if none active
const rovingValue = computed(() => {
  if (model.value && items.some((i) => i.value === model.value && !i.disabled)) return model.value;
  return items.find((i) => !i.disabled)?.value ?? "";
});
const roving = useRovingGroup({
  keys: () => items.map(item => item.value),
  disabled: key => {
    const item = items.find(item => item.value === key);
    return !item || Boolean(item.disabled);
  },
  preferred: () => rovingValue.value,
  orientation: () => orientation,
  loop: () => true,
  remember: false,
});

// ── Element refs for indicator ─────────────────────────────────

const tabEls: (HTMLElement | null)[] = [];
function setTabRef(el: HTMLElement | null, item: TabsItem, index: number) {
  tabEls[index] = el;
  roving.bind(item.value, el);
}

const listRef = ref<HTMLElement | null>(null);
const layoutVersion = ref(0);

const indicatorStyle = computed<CSSProperties>(() => {
  layoutVersion.value;
  if (!listRef.value) return { left: "0px", width: "0px", top: "0px", height: "0px" };
  const activeIdx = items.findIndex((i) => isActive(i));
  const activeEl = activeIdx >= 0 ? tabEls[activeIdx] : null;
  if (!activeEl) return { left: "0px", width: "0px", top: "0px", height: "0px" };
  const containerRect = listRef.value.getBoundingClientRect();
  const tabRect = activeEl.getBoundingClientRect();
  if (orientation === "horizontal") {
    return { left: `${tabRect.left - containerRect.left}px`, width: `${tabRect.width}px`, top: "", height: "" };
  } else {
    return { top: `${tabRect.top - containerRect.top}px`, height: `${tabRect.height}px`, left: "", width: "" };
  }
});

function refreshIndicator() {
  layoutVersion.value += 1;
}

let resizeObserver: ResizeObserver | undefined;
onMounted(async () => {
  await nextTick();
  refreshIndicator();
  if (typeof ResizeObserver !== "undefined" && listRef.value) {
    resizeObserver = new ResizeObserver(refreshIndicator);
    resizeObserver.observe(listRef.value);
    for (const el of tabEls) {
      if (el) resizeObserver.observe(el);
    }
  }
  window.addEventListener("resize", refreshIndicator, { passive: true });
});
onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", refreshIndicator);
});

// ── Keyboard navigation ────────────────────────────────────────

function onTabKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || isComposing(event)) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const item = items.find(item => tabId(item) === (event.currentTarget as HTMLElement).id);
    if (item) activate(item, event);
    return;
  }
  const movement = roving.keydown(event, event.currentTarget as HTMLElement);
  if (movement && activationMode === "automatic") {
    const item = items.find(item => item.value === movement.key);
    if (item) activate(item, event);
  }
}

function activate(item: TabsItem, event?: Event) {
  if (item.disabled) return;
  const changeEvent = createChangeDetails(event ? "trigger" : "programmatic", event);
  emit("value-change", item.value, changeEvent.details);
  if (!changeEvent.canceled()) model.value = item.value;
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
        :id="tabId(item)"
        :key="item.value"
        :ref="(el) => setTabRef(el as HTMLElement | null, item, index)"
        type="button"
        role="tab"
        :aria-selected="isActive(item)"
        :aria-controls="panelId(item)"
        :aria-disabled="item.disabled || undefined"
        :tabindex="roving.tabIndex(item.value)"
        :data-akaza-state="isActive(item) ? 'active' : 'inactive'"
        :data-akaza-value="item.value"
        :data-akaza-disabled="item.disabled || undefined"
        :disabled="item.disabled"
        :class="ui?.tab"
        class="akaza-tab"
        @click="activate(item, $event)"
        @keydown="onTabKeydown"
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
          :id="panelId(item)"
          role="tabpanel"
          :aria-labelledby="tabId(item)"
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
@layer akaza-reset {
  .akaza-tab-list {
    position: relative;
  }

  .akaza-tab-indicator {
    position: absolute;
    transition:
      left 0.2s ease,
      width 0.2s ease,
      top 0.2s ease,
      height 0.2s ease;
    pointer-events: none;
  }

  .akaza-tab-list[aria-orientation="horizontal"] .akaza-tab-indicator {
    bottom: 0;
  }

  .akaza-tab-list[aria-orientation="vertical"] .akaza-tab-indicator {
    left: 0;
  }
}
</style>
