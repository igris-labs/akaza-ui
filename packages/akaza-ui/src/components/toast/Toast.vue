<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { ToastProps, ToastSwipeDirection } from ".";
import type { ToastCloseReason, ToastItem } from "../../composables/toast";
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { useToast } from "../../composables/toast";

const {
  position = "bottom-right",
  limit = 3,
  stack = true,
  gap = 12,
  peek = 12,
  scaleStep = 0.1,
  hotkey = ["F8"],
  hotkeyLabel = "Notifications",
  closeLabel = "Dismiss notification",
  swipeDirection,
  swipeThreshold = 50,
  pauseOnHover = true,
  pauseOnFocus = true,
  pauseOnWindowBlur = true,
  teleport = "body",
  manager,
  ui,
} = defineProps<ToastProps>();

const emit = defineEmits<{
  "action-error": [error: unknown, toast: ToastItem];
  "swipe-start": [toast: ToastItem, event: PointerEvent];
  "swipe-move": [toast: ToastItem, event: PointerEvent];
  "swipe-cancel": [toast: ToastItem, event: PointerEvent];
  "swipe-end": [toast: ToastItem, event: PointerEvent];
}>();

const viewportRef = useTemplateRef<HTMLOListElement>("viewportRef");
const expanded = ref(false);
const toast = useToast(manager);
const { toasts, close, pause, resume } = toast;
const swipe = ref<{ id: string; pointerId: number; x: number; y: number } | null>(null);
const toastHeights = ref<Record<string, number>>({});
const toastElements = new Map<string, HTMLElement>();
const pauseReasons = new Set<string>();
let resizeObserver: ResizeObserver | undefined;

const side = computed(() => position.split("-")[0]!);
const align = computed(() => position.split("-")[1]!);
const resolvedSwipeDirection = computed<ToastSwipeDirection>(() => {
  if (swipeDirection) return swipeDirection;
  if (align.value === "left") return "left";
  if (align.value === "right") return "right";
  return side.value === "top" ? "up" : "down";
});
const openToasts = computed(() => toasts.value.filter((item) => item.state === "open"));
const maxVisible = computed(() => Math.max(1, limit));
const viewportAttrs = computed(() => ({
  "data-akaza-side": side.value,
  "data-akaza-align": align.value,
  "data-akaza-expanded": expanded.value || !stack,
  "data-akaza-stacked": stack || undefined,
}));

function getRole(item: ToastItem): "alert" | "status" {
  return item.priority === "high" ? "alert" : "status";
}

function getStackIndex(index: number) {
  return openToasts.value.length - index - 1;
}

function isLimited(index: number) {
  return getStackIndex(index) >= maxVisible.value;
}

function getToastStyle(item: ToastItem, index: number): CSSProperties {
  const stackIndex = getStackIndex(index);
  const direction = side.value === "top" ? 1 : -1;
  const frontmost = openToasts.value[openToasts.value.length - 1];
  let measuredFallback = 0;
  for (let itemIndex = openToasts.value.length - 1; itemIndex >= 0; itemIndex--) {
    const height = toastHeights.value[openToasts.value[itemIndex]!.id];
    if (height !== undefined) {
      measuredFallback = height;
      break;
    }
  }
  const frontmostHeight = frontmost
    ? (toastHeights.value[frontmost.id] ?? measuredFallback)
    : 0;
  const scale = Math.max(0, 1 - stackIndex * Math.max(0, scaleStep));
  const stackOffset = direction * (stackIndex * Math.max(0, peek) + (1 - scale) * frontmostHeight);
  let expandedOffset = stackIndex * Math.max(0, gap);

  for (let itemIndex = index + 1; itemIndex < openToasts.value.length; itemIndex++) {
    const newer = openToasts.value[itemIndex]!;
    expandedOffset += toastHeights.value[newer.id] ?? frontmostHeight;
  }

  return {
    "--akaza-toast-index": stackIndex,
    "--akaza-toast-count": Math.min(openToasts.value.length, maxVisible.value),
    "--akaza-toast-offset-y": `${direction * expandedOffset}px`,
    "--akaza-toast-stack-y": `${stackOffset}px`,
    "--akaza-toast-scale": scale,
    "--akaza-toast-gap": `${Math.max(0, gap)}px`,
    "--akaza-toast-peek": `${Math.max(0, peek)}px`,
    ...(toastHeights.value[item.id] && { "--akaza-toast-height": `${toastHeights.value[item.id]}px` }),
    ...(frontmostHeight && { "--akaza-toast-frontmost-height": `${frontmostHeight}px` }),
  } as CSSProperties;
}

function getToastAttrs(item: ToastItem, index: number) {
  const limited = isLimited(index);
  const live: "assertive" | "polite" = item.priority === "high" ? "assertive" : "polite";
  return {
    role: getRole(item),
    "aria-live": live,
    "aria-atomic": true,
    "aria-hidden": limited || undefined,
    inert: limited || undefined,
    "data-akaza-state": "open",
    "data-akaza-type": item.type,
    "data-akaza-priority": item.priority,
    "data-akaza-expanded": expanded.value || !stack || undefined,
    "data-akaza-behind": getStackIndex(index) > 0 || undefined,
    "data-akaza-limited": limited || undefined,
    "data-akaza-index": getStackIndex(index),
    "data-akaza-swipe-direction": resolvedSwipeDirection.value,
  };
}

function measureToast(id: string, element: HTMLElement) {
  const height = element.offsetHeight || element.getBoundingClientRect().height;
  if (!height || toastHeights.value[id] === height) return;
  toastHeights.value = { ...toastHeights.value, [id]: height };
}

function setToastRef(id: string, element: HTMLElement | null) {
  const previous = toastElements.get(id);
  if (previous === element) return;
  if (previous) resizeObserver?.unobserve(previous);
  if (!element) {
    toastElements.delete(id);
    return;
  }
  toastElements.set(id, element);
  resizeObserver?.observe(element);
  measureToast(id, element);
}

function setPaused(reason: string, value: boolean) {
  if (value) pauseReasons.add(reason);
  else pauseReasons.delete(reason);
  if (pauseReasons.size) pause();
  else resume();
}

async function onAction(item: ToastItem, event?: Event) {
  if (!item.action) return;
  try {
    await item.action.onSelect(event);
    if (item.action.closeOnSelect !== false) close(item.id, "action");
  } catch (error) {
    emit("action-error", error, item);
  }
}

function closeToast(item: ToastItem, reasonOrEvent: ToastCloseReason | Event = "programmatic") {
  const reason = typeof reasonOrEvent === "string" ? reasonOrEvent : "programmatic";
  close(item.id, reason);
}

function matchesHotkey(event: KeyboardEvent) {
  const normalized = hotkey.map((key) => key.toLowerCase());
  const modifiers = ["control", "ctrl", "alt", "shift", "meta"];
  const expectedKey = normalized.find((key) => !modifiers.includes(key));
  return (!expectedKey || event.key.toLowerCase() === expectedKey)
    && event.ctrlKey === (normalized.includes("control") || normalized.includes("ctrl"))
    && event.altKey === normalized.includes("alt")
    && event.shiftKey === normalized.includes("shift")
    && event.metaKey === normalized.includes("meta");
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (openToasts.value.length && matchesHotkey(event)) {
    event.preventDefault();
    expanded.value = true;
    viewportRef.value?.focus();
    return;
  }
  if (event.key !== "Escape" || !viewportRef.value?.contains(document.activeElement)) return;
  const latest = openToasts.value[openToasts.value.length - 1];
  if (latest) {
    event.preventDefault();
    close(latest.id, "escape");
  }
}

function onVisibilityChange() {
  if (!pauseOnWindowBlur) return;
  setPaused("window", document.hidden);
}

function onWindowBlur() {
  setPaused("window", true);
}

function onWindowFocus() {
  setPaused("window", false);
}

function onPointerDown(item: ToastItem, event: PointerEvent) {
  if (event.button !== 0) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest("button, a, input, select, textarea, [contenteditable='true']")) return;
  swipe.value = { id: item.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  (event.currentTarget as HTMLElement).dataset.akazaSwipe = "start";
  emit("swipe-start", item, event);
}

function getSwipeDistance(event: PointerEvent) {
  if (!swipe.value) return 0;
  const x = event.clientX - swipe.value.x;
  const y = event.clientY - swipe.value.y;
  if (resolvedSwipeDirection.value === "left") return -x;
  if (resolvedSwipeDirection.value === "right") return x;
  if (resolvedSwipeDirection.value === "up") return -y;
  return y;
}

function setSwipeStyle(element: HTMLElement, distance: number) {
  const direction = resolvedSwipeDirection.value;
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  const value = `${Math.max(0, distance) * sign}px`;
  const horizontal = resolvedSwipeDirection.value === "left" || resolvedSwipeDirection.value === "right";
  element.style.setProperty("--akaza-toast-swipe-move-x", horizontal ? value : "0px");
  element.style.setProperty("--akaza-toast-swipe-move-y", horizontal ? "0px" : value);
}

function resetSwipe(element: HTMLElement) {
  element.dataset.akazaSwipe = "cancel";
  element.style.removeProperty("--akaza-toast-swipe-move-x");
  element.style.removeProperty("--akaza-toast-swipe-move-y");
}

function onPointerMove(item: ToastItem, event: PointerEvent) {
  if (swipe.value?.id !== item.id || swipe.value.pointerId !== event.pointerId) return;
  const element = event.currentTarget as HTMLElement;
  element.dataset.akazaSwipe = "move";
  setSwipeStyle(element, getSwipeDistance(event));
  emit("swipe-move", item, event);
}

function finishSwipe(item: ToastItem, event: PointerEvent, canceled = false) {
  if (swipe.value?.id !== item.id || swipe.value.pointerId !== event.pointerId) return;
  const element = event.currentTarget as HTMLElement;
  const distance = getSwipeDistance(event);
  swipe.value = null;
  if (!canceled && distance >= swipeThreshold) {
    element.dataset.akazaSwipe = "end";
    emit("swipe-end", item, event);
    close(item.id, "swipe");
    return;
  }
  resetSwipe(element);
  emit("swipe-cancel", item, event);
}

function onViewportMouseenter() {
  expanded.value = true;
  if (pauseOnHover) setPaused("hover", true);
}

function onViewportMouseleave() {
  expanded.value = false;
  if (pauseOnHover) setPaused("hover", false);
}

function onViewportFocusin() {
  expanded.value = true;
  if (pauseOnFocus) setPaused("focus", true);
}

function onViewportFocusout(event: FocusEvent) {
  if (viewportRef.value?.contains(event.relatedTarget as Node | null)) return;
  expanded.value = false;
  if (pauseOnFocus) setPaused("focus", false);
}

onMounted(() => {
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const match = [...toastElements].find(([, element]) => element === entry.target);
        if (match) measureToast(match[0], match[1]);
      }
    });
    for (const [id, element] of toastElements) {
      resizeObserver.observe(element);
      measureToast(id, element);
    }
  }
  document.addEventListener("keydown", onDocumentKeydown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (pauseOnWindowBlur) {
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onDocumentKeydown);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("blur", onWindowBlur);
  window.removeEventListener("focus", onWindowFocus);
  resizeObserver?.disconnect();
  toastElements.clear();
  pauseReasons.clear();
  resume();
});
</script>

<template>
  <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
    <ol
      ref="viewportRef"
      tabindex="-1"
      :aria-label="`${hotkeyLabel} (${hotkey.join('+')})`"
      v-bind="viewportAttrs"
      :class="ui?.viewport"
      class="akaza-toast-viewport"
      @mouseenter="onViewportMouseenter"
      @mouseleave="onViewportMouseleave"
      @focusin="onViewportFocusin"
      @focusout="onViewportFocusout"
    >
      <TransitionGroup name="akaza-toast">
        <li
          v-for="(item, index) in openToasts"
          :key="`${item.id}:${item.updateKey}`"
          :ref="(element) => setToastRef(item.id, element as HTMLElement | null)"
          v-bind="getToastAttrs(item, index)"
          :style="getToastStyle(item, index)"
          :class="ui?.toast"
          class="akaza-toast"
          @pointerdown="onPointerDown(item, $event)"
          @pointermove="onPointerMove(item, $event)"
          @pointerup="finishSwipe(item, $event)"
          @pointercancel="finishSwipe(item, $event, true)"
        >
          <slot
            name="toast"
            :toast="item"
            :type="item.type"
            :priority="item.priority"
            :action="item.action"
            :attrs="getToastAttrs(item, index)"
            :close="(reason?: ToastCloseReason | Event) => closeToast(item, reason)"
            :perform-action="(event?: Event) => onAction(item, event)"
          >
            <div v-if="item.title" :class="ui?.title" class="akaza-toast-title">
              <slot name="title" :toast="item">{{ item.title }}</slot>
            </div>
            <div v-if="item.description" :class="ui?.description" class="akaza-toast-description">
              <slot name="description" :toast="item">{{ item.description }}</slot>
            </div>
            <button
              v-if="item.action"
              type="button"
              :aria-label="item.action.altText"
              :class="ui?.action"
              class="akaza-toast-action"
              @click="onAction(item, $event)"
            >
              {{ item.action.label }}
            </button>
            <button
              type="button"
              :class="ui?.close"
              class="akaza-toast-close"
              :aria-label="closeLabel"
              @click="close(item.id, 'close-button')"
            >
              <slot name="close" :toast="item">×</slot>
            </button>
          </slot>
        </li>
      </TransitionGroup>
    </ol>
  </Teleport>
</template>

<style>
.akaza-toast-viewport {
  position: fixed;
  z-index: var(--akaza-z-toast, 1200);
  display: grid;
  max-height: 100vh;
  padding: 1rem;
  margin: 0;
  overflow: visible;
  list-style: none;
  pointer-events: none;
  outline: none;
}

.akaza-toast-viewport[data-akaza-side="top"] { top: 0; }
.akaza-toast-viewport[data-akaza-side="bottom"] { bottom: 0; }
.akaza-toast-viewport[data-akaza-align="left"] { left: 0; }
.akaza-toast-viewport[data-akaza-align="right"] { right: 0; }
.akaza-toast-viewport[data-akaza-align="center"] { left: 50%; transform: translateX(-50%); }

.akaza-toast {
  --akaza-toast-current-y: var(--akaza-toast-stack-y, 0px);
  position: relative;
  grid-area: 1 / 1;
  align-self: end;
  box-sizing: border-box;
  height: var(--akaza-toast-frontmost-height, auto);
  overflow: hidden;
  pointer-events: auto;
  transform-origin: bottom center;
  z-index: calc(100 - var(--akaza-toast-index));
  transform: translate3d(
    var(--akaza-toast-swipe-move-x, 0px),
    calc(var(--akaza-toast-current-y) + var(--akaza-toast-swipe-move-y, 0px)),
    0
  ) scale(var(--akaza-toast-scale, 1));
  transition:
    transform var(--akaza-toast-duration, 500ms) cubic-bezier(0.22, 1, 0.36, 1),
    opacity var(--akaza-toast-duration, 500ms) ease,
    height var(--akaza-toast-height-duration, 150ms) ease-out;
}

.akaza-toast:not([data-akaza-limited]) { will-change: transform, opacity; }

.akaza-toast-viewport[data-akaza-side="top"] .akaza-toast {
  align-self: start;
  transform-origin: top center;
}

.akaza-toast-viewport[data-akaza-expanded="true"] .akaza-toast {
  --akaza-toast-current-y: var(--akaza-toast-offset-y, 0px);
  height: var(--akaza-toast-height, auto);
  transform: translate3d(
    var(--akaza-toast-swipe-move-x, 0px),
    calc(var(--akaza-toast-current-y) + var(--akaza-toast-swipe-move-y, 0px)),
    0
  ) scale(1);
}

.akaza-toast > * {
  transition: opacity var(--akaza-toast-content-duration, 250ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.akaza-toast-viewport[data-akaza-expanded="false"] .akaza-toast[data-akaza-behind] > * {
  opacity: 0;
}

.akaza-toast::after {
  position: absolute;
  left: 0;
  width: 100%;
  height: calc(var(--akaza-toast-gap, 12px) + 1px);
  content: "";
}

.akaza-toast-viewport[data-akaza-side="bottom"] .akaza-toast::after { top: 100%; }
.akaza-toast-viewport[data-akaza-side="top"] .akaza-toast::after { bottom: 100%; }

.akaza-toast[data-akaza-swipe-direction="left"],
.akaza-toast[data-akaza-swipe-direction="right"] { touch-action: pan-y; }
.akaza-toast[data-akaza-swipe-direction="up"],
.akaza-toast[data-akaza-swipe-direction="down"] { touch-action: pan-x; }

.akaza-toast[data-akaza-limited] {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.akaza-toast[data-akaza-swipe="start"],
.akaza-toast[data-akaza-swipe="move"] { transition: none; }
.akaza-toast[data-akaza-swipe="cancel"] {
  transition: transform var(--akaza-toast-duration, 500ms) cubic-bezier(0.22, 1, 0.36, 1);
}

.akaza-toast-enter-active,
.akaza-toast-leave-active {
  transition:
    opacity var(--akaza-toast-duration, 500ms) ease,
    transform var(--akaza-toast-duration, 500ms) cubic-bezier(0.22, 1, 0.36, 1),
    height var(--akaza-toast-height-duration, 150ms) ease-out;
}

.akaza-toast-move {
  transition: transform var(--akaza-toast-duration, 500ms) cubic-bezier(0.22, 1, 0.36, 1);
}

@starting-style {
  .akaza-toast-viewport[data-akaza-side="bottom"] .akaza-toast {
    transform: translate3d(0, 150%, 0) scale(1);
  }

  .akaza-toast-viewport[data-akaza-side="top"] .akaza-toast {
    transform: translate3d(0, -150%, 0) scale(1);
  }
}

.akaza-toast-viewport[data-akaza-side="bottom"] .akaza-toast-leave-to:not([data-akaza-swipe="end"]) {
  opacity: 0;
  transform: translate3d(0, 150%, 0) scale(1);
}

.akaza-toast-viewport[data-akaza-side="top"] .akaza-toast-leave-to:not([data-akaza-swipe="end"]) {
  opacity: 0;
  transform: translate3d(0, -150%, 0) scale(1);
}

.akaza-toast-leave-to[data-akaza-swipe="end"][data-akaza-swipe-direction="left"] {
  opacity: 0;
  transform: translate3d(
    calc(var(--akaza-toast-swipe-move-x, 0px) - 150%),
    calc(var(--akaza-toast-current-y) + var(--akaza-toast-swipe-move-y, 0px)),
    0
  ) scale(1);
}

.akaza-toast-leave-to[data-akaza-swipe="end"][data-akaza-swipe-direction="right"] {
  opacity: 0;
  transform: translate3d(
    calc(var(--akaza-toast-swipe-move-x, 0px) + 150%),
    calc(var(--akaza-toast-current-y) + var(--akaza-toast-swipe-move-y, 0px)),
    0
  ) scale(1);
}

.akaza-toast-leave-to[data-akaza-swipe="end"][data-akaza-swipe-direction="up"] {
  opacity: 0;
  transform: translate3d(var(--akaza-toast-swipe-move-x, 0px), -150%, 0) scale(1);
}

.akaza-toast-leave-to[data-akaza-swipe="end"][data-akaza-swipe-direction="down"] {
  opacity: 0;
  transform: translate3d(var(--akaza-toast-swipe-move-x, 0px), 150%, 0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .akaza-toast,
  .akaza-toast > *,
  .akaza-toast-enter-active,
  .akaza-toast-leave-active,
  .akaza-toast-move {
    transition-duration: 0.01ms;
  }
}
</style>
