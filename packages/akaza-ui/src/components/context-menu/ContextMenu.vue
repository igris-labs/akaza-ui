<script setup lang="ts">
import type { ContextMenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { bindHold } from "@ui-sdk/core";
import { clamp } from "@ui-sdk/core/number";
import { computed, nextTick, provide, ref, shallowRef, useId, useSlots, useTemplateRef, watch, watchPostEffect } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails } from "../../utils/changeEvent";
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
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const panelRef = useTemplateRef<InstanceType<typeof MenuPanel>>("panelRef");
const menuId = `akaza-context-menu-${useId()}`;
const point = ref({ x: 0, y: 0 });
const pointerAnchor = computed(() => {
  const { x, y } = point.value;
  // A stored pointer can leave the viewport after resize; keep the SDK anchor valid.
  return { getBoundingClientRect: () => new DOMRect(
    clamp(x, 4, Math.max(4, document.documentElement.clientWidth - 4)),
    clamp(y, 4, Math.max(4, document.documentElement.clientHeight - 4)),
    0, 0,
  ) };
});
const previousFocus = shallowRef<HTMLElement | null>(null);
const popup = usePopup({
  kind: "menu",
  open: model,
  content: contentRef,
  trigger: () => previousFocus.value?.isConnected ? previousFocus.value : null,
  anchor: () => pointerAnchor.value,
  initialFocus: "none",
  get finalFocus() { return restoreFocus ? () => previousFocus.value : "none" as const; },
  disabled: () => disabled,
  side: () => "right",
  align: () => "start",
  sideOffset: () => sideOffset,
  alignOffset: () => sideOffset,
  collisionPadding: () => 4,
  cssVarPrefix: "akaza-context-menu",
  constrainSize: true,
  transition: () => "akaza-context-menu",
  request: commitOpen,
});
const { present, contentAttrs, actualSide, actualAlign } = popup;
const layeredPositionStyle = computed(() => ({ ...popup.style.value, "--akaza-layer-order": String(popup.layerOrder.value) }));


const normalizedGroups = computed(() => normalizeItems(items));


function commitOpen(next: boolean, reason: string, event?: Event) {
  reason = reason === "escape-key" ? "escape" : reason === "outside-press" ? "outside-click" : reason;
  if (disabled && next) return;
  if (model.value === next) return;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", next, changeEvent.details);
  if (changeEvent.canceled()) return;
  model.value = next;
}

function close(reason = "programmatic", event?: Event) {
  popup.setOpen(false, reason, event);
}

function openAt(x: number, y: number, reason = "programmatic", event?: Event) {
  point.value = { x, y };
  if (event?.target instanceof HTMLElement) previousFocus.value = event.target;
  else if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) previousFocus.value = document.activeElement;
  if (model.value) {
    void nextTick().then(() => {
      const first = panelRef.value?.getItems()?.[0];
      if (first) panelRef.value?.highlightItem(first);
    });
    return;
  }
  popup.setOpen(true, reason, event);
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

watchPostEffect((cleanup) => {
  const root = rootRef.value;
  if (!root || longPressDelay <= 0) return;
  cleanup(bindHold(root, {
    delay: longPressDelay,
    tolerance: 10,
    keys: [],
    disabled: () => disabled,
    onPress: ({ input, event }) => (input === "touch" || input === "pen")
      && !event.defaultPrevented && !contentRef.value?.contains(event.target as Node),
    onHold: ({ event }) => {
      if (event instanceof PointerEvent) openAt(event.clientX, event.clientY, "long-press", event);
    },
  }));
});


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
    const first = panelRef.value?.getItems()?.[0];
    if (first) panelRef.value?.highlightItem(first);
  }
}, { immediate: true });

watch(() => disabled, (value) => {
  if (value && model.value) close("disabled");
});

defineExpose({ openAt, close });
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    :dir="dir"
    :data-akaza-state="model ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-context-menu-root"
    @contextmenu="onContextmenu"
    @keydown="onRootKeydown"
  >
    <slot
      :is-open="model"
      :open-at="openAt"
      :close="close"
    />

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <div
        v-if="present"
        v-bind="contentAttrs"
        :id="menuId"
        ref="contentRef"
        role="presentation"
        :dir="dir"
        :class="ui?.content"
        :style="layeredPositionStyle"
        :data-akaza-state="model ? 'open' : 'closed'"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        class="akaza-context-menu-content akaza-menu-content"
      >
        <MenuPanel ref="panelRef" :items="normalizedGroups" :open="model" />
      </div>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-context-menu-root {
    display: contents;
  }

  .akaza-context-menu-content {
    transform-origin: var(--akaza-context-menu-transform-origin);
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
