<script setup lang="ts">
import type { ContextMenuProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { MenuItem } from "../menu";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, provide, ref, useSlots, useTemplateRef, watch } from "vue";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { MENU_CONTEXT_KEY } from "../menu/context";
import MenuPanel from "../menu/MenuPanel.vue";

const {
  items,
  disabled = false,
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
const menuId = `akaza-context-menu-${Math.random().toString(36).slice(2)}`;
const point = ref({ x: 0, y: 0 });
const positionStyle = ref<Record<string, string>>({ top: "-9999px", left: "-9999px" });
const actualSide = ref<"left" | "right">("right");
const actualAlign = ref<"start" | "end">("start");
let previousFocus: HTMLElement | null = null;
let longPressTimer: number | undefined;
let pressStart: { x: number; y: number } | null = null;
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close("escape", event));

function normalizeItems(raw?: MenuItem[] | MenuItem[][]): MenuItem[][] {
  if (!raw?.length) return [];
  return Array.isArray(raw[0]) ? (raw as MenuItem[][]) : [raw as MenuItem[]];
}

const normalizedGroups = computed(() => normalizeItems(items));

function getItemValue(item: MenuItem): string {
  return (item.value ?? item.label ?? "") as string;
}

function setOpen(next: boolean, reason: string, event?: Event) {
  if (disabled && next) return;
  if (model.value === next) return;
  let canceled = false;
  emit("open-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) return;
  model.value = next;
  if (!next && restoreFocus && reason !== "outside-click") {
    nextTick(() => previousFocus?.focus());
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

function computePosition() {
  if (typeof window === "undefined" || !contentRef.value) return;
  const content = contentRef.value.getBoundingClientRect();
  const padding = 4;
  const right = point.value.x + sideOffset;
  const left = point.value.x - content.width - sideOffset;
  const below = point.value.y + sideOffset;
  const above = point.value.y - content.height - sideOffset;
  const useLeft = right + content.width + padding > window.innerWidth && left >= padding;
  const useAbove = below + content.height + padding > window.innerHeight && above >= padding;
  const resolvedLeft = Math.max(padding, Math.min(useLeft ? left : right, window.innerWidth - content.width - padding));
  const resolvedTop = Math.max(padding, Math.min(useAbove ? above : below, window.innerHeight - content.height - padding));

  actualSide.value = useLeft ? "left" : "right";
  actualAlign.value = useAbove ? "end" : "start";
  positionStyle.value = {
    position: "fixed",
    left: `${resolvedLeft}px`,
    top: `${resolvedTop}px`,
    transformOrigin: `${useLeft ? "right" : "left"} ${useAbove ? "bottom" : "top"}`,
  };
}

function onContentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close("escape", event);
  }
}

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
  if (!canceled) item.onUpdateChecked?.(next);
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
  if (!canceled && radioValues) emit("update:radioValues", { ...radioValues, [group]: value });
}

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

watch(model, async (open) => {
  if (open) {
    await nextTick();
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

onClickOutside(rootRef, (event) => {
  if (model.value) close("outside-click", event);
}, { ignore: [contentRef] });

onUnmounted(() => {
  clearLongPress();
  unregister();
});

defineExpose({ openAt, close });
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
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
          :style="positionStyle"
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
.akaza-context-menu-root {
  display: contents;
}

.akaza-context-menu-content {
  z-index: var(--akaza-z-context-menu, 1000);
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
</style>
