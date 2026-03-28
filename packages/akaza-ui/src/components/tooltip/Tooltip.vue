<script setup lang="ts">
import type { TooltipDirection, TooltipProps } from ".";
import { onKeyStroke } from "@vueuse/core";
import { nextTick, onUnmounted, ref, useId, useTemplateRef, watch } from "vue";
import { useTooltip } from "../../composables/tooltip";

const {
  direction = "top",
  delayDuration = 300,
  closeDelay = 0,
  disabled = false,
  arrow = false,
  teleport = "body",
  transition = "akaza-tooltip",
  ui,
} = defineProps<TooltipProps>();

const model = defineModel<boolean>({ default: false });
const { open: _open, close: _close } = useTooltip(model, { delayDuration, closeDelay });

function open() { if (!disabled) _open(); }
function close() { if (!disabled || model.value) _close(); }

const tooltipId = useId();
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

const GAP = 8;
const posStyle = ref({ top: "-9999px", left: "-9999px" });
const actualDirection = ref<TooltipDirection>(direction);

function computePosition() {
  if (!triggerRef.value || !contentRef.value) return;

  const t = triggerRef.value.getBoundingClientRect();
  const c = contentRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try preferred direction first, then fall back
  const order: TooltipDirection[] = [direction, "top", "bottom", "right", "left"];
  const candidates = [...new Set(order)];

  let chosen: TooltipDirection = candidates[candidates.length - 1]!;
  for (const d of candidates) {
    if (d === "top" && t.top >= c.height + GAP) {
      chosen = d;
      break;
    }
    if (d === "bottom" && vh - t.bottom >= c.height + GAP) {
      chosen = d;
      break;
    }
    if (d === "right" && vw - t.right >= c.width + GAP) {
      chosen = d;
      break;
    }
    if (d === "left" && t.left >= c.width + GAP) {
      chosen = d;
      break;
    }
  }

  let top = 0;
  let left = 0;
  if (chosen === "top") {
    top = t.top - c.height - GAP;
    left = t.left + t.width / 2 - c.width / 2;
  } else if (chosen === "bottom") {
    top = t.bottom + GAP;
    left = t.left + t.width / 2 - c.width / 2;
  } else if (chosen === "left") {
    top = t.top + t.height / 2 - c.height / 2;
    left = t.left - c.width - GAP;
  } else {
    top = t.top + t.height / 2 - c.height / 2;
    left = t.right + GAP;
  }

  // Clamp to viewport edges
  top = Math.max(4, Math.min(top, vh - c.height - 4));
  left = Math.max(4, Math.min(left, vw - c.width - 4));

  actualDirection.value = chosen;
  posStyle.value = { top: `${top}px`, left: `${left}px` };
}

const posReady = ref(false);
let posCleanup: (() => void) | null = null;

watch(model, async (val) => {
  if (val) {
    posReady.value = false;
    await nextTick();
    computePosition();
    posReady.value = true;
    const update = () => computePosition();
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });
    posCleanup = () => {
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  } else {
    posReady.value = false;
    posCleanup?.();
    posCleanup = null;
  }
});

onUnmounted(() => posCleanup?.());

onKeyStroke("Escape", (e) => {
  if (model.value) {
    e.preventDefault();
    close();
    triggerRef.value?.focus();
  }
});
</script>

<template>
  <span :class="ui?.root" class="akaza-tooltip-root">
    <span
      ref="triggerRef"
      :aria-describedby="model ? tooltipId : undefined"
      :data-akaza-state="model ? 'open' : 'closed'"
      :class="ui?.trigger"
      class="akaza-tooltip-trigger"
      @mouseenter="open"
      @mouseleave="close"
      @focus="open"
      @blur="close"
    >
      <slot
        name="trigger"
        :is-open="model"
      />
    </span>
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
          :id="tooltipId"
          ref="contentRef"
          role="tooltip"
          :class="ui?.content"
          data-akaza-state="open"
          :data-akaza-direction="actualDirection"
          :style="[posStyle, posReady ? {} : { visibility: 'hidden' }]"
          class="akaza-tooltip-content"
        >
          <slot name="content" :close="close" />
          <span v-if="arrow" class="akaza-tooltip-arrow" aria-hidden="true" />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
.akaza-tooltip-trigger {
  display: inline-block;
}

.akaza-tooltip-content {
  position: fixed;
  z-index: 50;
}

.akaza-tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: inherit;
  transform: rotate(45deg);
}

[data-akaza-direction="top"] .akaza-tooltip-arrow {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  border-top: none;
  border-left: none;
}

[data-akaza-direction="bottom"] .akaza-tooltip-arrow {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  border-bottom: none;
  border-right: none;
}

[data-akaza-direction="left"] .akaza-tooltip-arrow {
  right: -4px;
  top: 50%;
  margin-top: -4px;
  border-top: none;
  border-right: none;
}

[data-akaza-direction="right"] .akaza-tooltip-arrow {
  left: -4px;
  top: 50%;
  margin-top: -4px;
  border-bottom: none;
  border-left: none;
}

.akaza-tooltip-enter-active,
.akaza-tooltip-leave-active {
  transition:
    opacity 0.075s ease-out,
    transform 0.075s ease-out;
}

.akaza-tooltip-enter-from,
.akaza-tooltip-leave-to {
  opacity: 0;
  transform: scale(0.93);
}
</style>
