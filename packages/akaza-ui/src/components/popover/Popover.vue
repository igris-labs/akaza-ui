<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { PopoverProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, useId, useTemplateRef, watch } from "vue";
import { usePopover } from "../../composables/popover";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";

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
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", nextOpen, changeEvent.details);
  if (changeEvent.canceled()) return;
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
useFocusBranch(contentRef);
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
  close("escape", event);
  nextTick(() => getTriggerFocusTarget()?.focus());
});

function getTriggerFocusTarget() {
  const root = rootRef.value;
  if (!root) return null;
  const selector = "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  return root.matches(selector) ? root : root.querySelector<HTMLElement>(selector);
}

onClickOutside(
  rootRef,
  (e) => {
    if (model.value) close("outside-click", e);
  },
  { ignore: [contentRef] },
);

// ── Positioning ───────────────────────────────────────────────────────────────

const { style: positionStyle, actualSide } = useFloatingPosition({
  reference: rootRef,
  floating: contentRef,
  active: model,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: 4,
  fallbackSides: ["bottom", "top", "right", "left"],
  strategy: () => teleport === false ? "absolute" : "fixed",
  cssVarPrefix: "akaza-popover",
});
const contentStyle = computed<CSSProperties>(() => ({
  ...positionStyle.value,
  // Positioning must not override consumer or enter/leave transforms.
  transform: undefined,
  transformOrigin: undefined,
  "--akaza-layer-order": layerOrder.value,
}));

watch(model, async (open, _previous, cleanup) => {
  let canceled = false;
  cleanup(() => { canceled = true; });
  if (open) {
    await nextTick();
    if (!canceled) register();
  } else {
    unregister();
  }
}, { immediate: true });

onUnmounted(unregister);

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
