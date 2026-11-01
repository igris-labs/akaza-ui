<script setup lang="ts">
import type { MenuItem, MenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, provide, useId, useSlots, useTemplateRef, watch } from "vue";
import { useMenu } from "../../composables/menu";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";
import { MENU_CONTEXT_KEY } from "./context";
import MenuPanel from "./MenuPanel.vue";
import { getMenuItemValue as getItemValue, normalizeMenuItems as normalizeItems, useMenuActions } from "./useMenuActions";

const {
  as = "div",
  dir = "ltr",
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
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", nextOpen, changeEvent.details);
  if (changeEvent.canceled()) return;
  nextOpen ? _open() : _close();
}

function open(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(true, details.reason, details.event);
}
function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(false, details.reason, details.event);
}
function toggle(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(!isOpen.value, details.reason, details.event);
}

const menuId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
useFocusBranch(contentRef);
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close("escape", event));

// ── Normalize items to groups ────────────────────────────────────────────────


const normalizedGroups = computed(() => normalizeItems(items));


// ── Positioning ──────────────────────────────────────────────────────────────

const localPositionStyle = computed(() => {
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

const { style: fixedPositionStyle } = useFloatingPosition({
  reference: rootRef,
  floating: contentRef,
  active: () => isOpen.value && teleport !== false,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  strategy: "fixed",
  collisionPadding: 4,
  flip: false,
  cssVarPrefix: "akaza-menu",
});
const positionStyle = computed(() =>
  teleport === false ? localPositionStyle.value : fixedPositionStyle.value,
);
const layeredPositionStyle = computed(() => ({
  ...positionStyle.value,
  ...(teleport !== false && { transform: undefined, transformOrigin: undefined }),
  "--akaza-layer-order": String(layerOrder.value),
}));


watch(isOpen, async (val, _previous, cleanup) => {
  let canceled = false;
  cleanup(() => { canceled = true; });
  if (val) {
    await nextTick();
    if (canceled) return;
    register();
    const first = panelRef.value?.getItems()?.[0];
    if (first) panelRef.value?.highlightItem(first);
  } else {
    unregister();
  }
}, { immediate: true });

onUnmounted(unregister);

// ── Dismiss ──────────────────────────────────────────────────────────────────

onClickOutside(rootRef, (e) => {
  if (isOpen.value) close("outside-click", e);
}, { ignore: [contentRef] });

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

const { onItemSelect, onCheckboxSelect, onRadioSelect, isRadioChecked } = useMenuActions({
  closeOnSelect: () => closeOnSelect,
  radioValues: () => radioValues,
  close,
  onSelect: (item, details) => emit("select", item, details),
  onCheckChange: (item, checked, details) => emit("check-change", item, checked, details),
  onRadioChange: (group, value, details) => emit("radio-change", group, value, details),
  onRadioValuesChange: values => emit("update:radioValues", values),
});

// ── Provide context for recursive MenuPanel ──────────────────────────────────

const slots = useSlots();

provide(MENU_CONTEXT_KEY, {
  get dir() { return dir; },
  get ui() { return ui; },
  get radioValues() { return radioValues; },
  get closeOnSelect() { return closeOnSelect; },
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
  <div
    ref="rootRef"
    :dir="dir"
    :class="ui?.root"
    :data-akaza-state="isOpen ? 'open' : 'closed'"
    class="akaza-menu-root"
  >
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
          ref="contentRef"
          :class="ui?.content"
          :style="layeredPositionStyle"
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
          ref="contentRef"
          :class="ui?.content"
          :style="layeredPositionStyle"
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
@layer akaza-reset {
  .akaza-menu-root {
    position: relative;
    display: inline-block;
    isolation: isolate;
  }

  .akaza-menu-content {
    position: absolute;
    z-index: var(--akaza-z-menu, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  /* Submenu positioning */
  .akaza-menu-submenu {
    position: relative;
  }

  .akaza-menu-submenu-content {
    position: fixed;
    z-index: var(--akaza-z-menu, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 2));
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
}
</style>
