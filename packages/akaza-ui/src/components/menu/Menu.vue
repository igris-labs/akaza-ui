<script setup lang="ts">
import type { MenuItem, MenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, nextTick, provide, shallowRef, useId, useSlots, useTemplateRef, watch } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { useMenu } from "../../composables/menu";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";
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
const { isOpen, open: _open, close: _close } = useMenu(model);
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const openingTrigger = shallowRef<HTMLElement | null>(null);

function getTrigger() {
  const root = rootRef.value;
  if (openingTrigger.value && root?.contains(openingTrigger.value)) return openingTrigger.value;
  return root?.querySelector<HTMLElement>('[aria-haspopup="menu"]:not(.akaza-menu-submenu-trigger)') ?? null;
}

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  if (nextOpen === isOpen.value) return;
  reason = reason === "escape-key" ? "escape" : reason === "outside-press" ? "outside-click" : reason;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", nextOpen, changeEvent.details);
  if (changeEvent.canceled()) return;
  if (nextOpen) {
    const target = event?.currentTarget;
    openingTrigger.value = target instanceof HTMLElement && rootRef.value?.contains(target)
      ? target
      : getTrigger();
  }
  nextOpen ? _open() : _close();
}

const menuId = useId();
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");

// ── Normalize items to groups ────────────────────────────────────────────────


const normalizedGroups = computed(() => normalizeItems(items));


// ── Positioning ──────────────────────────────────────────────────────────────

const popup = usePopup({
  kind: "menu",
  open: isOpen,
  content: contentRef,
  // Include other trigger-slot controls without changing placement or return focus.
  trigger: () => getTrigger() ? rootRef.value : null,
  anchor: getTrigger,
  initialFocus: "none",
  finalFocus: getTrigger,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: () => 4,
  cssVarPrefix: "akaza-menu",
  constrainSize: true,
  transition: () => "akaza-menu",
  request: handleChange,
});
const { present, contentAttrs, triggerAttrs, actualSide, actualAlign } = popup;
const layeredPositionStyle = computed(() => ({
  ...popup.style.value,
  transform: undefined,
  transformOrigin: undefined,
  "--akaza-layer-order": String(popup.layerOrder.value),
}));

function open(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  const target = details.event?.currentTarget;
  if (target instanceof HTMLElement && rootRef.value?.contains(target)) openingTrigger.value = target;
  popup.setOpen(true, details.reason, details.event);
}
function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  popup.setOpen(false, details.reason, details.event);
}
function toggle(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  if (isOpen.value) close(details.reason, details.event);
  else open(details.reason, details.event);
}


watch(isOpen, async (val, _previous, cleanup) => {
  let canceled = false;
  cleanup(() => { canceled = true; });
  if (val) {
    await nextTick();
    if (canceled) return;
    const first = panelRef.value?.getItems()?.[0];
    if (first) panelRef.value?.highlightItem(first);
  }
}, { immediate: true });

// ── Dismiss ──────────────────────────────────────────────────────────────────

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
  ...triggerAttrs.value,
  "aria-haspopup": "menu" as const,
  "aria-expanded": isOpen.value,
  "aria-controls": isOpen.value ? menuId : undefined,
}));

defineExpose({ open, close, toggle });
</script>

<template>
  <div
    ref="rootRef"
    :role="getTrigger() ? 'group' : undefined"
    :aria-labelledby="getTrigger()?.getAttribute('aria-labelledby') || getTrigger()?.id || undefined"
    :aria-label="getTrigger()?.getAttribute('aria-label') || getTrigger()?.textContent?.trim()"
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
      <component
        :is="as"
        v-if="present"
        v-bind="contentAttrs"
        :id="menuId"
        ref="contentRef"
        role="presentation"
        :dir="dir"
        :class="ui?.content"
        :style="layeredPositionStyle"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :data-akaza-state="isOpen ? 'open' : 'closed'"
        class="akaza-menu-content"
        @keydown="onContentKeydown"
      >
        <MenuPanel ref="panelRef" :items="normalizedGroups" :open="isOpen" />
      </component>
    </Teleport>

    <template v-if="teleport === false">
      <component
        :is="as"
        v-if="present"
        v-bind="contentAttrs"
        :id="menuId"
        ref="contentRef"
        role="presentation"
        :dir="dir"
        :class="ui?.content"
        :style="layeredPositionStyle"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :data-akaza-state="isOpen ? 'open' : 'closed'"
        class="akaza-menu-content"
        @keydown="onContentKeydown"
      >
        <MenuPanel ref="panelRef" :items="normalizedGroups" :open="isOpen" />
      </component>
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
