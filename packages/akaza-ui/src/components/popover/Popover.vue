<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { PopoverProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useId, useTemplateRef } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

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
const popoverId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

const { present, contentAttrs, triggerAttrs, style, actualSide, actualAlign, layerOrder, setOpen } = usePopup({
  kind: "popover",
  open: model,
  content: contentRef,
  contentId: popoverId,
  trigger: getTriggerFocusTarget,
  anchor: () => rootRef.value,
  initialFocus: "none",
  finalFocus: getTriggerFocusTarget,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: () => 4,
  cssVarPrefix: "akaza-popover",
  transition: () => transition,
  request: handleChange,
});

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  const akazaReason = reason === "escape-key" ? "escape"
    : reason === "outside-press" ? "outside-click"
      : reason === "trigger-press" ? "trigger"
        : reason === "imperative" ? "programmatic" : reason;
  const changeEvent = createChangeDetails(akazaReason, event);
  emit("open-change", nextOpen, changeEvent.details);
  if (!changeEvent.canceled()) model.value = nextOpen;
}

function open(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  setOpen(true, details.reason, details.event);
}
function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  setOpen(false, details.reason, details.event);
}
function toggle(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  setOpen(!model.value, details.reason, details.event);
}

function getTriggerFocusTarget() {
  const root = rootRef.value;
  if (!root) return null;
  const selector = "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  return [...root.querySelectorAll<HTMLElement>(selector)].find(element => !contentRef.value?.contains(element)) ?? root;
}

// ── Positioning ───────────────────────────────────────────────────────────────

const contentStyle = computed<CSSProperties>(() => ({
  ...style.value,
  // Positioning must not override consumer or enter/leave transforms.
  transform: undefined,
  transformOrigin: undefined,
  "--akaza-layer-order": layerOrder.value,
}));

// ── Trigger ARIA props ────────────────────────────────────────────────────────

const triggerProps = computed(() => ({
  "data-slot": triggerAttrs.value["data-slot"],
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
      <div
        v-if="present"
        v-bind="contentAttrs"
        :id="popoverId"
        ref="contentRef"
        :class="ui?.content"
        :style="contentStyle"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        :data-akaza-state="model ? 'open' : 'closed'"
        class="akaza-popover-content"
      >
        <slot name="content" :close="close" />
      </div>
    </Teleport>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-popover-root {
    position: relative;
    display: inline-block;
    isolation: isolate;
  }

  .akaza-popover-content {
    position: absolute;
    z-index: var(--akaza-z-popover, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
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
}
</style>
