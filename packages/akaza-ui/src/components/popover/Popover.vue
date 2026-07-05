<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { PopoverProps, PopoverSide } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, ref, useId, useTemplateRef, watch } from "vue";
import { usePopover } from "../../composables/popover";
import { resolveAction } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";

const {
  side = "bottom",
  align = "start",
  sideOffset = 6,
  teleport = false,
  transition = "akaza-popover",
  ui,
} = defineProps<PopoverProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const { open: _open, close: _close } = usePopover(model);

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
  handleChange(!model.value, details.reason, details.event);
}

const popoverId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
let positionFrame = 0;
let resizeObserver: ResizeObserver | undefined;
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close("escape", event));

onClickOutside(
  rootRef,
  (e) => {
    if (model.value) close("outside-click", e);
  },
  { ignore: [contentRef] },
);

// ── Positioning ───────────────────────────────────────────────────────────────

const posStyle = ref({ top: "-9999px", left: "-9999px" });
const actualSide = ref<PopoverSide>(side);
const contentStyle = computed<CSSProperties>(() => ({
  ...posStyle.value,
  position: teleport === false ? "absolute" : "fixed",
}));

function schedulePosition() {
  if (typeof requestAnimationFrame === "undefined") return;
  cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(() => {
    positionFrame = requestAnimationFrame(() => {
      computePosition();
    });
  });
}

function computePosition() {
  if (typeof window === "undefined") return;
  if (!rootRef.value || !contentRef.value) return;

  const t = rootRef.value.getBoundingClientRect();
  const contentWidth = contentRef.value.offsetWidth;
  const contentHeight = contentRef.value.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = sideOffset;

  // Auto-flip: prefer requested side, fall back if no room
  const order: PopoverSide[] = [side, "bottom", "top", "right", "left"];
  const candidates = [...new Set(order)];

  let chosen: PopoverSide = candidates[candidates.length - 1]!;
  for (const d of candidates) {
    if (d === "top" && t.top >= contentHeight + gap) {
      chosen = d;
      break;
    }
    if (d === "bottom" && vh - t.bottom >= contentHeight + gap) {
      chosen = d;
      break;
    }
    if (d === "right" && vw - t.right >= contentWidth + gap) {
      chosen = d;
      break;
    }
    if (d === "left" && t.left >= contentWidth + gap) {
      chosen = d;
      break;
    }
  }

  let top = 0;
  let left = 0;

  // Main axis
  if (chosen === "top") top = t.top - contentHeight - gap;
  else if (chosen === "bottom") top = t.bottom + gap;
  else if (chosen === "left") left = t.left - contentWidth - gap;
  else left = t.right + gap;

  // Cross axis (align)
  if (chosen === "top" || chosen === "bottom") {
    if (align === "start") left = t.left;
    else if (align === "end") left = t.right - contentWidth;
    else left = t.left + t.width / 2 - contentWidth / 2;
  } else {
    if (align === "start") top = t.top;
    else if (align === "end") top = t.bottom - contentHeight;
    else top = t.top + t.height / 2 - contentHeight / 2;
  }

  // Clamp to viewport
  top = Math.max(4, Math.min(top, vh - contentHeight - 4));
  left = Math.max(4, Math.min(left, vw - contentWidth - 4));

  actualSide.value = chosen;
  posStyle.value =
    teleport === false
      ? { top: `${top - t.top}px`, left: `${left - t.left}px` }
      : { top: `${top}px`, left: `${left}px` };
}

// ── Open/close with viewport tracking ────────────────────────────────────────

function addListeners() {
  if (typeof window === "undefined") return;
  if (teleport !== false) {
    window.addEventListener("scroll", computePosition, { passive: true, capture: true });
  }
  window.addEventListener("resize", computePosition, { passive: true });

  if (typeof ResizeObserver !== "undefined" && contentRef.value) {
    resizeObserver = new ResizeObserver(() => {
      computePosition();
    });
    resizeObserver.observe(contentRef.value);
  }
}

function removeListeners() {
  if (typeof window === "undefined") return;
  if (teleport !== false) {
    window.removeEventListener("scroll", computePosition, { capture: true });
  }
  window.removeEventListener("resize", computePosition);
  resizeObserver?.disconnect();
  resizeObserver = undefined;
}

watch(model, async (val) => {
  if (val) {
    await nextTick();
    register();
    addListeners();
    schedulePosition();
  } else {
    unregister();
    removeListeners();
  }
}, { immediate: true });

onUnmounted(() => {
  if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(positionFrame);
  unregister();
  removeListeners();
});

// ── Trigger ARIA props ────────────────────────────────────────────────────────

const triggerProps = computed(() => ({
  "aria-haspopup": "dialog" as const,
  "aria-expanded": model.value,
  "aria-controls": model.value ? popoverId : undefined,
}));

defineExpose({ open, close, toggle });
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    :data-akaza-state="model ? 'open' : 'closed'"
    class="akaza-popover-root"
  >
    <slot
      name="trigger"
      :is-open="model"
      :open="open"
      :close="close"
      :toggle="toggle"
      :trigger-props="triggerProps"
    />
    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition
        v-bind="typeof transition === 'string' ? { name: transition } : {}"
        :css="transition !== false"
      >
        <div
          v-if="model"
          :id="popoverId"
          ref="contentRef"
          :class="ui?.content"
          :style="contentStyle"
          :data-akaza-side="actualSide"
          :data-akaza-align="align"
          data-akaza-state="open"
          class="akaza-popover-content"
        >
          <slot name="content" :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.akaza-popover-root {
  position: relative;
  display: inline-block;
  isolation: isolate;
}

.akaza-popover-content {
  position: absolute;
  z-index: var(--akaza-z-popover, 1000);
  isolation: isolate;
}

.akaza-popover-enter-active,
.akaza-popover-leave-active {
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out;
}

.akaza-popover-enter-from,
.akaza-popover-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
