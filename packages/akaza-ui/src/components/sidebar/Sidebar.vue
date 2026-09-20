<script setup lang="ts">
import type { CSSProperties } from "vue";
import type {
  SidebarProps,
  SidebarSizeChangeEventDetails,
  SidebarSlotProps,
  SidebarSlots,
} from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { useEventListener } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";
import { useSidebar } from "../../composables/sidebar";
import { resolveAction } from "../../utils/changeEvent";
import { Drawer } from "../drawer";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SidebarProps>(), {
  as: "aside",
  side: "left",
  collapsible: false,
  defaultOpen: false,
  defaultCollapsed: false,
  defaultSize: 256,
  minSize: 192,
  maxSize: 480,
  collapsedSize: 48,
  mobileSize: 288,
  resizeStep: 8,
  resizable: false,
  transition: true,
  breakpoint: "(max-width: 767px)",
  closeOnBackdropClick: true,
  closeOnNavigate: true,
  swipeToClose: true,
  teleport: "body",
  keyboardShortcut: false,
  ariaLabel: "Sidebar",
  resizeAriaLabel: "Resize sidebar",
});

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
  "collapsed-change": [collapsed: boolean, details: AkazaChangeEventDetails];
  "size-change": [size: number, details: SidebarSizeChangeEventDetails];
}>();

defineSlots<SidebarSlots>();

const openModel = defineModel<boolean | undefined>("open", { default: undefined });
const collapsedModel = defineModel<boolean | undefined>("collapsed", { default: undefined });
const sizeModel = defineModel<number>("size");
const internalOpen = ref(props.defaultOpen);
const internalCollapsed = ref(props.defaultCollapsed);
const internalSize = ref(props.defaultSize);

const openState = computed({
  get: () => openModel.value ?? internalOpen.value,
  set: (value: boolean) => {
    internalOpen.value = value;
    openModel.value = value;
  },
});
const collapsedState = computed({
  get: () => collapsedModel.value ?? internalCollapsed.value,
  set: (value: boolean) => {
    internalCollapsed.value = value;
    collapsedModel.value = value;
  },
});
const minimumSize = computed(() => Math.max(0, props.minSize));
const maximumSize = computed(() => Math.max(minimumSize.value, props.maxSize));
const clampSize = (value: number) => Math.min(maximumSize.value, Math.max(minimumSize.value, value));
const currentSize = computed({
  get: () => clampSize(sizeModel.value ?? internalSize.value),
  set: (value: number) => {
    const next = clampSize(value);
    internalSize.value = next;
    sizeModel.value = next;
  },
});

const sidebar = useSidebar({
  open: openState,
  collapsed: collapsedState,
  breakpoint: () => props.breakpoint,
  mobile: () => props.mobile,
});
const { isMobile } = sidebar;
const effectiveCollapsed = computed(() =>
  !isMobile.value && props.collapsible !== false && collapsedState.value,
);
const componentState = computed(() => {
  if (isMobile.value) return openState.value ? "open" : "closed";
  return effectiveCollapsed.value ? "collapsed" : "expanded";
});
const slotProps = computed<SidebarSlotProps>(() => ({
  open: openState.value,
  collapsed: isMobile.value ? false : effectiveCollapsed.value,
  isMobile: isMobile.value,
  state: componentState.value,
  size: currentSize.value,
  openMobile,
  closeMobile,
  toggleMobile,
  expand,
  collapse,
  toggleCollapsed,
  toggle,
  resetSize,
}));

const panelId = `akaza-sidebar-${useId().replace(/:/g, "")}`;
const isResizing = ref(false);
let resizePointerId: number | null = null;
let resizeStartX = 0;
let resizeStartSize = 0;

const rootStyle = computed<CSSProperties>(() => ({
  "--akaza-sidebar-size": `${currentSize.value}px`,
  "--akaza-sidebar-collapsed-size": `${Math.max(0, props.collapsedSize)}px`,
  "--akaza-sidebar-mobile-size": `${Math.max(0, props.mobileSize)}px`,
} as CSSProperties));

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

const mobileUi = computed(() => ({
  overlay: classes("akaza-sidebar-mobile-overlay", props.ui?.mobileOverlay),
  content: classes("akaza-sidebar-mobile-content", props.ui?.mobileContent),
  body: classes("akaza-sidebar-mobile-wrapper", props.ui?.mobileWrapper),
}));

function changeOpen(next: boolean, reason: string, event?: Event) {
  if (openState.value === next) return;
  let canceled = false;
  emit("open-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) openState.value = next;
}

function changeCollapsed(next: boolean, reason: string, event?: Event) {
  if (props.collapsible === false || collapsedState.value === next) return;
  let canceled = false;
  emit("collapsed-change", next, {
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) collapsedState.value = next;
}

function changeSize(next: number, reason: string, event?: Event) {
  const value = clampSize(next);
  const previousSize = currentSize.value;
  if (value === previousSize) return;
  let canceled = false;
  emit("size-change", value, {
    reason,
    previousSize,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  });
  if (!canceled) currentSize.value = value;
}

function openMobile(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeOpen(true, details.reason, details.event);
}

function closeMobile(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeOpen(false, details.reason, details.event);
}

function toggleMobile(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeOpen(!openState.value, details.reason, details.event);
}

function expand(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeCollapsed(false, details.reason, details.event);
}

function collapse(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeCollapsed(true, details.reason, details.event);
}

function toggleCollapsed(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeCollapsed(!collapsedState.value, details.reason, details.event);
}

function toggle(reasonOrEvent?: string | Event, event?: Event) {
  if (isMobile.value) toggleMobile(reasonOrEvent, event);
  else toggleCollapsed(reasonOrEvent, event);
}

function resetSize(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  changeSize(props.defaultSize, details.reason === "programmatic" ? "resize-reset" : details.reason, details.event);
}

function onDrawerOpenChange(next: boolean, details: AkazaChangeEventDetails) {
  let canceled = false;
  emit("open-change", next, {
    reason: details.reason,
    ...(details.event && { event: details.event }),
    cancel: () => { canceled = true; },
  });
  if (canceled) details.cancel();
}

function onMobileContentClick(event: MouseEvent) {
  if (!props.closeOnNavigate || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
  closeMobile("navigate", event);
}

function onResizePointerDown(event: PointerEvent) {
  if (event.button !== 0 || isMobile.value || effectiveCollapsed.value) return;
  event.preventDefault();
  resizePointerId = event.pointerId;
  resizeStartX = event.clientX;
  resizeStartSize = currentSize.value;
  isResizing.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}

function onResizePointerMove(event: PointerEvent) {
  if (!isResizing.value || resizePointerId !== event.pointerId) return;
  const delta = (event.clientX - resizeStartX) * (props.side === "left" ? 1 : -1);
  changeSize(resizeStartSize + delta, "pointer", event);
}

function stopResize(event?: PointerEvent) {
  if (!isResizing.value) return;
  const target = event?.currentTarget as HTMLElement | undefined;
  if (event && target?.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);
  isResizing.value = false;
  resizePointerId = null;
}

function onResizeKeydown(event: KeyboardEvent) {
  const factor = event.shiftKey ? 10 : 1;
  const step = Math.max(1, props.resizeStep) * factor;
  let next: number | undefined;
  if (event.key === "Home") next = minimumSize.value;
  else if (event.key === "End") next = maximumSize.value;
  else if (event.key === "ArrowLeft") next = currentSize.value + (props.side === "left" ? -step : step);
  else if (event.key === "ArrowRight") next = currentSize.value + (props.side === "left" ? step : -step);
  if (next === undefined) return;
  event.preventDefault();
  changeSize(next, "keyboard", event);
}

function onShortcut(event: KeyboardEvent) {
  if (!props.keyboardShortcut || !(event.metaKey || event.ctrlKey) || event.altKey) return;
  if (event.key.toLocaleLowerCase() !== props.keyboardShortcut.toLocaleLowerCase()) return;
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
  event.preventDefault();
  toggle("shortcut", event);
}

useEventListener("keydown", onShortcut);

watch(isMobile, (mobile) => {
  stopResize();
  if (!mobile && openState.value) closeMobile("responsive");
});

onBeforeUnmount(() => stopResize());

defineExpose({
  openValue: openState,
  collapsedValue: collapsedState,
  sizeValue: currentSize,
  open: openMobile,
  close: closeMobile,
  openMobile,
  closeMobile,
  toggleMobile,
  toggle,
  expand,
  collapse,
  toggleCollapsed,
  resetSize,
  isMobile,
  state: componentState,
});
</script>

<template>
  <div
    v-bind="$attrs"
    :class="ui?.root"
    :style="rootStyle"
    class="akaza-sidebar-root"
    :data-akaza-state="componentState"
    :data-akaza-side="side"
    :data-akaza-mobile="isMobile || undefined"
    :data-akaza-collapsible="collapsible || undefined"
    :data-akaza-collapsed="effectiveCollapsed || undefined"
    :data-akaza-resizing="isResizing || undefined"
    :data-akaza-transition="transition || undefined"
  >
    <component
      :is="as"
      v-if="!isMobile"
      :id="panelId"
      :aria-label="ariaLabel"
      :aria-hidden="collapsible === 'offcanvas' && effectiveCollapsed || undefined"
      :inert="collapsible === 'offcanvas' && effectiveCollapsed || undefined"
      :class="ui?.panel"
      class="akaza-sidebar-panel"
      :data-akaza-state="effectiveCollapsed ? 'collapsed' : 'expanded'"
      :data-akaza-side="side"
    >
      <div v-if="$slots.header" :class="ui?.header" class="akaza-sidebar-header">
        <slot name="header" v-bind="slotProps" />
      </div>

      <div :class="ui?.body" class="akaza-sidebar-body">
        <slot v-bind="slotProps" />
      </div>

      <div v-if="$slots.footer" :class="ui?.footer" class="akaza-sidebar-footer">
        <slot name="footer" v-bind="slotProps" />
      </div>
    </component>

    <div
      v-if="!isMobile && resizable && !effectiveCollapsed"
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      :aria-label="resizeAriaLabel"
      :aria-controls="panelId"
      :aria-valuemin="minimumSize"
      :aria-valuemax="maximumSize"
      :aria-valuenow="currentSize"
      :class="ui?.resizeHandle"
      class="akaza-sidebar-resize-handle"
      :data-akaza-side="side"
      :data-akaza-resizing="isResizing || undefined"
      @dblclick="resetSize('resize-reset', $event)"
      @keydown="onResizeKeydown"
      @pointerdown="onResizePointerDown"
      @pointermove="onResizePointerMove"
      @pointerup="stopResize"
      @pointercancel="stopResize"
      @lostpointercapture="stopResize"
    >
      <slot name="resize-handle" v-bind="slotProps" />
    </div>

    <Drawer
      v-if="isMobile"
      v-model="openState"
      :side="side ?? 'left'"
      :aria-label="ariaLabel ?? 'Sidebar'"
      :close-on-backdrop-click="closeOnBackdropClick ?? true"
      :swipe-to-close="swipeToClose ?? true"
      :teleport="teleport ?? 'body'"
      :ui="mobileUi"
      @open-change="onDrawerOpenChange"
    >
      <template #body>
        <div
          :id="panelId"
          :class="ui?.panel"
          class="akaza-sidebar-panel"
          data-akaza-state="open"
          :data-akaza-side="side"
          data-akaza-mobile
          @click="onMobileContentClick"
        >
          <div v-if="$slots.header" :class="ui?.header" class="akaza-sidebar-header">
            <slot name="header" v-bind="slotProps" />
          </div>

          <div :class="ui?.body" class="akaza-sidebar-body">
            <slot v-bind="slotProps" />
          </div>

          <div v-if="$slots.footer" :class="ui?.footer" class="akaza-sidebar-footer">
            <slot name="footer" v-bind="slotProps" />
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-sidebar-root {
    position: relative;
    display: flex;
    flex: none;
    width: var(--akaza-sidebar-size, 256px);
    min-width: 0;
  }

  .akaza-sidebar-root[data-akaza-transition] {
    transition: width var(--akaza-sidebar-transition-duration, 200ms) var(--akaza-sidebar-transition-easing, ease-out);
  }

  .akaza-sidebar-root[data-akaza-mobile] {
    display: contents;
  }

  .akaza-sidebar-root[data-akaza-collapsible="icon"][data-akaza-collapsed] {
    width: var(--akaza-sidebar-collapsed-size, 48px);
  }

  .akaza-sidebar-root[data-akaza-collapsible="offcanvas"][data-akaza-collapsed] {
    width: 0;
    overflow: clip;
  }

  .akaza-sidebar-panel {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
  }

  .akaza-sidebar-root[data-akaza-collapsible="offcanvas"] > .akaza-sidebar-panel {
    width: var(--akaza-sidebar-size, 256px);
    flex: none;
  }

  .akaza-sidebar-root[data-akaza-transition] > .akaza-sidebar-panel {
    transition: transform var(--akaza-sidebar-transition-duration, 200ms) var(--akaza-sidebar-transition-easing, ease-out);
  }

  .akaza-sidebar-root[data-akaza-collapsible="offcanvas"][data-akaza-collapsed][data-akaza-side="left"] > .akaza-sidebar-panel {
    transform: translateX(-100%);
  }

  .akaza-sidebar-root[data-akaza-collapsible="offcanvas"][data-akaza-collapsed][data-akaza-side="right"] > .akaza-sidebar-panel {
    transform: translateX(100%);
  }

  .akaza-sidebar-header,
  .akaza-sidebar-footer {
    flex: none;
  }

  .akaza-sidebar-body {
    min-width: 0;
    min-height: 0;
    flex: 1;
    overflow: auto;
  }

  .akaza-sidebar-resize-handle {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    width: 12px;
    cursor: col-resize;
    touch-action: none;
    user-select: none;
  }

  .akaza-sidebar-resize-handle[data-akaza-side="left"] {
    right: -6px;
  }

  .akaza-sidebar-resize-handle[data-akaza-side="right"] {
    left: -6px;
  }

  .akaza-sidebar-mobile-content {
    width: min(var(--akaza-sidebar-mobile-size, 288px), 100dvw);
    max-width: 100dvw;
  }

  .akaza-sidebar-mobile-wrapper {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1;
  }

  .akaza-sidebar-mobile-wrapper > .akaza-sidebar-panel {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-sidebar-root,
    .akaza-sidebar-panel {
      transition-duration: 1ms !important;
    }
  }
}
</style>
