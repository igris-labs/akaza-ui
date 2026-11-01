<script setup lang="ts">
import type { TooltipProps } from ".";
import { computed, nextTick, onUnmounted, ref, useId, useTemplateRef, watch } from "vue";
import { useTooltip } from "../../composables/tooltip";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";

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
const { open: _open, close: _close } = useTooltip(model, {
  get delayDuration() { return delayDuration; },
  get closeDelay() { return closeDelay; },
});

function open() { if (!disabled) _open(); }
function close() { if (!disabled || model.value) _close(); }

const tooltipId = useId();
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
useFocusBranch(contentRef);

const { style: positionStyle, actualSide: actualDirection, update: computePosition } = useFloatingPosition({
  reference: triggerRef,
  floating: contentRef,
  active: model,
  side: () => direction,
  align: "center",
  sideOffset: 8,
  collisionPadding: 4,
  fallbackSides: ["top", "bottom", "right", "left"],
  strategy: "fixed",
  cssVarPrefix: "akaza-tooltip",
});
const posStyle = computed(() => ({ ...positionStyle.value, transform: undefined, transformOrigin: undefined }));

const posReady = ref(false);
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
  event?.preventDefault();
  _close();
  model.value = false;
});

watch(model, async (val, _old, cleanup) => {
  if (typeof window === "undefined") return;
  let canceled = false;
  cleanup(() => { canceled = true; });
  if (val) {
    posReady.value = false;
    await nextTick();
    if (canceled) return;
    register();
    computePosition();
    posReady.value = true;
  } else {
    posReady.value = false;
    unregister();
  }
}, { immediate: true });

onUnmounted(unregister);

const triggerProps = computed(() => ({
  "aria-describedby": model.value ? tooltipId : undefined,
  "data-akaza-state": model.value ? "open" : "closed",
}));
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
      @focusin="open"
      @focusout="close"
    >
      <slot
        name="trigger"
        :is-open="model"
        :trigger-props="triggerProps"
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
          :data-akaza-side="actualDirection"
          :style="[posStyle, { '--akaza-layer-order': layerOrder }, posReady ? {} : { visibility: 'hidden' }]"
          class="akaza-tooltip-content"
          @mouseenter="open"
          @mouseleave="close"
        >
          <slot name="content" :close="close" />
          <span
            v-if="arrow"
            :class="ui?.arrow"
            class="akaza-tooltip-arrow"
            aria-hidden="true"
          />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
@layer akaza-reset {
  .akaza-tooltip-trigger {
    display: inline-block;
  }

  .akaza-tooltip-content {
    position: fixed;
    z-index: var(--akaza-z-tooltip, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  /* Transparent hit area bridges the positioning gap during hover handoff. */
  .akaza-tooltip-content::before {
    content: "";
    position: absolute;
    inset: -8px;
    z-index: -1;
  }

  .akaza-tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
  }

  .akaza-tooltip-content[data-akaza-side="top"] .akaza-tooltip-arrow {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
    border-top: none;
    border-left: none;
  }

  .akaza-tooltip-content[data-akaza-side="bottom"] .akaza-tooltip-arrow {
    top: -4px;
    left: 50%;
    margin-left: -4px;
    border-bottom: none;
    border-right: none;
  }

  .akaza-tooltip-content[data-akaza-side="left"] .akaza-tooltip-arrow {
    right: -4px;
    top: 50%;
    margin-top: -4px;
    border-top: none;
    border-right: none;
  }

  .akaza-tooltip-content[data-akaza-side="right"] .akaza-tooltip-arrow {
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
}
</style>
