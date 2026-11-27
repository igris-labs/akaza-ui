<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { ToastProps, ToastSwipeDirection } from ".";
import type { ToastCloseReason, ToastItem } from "../../composables/toast";
import { bindPersistentLayer, createFocusRecovery, matchesShortcut, supportsTopLayer } from "@ui-sdk/core";
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, shallowReactive, useTemplateRef, watch } from "vue";
import { usePointerDrag } from "../../composables/internal/sdk/usePointerDrag";
import { useToast } from "../../composables/toast";
import { setToastPaused } from "../../composables/toast/pause";

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

const viewportRef = useTemplateRef<HTMLElement>("viewportRef");
const hovered = ref(false);
const focused = ref(false);
const expanded = computed(() => hovered.value || focused.value);
const toast = useToast(manager);
const { toasts, close } = toast;
const drag = usePointerDrag(() => false);
let swipeElement: HTMLElement | undefined;
const toastHeights = ref<Record<string, number>>({});
const toastElements = new Map<string, HTMLElement>();
const pauseReasons = new Set<string>();
const pendingActions = shallowReactive(new Map<ToastItem, object>());
const focusBindings = new Map<string, () => void>();
let disposed = false;
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
const recovery = createFocusRecovery({
  fallback: () => {
    if (disposed) return;
    const latest = openToasts.value[openToasts.value.length - 1];
    return (latest && toastElements.get(latest.id)) || viewportRef.value;
  },
});
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
    tabindex: -1,
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
  focusBindings.get(id)?.();
  focusBindings.delete(id);
  if (previous && previous === swipeElement) cancelSwipe();
  if (previous) resizeObserver?.unobserve(previous);
  if (!element) {
    toastElements.delete(id);
    delete toastHeights.value[id];
    return;
  }
  toastElements.set(id, element);
  focusBindings.set(id, recovery.bind(element, { key: id, props: { id } }));
  resizeObserver?.observe(element);
  measureToast(id, element);
}

function setPaused(reason: string, value: boolean) {
  if (value) pauseReasons.add(reason);
  else pauseReasons.delete(reason);
  setToastPaused(toast, pauseReasons, pauseReasons.size > 0);
}

function isCurrent(item: ToastItem) {
  return !disposed && item.state === "open" && toasts.value.includes(item);
}

watch(openToasts, () => {
  for (const [item, owner] of pendingActions) {
    if (isCurrent(item)) continue;
    pendingActions.delete(item);
    setToastPaused(toast, owner, false);
  }
}, { flush: "sync" });

async function onAction(item: ToastItem, event?: Event) {
  const action = item.action;
  if (!action || !isCurrent(item) || pendingActions.has(item)) return;
  const owner = {};
  pendingActions.set(item, owner);
  setToastPaused(toast, owner, true, item.id);
  try {
    await action.onSelect(event);
    if (isCurrent(item) && action.closeOnSelect !== false) close(item.id, "action");
  } catch (error) {
    if (isCurrent(item)) emit("action-error", error, item);
  } finally {
    pendingActions.delete(item);
    setToastPaused(toast, owner, false);
  }
}

function closeToast(item: ToastItem, reasonOrEvent: ToastCloseReason | Event = "programmatic") {
  if (!isCurrent(item)) return;
  const reason = typeof reasonOrEvent === "string" ? reasonOrEvent : "programmatic";
  close(item.id, reason);
}

function matchesHotkey(event: KeyboardEvent) {
  return hotkey.length > 0 && matchesShortcut(event, hotkey.join("+"));
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  if (openToasts.value.length && matchesHotkey(event)) {
    event.preventDefault();
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
  setPaused("page", document.hidden);
}

function onWindowBlur() {
  setPaused("window", true);
}

function onWindowFocus() {
  setPaused("window", false);
}

function onPointerDown(item: ToastItem, event: PointerEvent) {
  if (event.defaultPrevented || swipeElement) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest("button, a, input, select, textarea, [contenteditable='true']")) return;
  const element = event.currentTarget as HTMLElement;
  const direction = resolvedSwipeDirection.value;
  const horizontal = direction === "left" || direction === "right";
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  const distance = (sample: PointerEvent) => sign * (horizontal
    ? sample.clientX - event.clientX
    : sample.clientY - event.clientY);
  if (!drag.start(element, event, {
    onMove(sample) {
      element.dataset.akazaSwipe = "move";
      setSwipeStyle(element, distance(sample));
      emit("swipe-move", item, sample);
    },
    onEnd(sample, canceled) {
      swipeElement = undefined;
      setPaused("swipe", false);
      if (!canceled && distance(sample) >= swipeThreshold) {
        setSwipeStyle(element, distance(sample));
        element.dataset.akazaSwipe = "end";
        emit("swipe-end", item, sample);
        close(item.id, "swipe");
      } else {
        resetSwipe(element);
        emit("swipe-cancel", item, sample);
      }
    },
  })) return;
  swipeElement = element;
  setPaused("swipe", true);
  element.dataset.akazaSwipe = "start";
  emit("swipe-start", item, event);
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

function cancelSwipe() {
  drag.cancel();
  if (swipeElement) resetSwipe(swipeElement);
  swipeElement = undefined;
  setPaused("swipe", false);
}

watch(resolvedSwipeDirection, cancelSwipe);
function showViewport() {
  const element = viewportRef.value;
  if (element && supportsTopLayer() && !element.matches(":popover-open")) element.showPopover();
}
watch(viewportRef, (element, _previous, cleanup) => {
  if (!element) return;
  // Persistent registration preserves ordering only for elements already in the top layer.
  if (supportsTopLayer()) element.setAttribute("popover", "manual");
  showViewport();
  const unbind = bindPersistentLayer(element);
  cleanup(() => {
    unbind();
    if (element.hasAttribute("popover")) element.hidePopover?.();
  });
}, { flush: "post" });
onUpdated(showViewport);

function onViewportMouseenter() {
  hovered.value = true;
}

function onViewportMouseleave() {
  hovered.value = false;
}

function onViewportFocusin() {
  focused.value = true;
}

function onViewportFocusout(event: FocusEvent) {
  if (viewportRef.value?.contains(event.relatedTarget as Node | null)) return;
  focused.value = false;
}

watch([hovered, () => pauseOnHover], ([value, enabled]) => setPaused("hover", value && enabled), { flush: "sync" });
watch([focused, () => pauseOnFocus], ([value, enabled]) => setPaused("focus", value && enabled), { flush: "sync" });

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
  watch(() => pauseOnWindowBlur, (enabled) => {
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("focus", onWindowFocus);
    if (enabled) {
      window.addEventListener("blur", onWindowBlur);
      window.addEventListener("focus", onWindowFocus);
      onVisibilityChange();
    } else {
      setPaused("window", false);
      setPaused("page", false);
    }
  }, { immediate: true, flush: "sync" });
});

onBeforeUnmount(() => {
  disposed = true;
  cancelSwipe();
  document.removeEventListener("keydown", onDocumentKeydown);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("blur", onWindowBlur);
  window.removeEventListener("focus", onWindowFocus);
  resizeObserver?.disconnect();
  toastElements.clear();
  for (const unbind of focusBindings.values()) unbind();
  focusBindings.clear();
  for (const owner of pendingActions.values()) setToastPaused(toast, owner, false);
  pendingActions.clear();
  pauseReasons.clear();
  setToastPaused(toast, pauseReasons, false);
});
</script>

<template>
  <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
    <div
      ref="viewportRef"
      role="region"
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
      <TransitionGroup
        name="akaza-toast"
        :move-class="side === 'top' && openToasts.length === 1 ? 'akaza-toast-single-move' : 'akaza-toast-move'"
      >
        <div
          v-for="(item, index) in openToasts"
          :key="`${item.id}:${item.updateKey}`"
          :ref="(element) => setToastRef(item.id, element as HTMLElement | null)"
          v-bind="getToastAttrs(item, index)"
          :style="getToastStyle(item, index)"
          :class="ui?.toast"
          class="akaza-toast"
          @pointerdown="onPointerDown(item, $event)"
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
              :aria-busy="pendingActions.has(item) || undefined"
              :aria-disabled="pendingActions.has(item) || undefined"
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
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
@layer akaza-reset {
  .akaza-toast-viewport {
    position: fixed;
    inset: auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    z-index: var(--akaza-z-toast, 1200);
    display: grid;
    max-height: 100vh;
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

  /* The first height measurement must not replace the single top toast's entry with a move. */
  .akaza-toast-single-move {
    transition: none;
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
}
</style>
