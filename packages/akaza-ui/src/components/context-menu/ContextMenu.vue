<script setup lang="ts">
import type { ContextMenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, provide, ref, useId, useSlots, useTemplateRef, watch } from "vue";
import { createChangeDetails } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";
import { MENU_CONTEXT_KEY } from "../menu/context";
import MenuPanel from "../menu/MenuPanel.vue";
import { getMenuItemValue as getItemValue, normalizeMenuItems as normalizeItems, useMenuActions } from "../menu/useMenuActions";

const {
  items,
  disabled = false,
  dir = "ltr",
  closeOnSelect = true,
  radioValues,
  sideOffset = 4,
  longPressDelay = 700,
  restoreFocus = true,
  teleport = "body",
  ui,
} = defineProps<ContextMenuProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  select: [item: MenuItem, details: AkazaChangeEventDetails];
  "check-change": [item: MenuItem, checked: boolean, details: AkazaChangeEventDetails];
  "radio-change": [group: string, value: string, details: AkazaChangeEventDetails];
  "update:radioValues": [values: Record<string, string>];
}>();

const model = defineModel<boolean>({ default: false });
const contentRef = useTemplateRef<HTMLElement>("contentRef");
useFocusBranch(contentRef);
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const menuId = `akaza-context-menu-${useId()}`;
const point = ref({ x: 0, y: 0 });
const pointerAnchor = computed(() => {
  const { x, y } = point.value;
  return { getBoundingClientRect: () => new DOMRect(x, y, 0, 0) };
});
const { style: positionStyle, actualSide, actualAlign, update: computePosition } = useFloatingPosition({
  reference: pointerAnchor,
  floating: contentRef,
  active: model,
  side: "right",
  align: "start",
  sideOffset: () => sideOffset,
  alignOffset: () => sideOffset,
  flipAlign: true,
  collisionPadding: 4,
  strategy: "fixed",
  cssVarPrefix: "akaza-context-menu",
});
let previousFocus: HTMLElement | null = null;
let longPressTimer: number | undefined;
let pressStart: { x: number; y: number } | null = null;
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close("escape", event));
const layeredPositionStyle = computed(() => ({ ...positionStyle.value, "--akaza-layer-order": String(layerOrder.value) }));


const normalizedGroups = computed(() => normalizeItems(items));


function setOpen(next: boolean, reason: string, event?: Event) {
  if (disabled && next) return;
  if (model.value === next) return;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", next, changeEvent.details);
  if (changeEvent.canceled()) return;
  model.value = next;
  if (!next && restoreFocus && reason !== "outside-click") {
    nextTick(() => previousFocus?.focus({ preventScroll: true }));
  }
}

function close(reason = "programmatic", event?: Event) {
  setOpen(false, reason, event);
}

function openAt(x: number, y: number, reason = "programmatic", event?: Event) {
  point.value = { x, y };
  if (event?.target instanceof HTMLElement) previousFocus = event.target;
  else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) previousFocus = document.activeElement;
  if (model.value) {
    void nextTick().then(() => {
      computePosition();
      const first = panelRef.value?.getItems()?.[0];
      if (first) panelRef.value?.highlightItem(first);
    });
    return;
  }
  setOpen(true, reason, event);
}

function onContextmenu(event: MouseEvent) {
  if (disabled) return;
  event.preventDefault();
  openAt(event.clientX, event.clientY, "contextmenu", event);
}

function onRootKeydown(event: KeyboardEvent) {
  if (disabled || (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))) return;
  event.preventDefault();
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  openAt(rect.left, rect.bottom, "keyboard", event);
}

function clearLongPress() {
  if (typeof window !== "undefined") window.clearTimeout(longPressTimer);
  longPressTimer = undefined;
  pressStart = null;
}

function onPointerDown(event: PointerEvent) {
  if (disabled || longPressDelay <= 0 || event.pointerType === "mouse") return;
  clearLongPress();
  pressStart = { x: event.clientX, y: event.clientY };
  longPressTimer = window.setTimeout(() => {
    openAt(event.clientX, event.clientY, "long-press", event);
    clearLongPress();
  }, longPressDelay);
}

function onPointerMove(event: PointerEvent) {
  if (!pressStart) return;
  if (Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 10) clearLongPress();
}


function onContentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close("escape", event);
  }
}

const { onItemSelect, onCheckboxSelect, onRadioSelect, isRadioChecked } = useMenuActions({
  closeOnSelect: () => closeOnSelect,
  radioValues: () => radioValues,
  close,
  onSelect: (item, details) => emit("select", item, details),
  onCheckChange: (item, checked, details) => emit("check-change", item, checked, details),
  onRadioChange: (group, value, details) => emit("radio-change", group, value, details),
  onRadioValuesChange: values => emit("update:radioValues", values),
});

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

watch(model, async (open, _previous, cleanup) => {
  let canceled = false;
  cleanup(() => { canceled = true; });
  if (open) {
    await nextTick();
    if (canceled) return;
    register();
    computePosition();
    const first = panelRef.value?.getItems()?.[0];
    if (first) panelRef.value?.highlightItem(first);
  } else {
    unregister();
  }
}, { immediate: true });

watch(() => disabled, (value) => {
  if (value && model.value) close("disabled");
});

onClickOutside(contentRef, (event) => {
  if (model.value) close("outside-click", event);
});

onUnmounted(() => {
  clearLongPress();
  unregister();
});

defineExpose({ openAt, close });
</script>

<template>
  <div
    :class="ui?.root"
    :dir="dir"
    :data-akaza-state="model ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-context-menu-root"
    @contextmenu="onContextmenu"
    @keydown="onRootKeydown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="clearLongPress"
    @pointercancel="clearLongPress"
  >
    <slot
      :is-open="model"
      :open-at="openAt"
      :close="close"
    />

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition name="akaza-context-menu">
        <div
          v-if="model"
          :id="menuId"
          ref="contentRef"
          :class="ui?.content"
          :style="layeredPositionStyle"
          data-akaza-state="open"
          :data-akaza-side="actualSide"
          :data-akaza-align="actualAlign"
          class="akaza-context-menu-content akaza-menu-content"
          @keydown="onContentKeydown"
        >
          <MenuPanel ref="panelRef" :items="normalizedGroups" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-context-menu-root {
    display: contents;
  }

  .akaza-context-menu-content {
    z-index: var(--akaza-z-context-menu, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  .akaza-context-menu-enter-active,
  .akaza-context-menu-leave-active {
    transition:
      opacity var(--akaza-context-menu-duration, 120ms) ease-out,
      scale var(--akaza-context-menu-duration, 120ms) ease-out,
      translate var(--akaza-context-menu-duration, 120ms) ease-out;
  }

  .akaza-context-menu-enter-from,
  .akaza-context-menu-leave-to {
    opacity: 0;
    scale: 0.98;
  }

  .akaza-context-menu-enter-from[data-akaza-side="right"],
  .akaza-context-menu-leave-to[data-akaza-side="right"] { translate: -4px 0; }
  .akaza-context-menu-enter-from[data-akaza-side="left"],
  .akaza-context-menu-leave-to[data-akaza-side="left"] { translate: 4px 0; }

  @media (prefers-reduced-motion: reduce) {
    .akaza-context-menu-enter-active,
    .akaza-context-menu-leave-active {
      transition-duration: 0.01ms;
    }
  }
}
</style>
