<script setup lang="ts">
import type { TooltipProps } from ".";
import { computed, useId, useTemplateRef } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { resolveAction } from "../../utils/changeEvent";

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

const tooltipId = useId();
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const arrowRef = useTemplateRef<HTMLElement>("arrowRef");
const { present, contentAttrs, triggerAttrs, arrowAttrs, style, actualSide: actualDirection, layerOrder, setOpen } = usePopup({
  kind: "tooltip",
  open: model,
  content: contentRef,
  contentId: tooltipId,
  trigger: () => triggerRef.value?.querySelector<HTMLElement>("button,a[href],input,select,textarea,[tabindex]") ?? triggerRef.value,
  anchor: () => triggerRef.value,
  initialFocus: "none",
  finalFocus: "none",
  disabled: () => disabled,
  delay: () => delayDuration,
  closeDelay: () => closeDelay,
  side: () => direction,
  align: () => "center",
  sideOffset: () => 8,
  collisionPadding: () => 4,
  arrow: arrowRef,
  cssVarPrefix: "akaza-tooltip",
  transition: () => transition,
  request: next => { if (!disabled || !next) model.value = next; },
});
const posStyle = computed(() => ({ ...style.value, transform: undefined, transformOrigin: undefined }));

function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  setOpen(false, details.reason, details.event);
}

const triggerProps = computed(() => ({
  "data-slot": triggerAttrs.value["data-slot"],
  "aria-describedby": triggerAttrs.value["aria-describedby"],
  "data-akaza-state": model.value ? "open" : "closed",
}));
</script>

<template>
  <span :class="ui?.root" class="akaza-tooltip-root">
    <span
      ref="triggerRef"
      :aria-describedby="triggerAttrs['aria-describedby']"
      :data-akaza-state="model ? 'open' : 'closed'"
      :class="ui?.trigger"
      class="akaza-tooltip-trigger"
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
      <div
        v-if="present"
        v-bind="contentAttrs"
        :id="tooltipId"
        ref="contentRef"
        role="tooltip"
        :class="ui?.content"
        :data-akaza-state="model ? 'open' : 'closed'"
        :data-akaza-side="actualDirection"
        :style="[posStyle, { '--akaza-layer-order': layerOrder }]"
        class="akaza-tooltip-content"
      >
        <slot name="content" :close="close" />
        <span
          v-if="arrow"
          v-bind="arrowAttrs"
          ref="arrowRef"
          :class="ui?.arrow"
          class="akaza-tooltip-arrow"
          aria-hidden="true"
        />
      </div>
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
    border-top: none;
    border-left: none;
  }

  .akaza-tooltip-content[data-akaza-side="bottom"] .akaza-tooltip-arrow {
    top: -4px;
    border-bottom: none;
    border-right: none;
  }

  .akaza-tooltip-content[data-akaza-side="left"] .akaza-tooltip-arrow {
    right: -4px;
    border-top: none;
    border-right: none;
  }

  .akaza-tooltip-content[data-akaza-side="right"] .akaza-tooltip-arrow {
    left: -4px;
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
