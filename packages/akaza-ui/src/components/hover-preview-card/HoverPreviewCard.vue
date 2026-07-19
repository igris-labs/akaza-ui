<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { HoverPreviewCardProps, HoverPreviewCardSide } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, ref, useId, useTemplateRef, watch } from "vue";
import { useDismissableLayer } from "../../utils/dismissableLayer";

const {
  side = "bottom",
  align = "center",
  sideOffset = 8,
  openDelay = 600,
  closeDelay = 150,
  disabled = false,
  forceMount = false,
  openOnClick = true,
  arrow = false,
  ariaLabel,
  teleport = "body",
  ui,
} = defineProps<HoverPreviewCardProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const cardId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const posStyle = ref<Record<string, string>>({ top: "-9999px", left: "-9999px" });
const arrowStyle = ref<Record<string, string>>({});
const actualSide = ref<HoverPreviewCardSide>(side);
let openTimer: number | undefined;
let closeTimer: number | undefined;
let lastPointerType = "mouse";
let restoringFocus = false;
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
  event?.preventDefault();
  closeImmediately("escape", event);
  nextTick(() => {
    const target = getTriggerFocusTarget();
    restoringFocus = document.activeElement !== target;
    target?.focus();
    queueMicrotask(() => { restoringFocus = false; });
  });
});

const contentStyle = computed<CSSProperties>(() => ({
  ...posStyle.value,
  position: teleport === false ? "absolute" : "fixed",
}));

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
  if (!canceled) model.value = next;
}

function open(reason = "programmatic", event?: Event) {
  if (typeof window === "undefined") return;
  window.clearTimeout(closeTimer);
  window.clearTimeout(openTimer);
  if (model.value) return;
  openTimer = window.setTimeout(() => setOpen(true, reason, event), openDelay);
}

function close(reason = "programmatic", event?: Event) {
  if (typeof window === "undefined") {
    setOpen(false, reason, event);
    return;
  }
  window.clearTimeout(openTimer);
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => setOpen(false, reason, event), closeDelay);
}

function closeImmediately(reason = "programmatic", event?: Event) {
  if (typeof window !== "undefined") {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
  }
  setOpen(false, reason, event);
}

function computePosition() {
  if (typeof window === "undefined" || !triggerRef.value || !contentRef.value) return;
  const t = triggerRef.value.getBoundingClientRect();
  const c = contentRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const candidates = [...new Set<HoverPreviewCardSide>([side, "bottom", "top", "right", "left"])];
  let chosen = candidates[candidates.length - 1]!;

  for (const item of candidates) {
    if (item === "top" && t.top >= c.height + sideOffset) {
      chosen = item;
      break;
    }
    if (item === "bottom" && vh - t.bottom >= c.height + sideOffset) {
      chosen = item;
      break;
    }
    if (item === "right" && vw - t.right >= c.width + sideOffset) {
      chosen = item;
      break;
    }
    if (item === "left" && t.left >= c.width + sideOffset) {
      chosen = item;
      break;
    }
  }

  let top = 0;
  let left = 0;
  if (chosen === "top") top = t.top - c.height - sideOffset;
  else if (chosen === "bottom") top = t.bottom + sideOffset;
  else if (chosen === "left") left = t.left - c.width - sideOffset;
  else left = t.right + sideOffset;

  if (chosen === "top" || chosen === "bottom") {
    if (align === "start") left = t.left;
    else if (align === "end") left = t.right - c.width;
    else left = t.left + t.width / 2 - c.width / 2;
  } else {
    if (align === "start") top = t.top;
    else if (align === "end") top = t.bottom - c.height;
    else top = t.top + t.height / 2 - c.height / 2;
  }

  top = Math.max(4, Math.min(top, vh - c.height - 4));
  left = Math.max(4, Math.min(left, vw - c.width - 4));
  actualSide.value = chosen;
  if (chosen === "top" || chosen === "bottom") {
    const arrowLeft = Math.max(4, Math.min(t.left + t.width / 2 - left - 4, c.width - 12));
    arrowStyle.value = {
      left: `${arrowLeft}px`,
      [chosen === "top" ? "bottom" : "top"]: "-4px",
    };
  } else {
    const arrowTop = Math.max(4, Math.min(t.top + t.height / 2 - top - 4, c.height - 12));
    arrowStyle.value = {
      top: `${arrowTop}px`,
      [chosen === "left" ? "right" : "left"]: "-4px",
    };
  }
  posStyle.value =
    teleport === false
      ? { top: `${top - t.top}px`, left: `${left - t.left}px` }
      : { top: `${top}px`, left: `${left}px` };
}

function containsTarget(target: EventTarget | null) {
  return target instanceof Node
    && (Boolean(rootRef.value?.contains(target)) || Boolean(contentRef.value?.contains(target)));
}

function getTriggerFocusTarget() {
  const trigger = triggerRef.value;
  if (!trigger) return null;
  const selector = "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  return trigger.matches(selector) ? trigger : trigger.querySelector<HTMLElement>(selector);
}

function onFocusOut(event: FocusEvent) {
  if (containsTarget(event.relatedTarget)) return;
  close("focus", event);
}

function onTriggerFocusIn(event: FocusEvent) {
  if (restoringFocus) {
    restoringFocus = false;
    return;
  }
  open("focus", event);
}

function onPointerDown(event: PointerEvent) {
  lastPointerType = event.pointerType;
}

function onTriggerClick(event: MouseEvent) {
  if (!openOnClick || lastPointerType === "mouse") return;
  if (model.value) close("trigger", event);
  else open("trigger", event);
}

function addListeners() {
  if (typeof window === "undefined") return;
  window.addEventListener("scroll", computePosition, { passive: true, capture: true });
  window.addEventListener("resize", computePosition, { passive: true });
}

function removeListeners() {
  if (typeof window === "undefined") return;
  window.removeEventListener("scroll", computePosition, { capture: true });
  window.removeEventListener("resize", computePosition);
}

watch(model, async (open) => {
  if (open) {
    await nextTick();
    register();
    computePosition();
    addListeners();
  } else {
    unregister();
    removeListeners();
  }
}, { immediate: true });

watch(() => disabled, (value) => {
  if (value && model.value) setOpen(false, "disabled");
});

onClickOutside(rootRef, (event) => {
  if (model.value) setOpen(false, "outside-click", event);
}, { ignore: [contentRef] });

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
  }
  unregister();
  removeListeners();
});

const triggerProps = computed(() => ({
  "aria-expanded": model.value,
  "aria-controls": model.value ? cardId : undefined,
  "aria-describedby": model.value && !ariaLabel ? cardId : undefined,
  "data-akaza-state": model.value ? "open" : "closed",
}));
</script>

<template>
  <span
    ref="rootRef"
    :class="ui?.root"
    :data-akaza-state="model ? 'open' : 'closed'"
    class="akaza-hover-preview-card-root"
  >
    <span
      ref="triggerRef"
      :class="ui?.trigger"
      :data-akaza-state="model ? 'open' : 'closed'"
      class="akaza-hover-preview-card-trigger"
      @pointerdown="onPointerDown"
      @click="onTriggerClick"
      @mouseenter="open('hover', $event)"
      @mouseleave="close('hover', $event)"
      @focusin="onTriggerFocusIn"
      @focusout="onFocusOut"
    >
      <slot name="trigger" :is-open="model" :trigger-props="triggerProps" />
    </span>

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition name="akaza-hover-preview-card">
        <div
          v-if="model || forceMount"
          v-show="model"
          :id="cardId"
          ref="contentRef"
          :class="ui?.content"
          :style="contentStyle"
          :role="ariaLabel ? 'dialog' : undefined"
          :aria-label="ariaLabel"
          :aria-hidden="!model || undefined"
          :inert="!model || undefined"
          :data-akaza-state="model ? 'open' : 'closed'"
          :data-akaza-side="actualSide"
          :data-akaza-align="align"
          class="akaza-hover-preview-card-content"
          @mouseenter="open('hover', $event)"
          @mouseleave="close('hover', $event)"
          @focusin="open('focus', $event)"
          @focusout="onFocusOut"
        >
          <slot name="content" :close="() => closeImmediately('programmatic')" />
          <span
            v-if="arrow"
            :class="ui?.arrow"
            :style="arrowStyle"
            class="akaza-hover-preview-card-arrow"
            aria-hidden="true"
          />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
.akaza-hover-preview-card-root {
  position: relative;
  display: inline-block;
}

.akaza-hover-preview-card-trigger {
  display: inline-block;
}

.akaza-hover-preview-card-content {
  position: fixed;
  z-index: var(--akaza-z-hover-preview-card, 1000);
}

.akaza-hover-preview-card-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: inherit;
  transform: rotate(45deg);
}

.akaza-hover-preview-card-enter-active,
.akaza-hover-preview-card-leave-active {
  transition:
    opacity var(--akaza-hover-preview-card-duration, 120ms) ease-out,
    scale var(--akaza-hover-preview-card-duration, 120ms) ease-out,
    translate var(--akaza-hover-preview-card-duration, 120ms) ease-out;
}

.akaza-hover-preview-card-enter-from,
.akaza-hover-preview-card-leave-to {
  opacity: 0;
  scale: 0.98;
}

.akaza-hover-preview-card-enter-from[data-akaza-side="bottom"],
.akaza-hover-preview-card-leave-to[data-akaza-side="bottom"] { translate: 0 -4px; }
.akaza-hover-preview-card-enter-from[data-akaza-side="top"],
.akaza-hover-preview-card-leave-to[data-akaza-side="top"] { translate: 0 4px; }
.akaza-hover-preview-card-enter-from[data-akaza-side="right"],
.akaza-hover-preview-card-leave-to[data-akaza-side="right"] { translate: -4px 0; }
.akaza-hover-preview-card-enter-from[data-akaza-side="left"],
.akaza-hover-preview-card-leave-to[data-akaza-side="left"] { translate: 4px 0; }

@media (prefers-reduced-motion: reduce) {
  .akaza-hover-preview-card-enter-active,
  .akaza-hover-preview-card-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
