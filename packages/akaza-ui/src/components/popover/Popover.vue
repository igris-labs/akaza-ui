<script setup lang="ts">
import type { PopoverAlign, PopoverProps, PopoverSide } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { computed, nextTick, onUnmounted, ref, useId, useTemplateRef, watch } from "vue";
import { usePopover } from "../../composables/popover";

const {
  side = "bottom",
  align = "start",
  sideOffset = 6,
  teleport = "body",
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
  emit("open-change", nextOpen, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  nextOpen ? _open() : _close();
}

function open(reason = "programmatic", event?: Event) { handleChange(true, reason, event); }
function close(reason = "programmatic", event?: Event) { handleChange(false, reason, event); }
function toggle(reason = "programmatic", event?: Event) { handleChange(!model.value, reason, event); }

const popoverId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

onClickOutside(
  rootRef,
  (e) => { if (model.value) close("outside-click", e); },
  { ignore: [contentRef] },
);

onKeyStroke("Escape", (e) => {
  if (model.value) {
    e.preventDefault();
    close("escape", e);
  }
});

// ── Positioning ───────────────────────────────────────────────────────────────

const posStyle = ref({ top: "-9999px", left: "-9999px" });
const actualSide = ref<PopoverSide>(side);

function computePosition() {
  if (!rootRef.value || !contentRef.value) return;

  const t = rootRef.value.getBoundingClientRect();
  const c = contentRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = sideOffset;

  // Auto-flip: prefer requested side, fall back if no room
  const order: PopoverSide[] = [side, "bottom", "top", "right", "left"];
  const candidates = [...new Set(order)];

  let chosen: PopoverSide = candidates[candidates.length - 1]!;
  for (const d of candidates) {
    if (d === "top" && t.top >= c.height + gap) { chosen = d; break; }
    if (d === "bottom" && vh - t.bottom >= c.height + gap) { chosen = d; break; }
    if (d === "right" && vw - t.right >= c.width + gap) { chosen = d; break; }
    if (d === "left" && t.left >= c.width + gap) { chosen = d; break; }
  }

  let top = 0;
  let left = 0;

  // Main axis
  if (chosen === "top") top = t.top - c.height - gap;
  else if (chosen === "bottom") top = t.bottom + gap;
  else if (chosen === "left") left = t.left - c.width - gap;
  else left = t.right + gap;

  // Cross axis (align)
  if (chosen === "top" || chosen === "bottom") {
    if (align === "start") left = t.left;
    else if (align === "end") left = t.right - c.width;
    else left = t.left + t.width / 2 - c.width / 2;
  } else {
    if (align === "start") top = t.top;
    else if (align === "end") top = t.bottom - c.height;
    else top = t.top + t.height / 2 - c.height / 2;
  }

  // Clamp to viewport
  top = Math.max(4, Math.min(top, vh - c.height - 4));
  left = Math.max(4, Math.min(left, vw - c.width - 4));

  actualSide.value = chosen;
  posStyle.value = { top: `${top}px`, left: `${left}px` };
}

// ── Open/close with scroll tracking ──────────────────────────────────────────

function addListeners() {
  window.addEventListener("scroll", computePosition, { passive: true, capture: true });
  window.addEventListener("resize", computePosition, { passive: true });
}

function removeListeners() {
  window.removeEventListener("scroll", computePosition, { capture: true });
  window.removeEventListener("resize", computePosition);
}

watch(model, async (val) => {
  if (val) {
    await nextTick();
    // Use rAF so the browser completes layout before we measure content dimensions.
    // Without this, c.width/c.height can be 0 for sides that depend on content size (top/left).
    requestAnimationFrame(computePosition);
    addListeners();
  } else {
    removeListeners();
  }
});

onUnmounted(removeListeners);

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
    <Teleport
      :to="typeof teleport === 'string' ? teleport : 'body'"
      :disabled="teleport === false"
    >
      <Transition
        v-bind="typeof transition === 'string' ? { name: transition } : {}"
        :css="transition !== false"
      >
        <div
          v-if="model"
          :id="popoverId"
          ref="contentRef"
          :class="ui?.content"
          :style="posStyle"
          :data-akaza-side="actualSide"
          :data-akaza-align="align"
          data-akaza-state="open"
          class="akaza-popover-content"
        >
          <slot
            name="content"
            :close="close"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.akaza-popover-root {
  position: relative;
  display: inline-block;
}

.akaza-popover-content {
  position: fixed;
  z-index: 50;
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
