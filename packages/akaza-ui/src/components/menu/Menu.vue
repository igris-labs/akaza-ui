<script setup lang="ts">
import type { MenuItem, MenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, provide, useId, useSlots, useTemplateRef, watch } from "vue";
import { useMenu } from "../../composables/menu";
import { MENU_CONTEXT_KEY } from "./context";
import MenuPanel from "./MenuPanel.vue";

const {
  as = "div",
  items,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  closeOnSelect = true,
  radioValues,
  teleport = false,
  ui,
} = defineProps<MenuProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  select: [item: MenuItem, details: AkazaChangeEventDetails];
  "check-change": [item: MenuItem, checked: boolean, details: AkazaChangeEventDetails];
  "radio-change": [group: string, value: string, details: AkazaChangeEventDetails];
  "update:radioValues": [values: Record<string, string>];
}>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close, toggle: _toggle } = useMenu(model);

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  let canceled = false;
  emit("open-change", nextOpen, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  nextOpen ? _open() : _close();
}

function open(reason = "programmatic", event?: Event) {
  handleChange(true, reason, event);
}
function close(reason = "programmatic", event?: Event) {
  handleChange(false, reason, event);
}
function toggle(reason = "programmatic", event?: Event) {
  handleChange(!isOpen.value, reason, event);
}

const menuId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");

// ── Normalize items to groups ────────────────────────────────────────────────

function normalizeItems(raw?: MenuItem[] | MenuItem[][]): MenuItem[][] {
  if (!raw?.length) return [];
  return Array.isArray(raw[0]) ? (raw as MenuItem[][]) : [raw as MenuItem[]];
}

const normalizedGroups = computed(() => normalizeItems(items));

function getItemValue(item: MenuItem): string {
  return (item.value ?? item.label ?? "") as string;
}

// ── Positioning ──────────────────────────────────────────────────────────────

const positionStyle = computed(() => {
  const offset = `${sideOffset}px`;
  const s: Record<string, string> = {};

  if (side === "bottom") s.top = `calc(100% + ${offset})`;
  else if (side === "top") s.bottom = `calc(100% + ${offset})`;
  else if (side === "right") s.left = `calc(100% + ${offset})`;
  else if (side === "left") s.right = `calc(100% + ${offset})`;

  if (side === "top" || side === "bottom") {
    if (align === "start") s.left = "0";
    else if (align === "end") s.right = "0";
    else {
      s.left = "50%";
      s.transform = "translateX(-50%)";
    }
  } else {
    if (align === "start") s.top = "0";
    else if (align === "end") s.bottom = "0";
    else {
      s.top = "50%";
      s.transform = "translateY(-50%)";
    }
  }

  return s;
});

// ── Auto-focus first item on open ────────────────────────────────────────────

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    const first = panelRef.value?.getItems()?.[0];
    if (first) panelRef.value?.highlightItem(first);
  }
});

// ── Dismiss ──────────────────────────────────────────────────────────────────

onClickOutside(rootRef, (e) => {
  if (isOpen.value) close("outside-click", e);
});

// Boundary keydown on the content wrapper — prevents menu keyboard events
// from leaking to the rest of the page (e.g. scrolling, triggering other components).
const NAV_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Escape",
]);

function onContentKeydown(e: KeyboardEvent) {
  if (NAV_KEYS.has(e.key) || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
    e.stopPropagation();
  }
  // Escape at the content boundary = close the entire menu
  if (e.key === "Escape") {
    e.preventDefault();
    close("escape", e);
  }
}

// ── Item handlers ────────────────────────────────────────────────────────────

function onItemSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  let canceled = false;
  emit("select", item, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  item.onSelect?.();
  if (closeOnSelect) close("select", event);
}

function onCheckboxSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  const next = !item.checked;
  let canceled = false;
  emit("check-change", item, next, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  item.onUpdateChecked?.(next);
}

function isRadioChecked(item: MenuItem): boolean {
  return radioValues?.[item.radioGroup ?? ""] === item.value;
}

function onRadioSelect(item: MenuItem, event: Event) {
  if (item.disabled) return;
  const group = item.radioGroup ?? "";
  const value = (item.value ?? "") as string;
  let canceled = false;
  emit("radio-change", group, value, {
    reason: "select",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  if (radioValues) {
    emit("update:radioValues", { ...radioValues, [group]: value });
  }
}

// ── Provide context for recursive MenuPanel ──────────────────────────────────

const slots = useSlots();

provide(MENU_CONTEXT_KEY, {
  ui,
  radioValues,
  closeOnSelect,
  closeMenu: close,
  onItemSelect,
  onCheckboxSelect,
  onRadioSelect,
  isRadioChecked,
  getItemValue,
  normalizeItems,
  rootSlots: slots,
});

// ── Trigger props for ARIA ───────────────────────────────────────────────────

const triggerProps = computed(() => ({
  "aria-haspopup": "menu" as const,
  "aria-expanded": isOpen.value,
  "aria-controls": isOpen.value ? menuId : undefined,
}));

defineExpose({ open, close, toggle });
</script>

<template>
  <div ref="rootRef" :data-akaza-state="isOpen ? 'open' : 'closed'" class="akaza-menu-root">
    <slot
      name="trigger"
      :is-open="isOpen"
      :open="open"
      :close="close"
      :toggle="toggle"
      :trigger-props="triggerProps"
    />

    <Teleport v-if="teleport !== false" :to="typeof teleport === 'string' ? teleport : 'body'">
      <Transition name="akaza-menu">
        <component
          :is="as"
          v-if="isOpen"
          :id="menuId"
          :class="ui?.content"
          :style="positionStyle"
          :data-akaza-side="side"
          :data-akaza-align="align"
          data-akaza-state="open"
          class="akaza-menu-content"
          @keydown="onContentKeydown"
        >
          <MenuPanel ref="panelRef" :items="normalizedGroups" />
        </component>
      </Transition>
    </Teleport>

    <template v-if="teleport === false">
      <Transition name="akaza-menu">
        <component
          :is="as"
          v-if="isOpen"
          :id="menuId"
          :class="ui?.content"
          :style="positionStyle"
          :data-akaza-side="side"
          :data-akaza-align="align"
          data-akaza-state="open"
          class="akaza-menu-content"
          @keydown="onContentKeydown"
        >
          <MenuPanel ref="panelRef" :items="normalizedGroups" />
        </component>
      </Transition>
    </template>
  </div>
</template>

<style>
.akaza-menu-root {
  position: relative;
  display: inline-block;
  isolation: isolate;
}

.akaza-menu-content {
  position: absolute;
  z-index: 50;
}

/* Submenu positioning */
.akaza-menu-submenu {
  position: relative;
}

.akaza-menu-submenu-content {
  position: absolute;
  left: 100%;
  top: 0;
  z-index: 50;
}

/* Transition */
.akaza-menu-enter-active,
.akaza-menu-leave-active {
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out;
}

.akaza-menu-enter-from,
.akaza-menu-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
