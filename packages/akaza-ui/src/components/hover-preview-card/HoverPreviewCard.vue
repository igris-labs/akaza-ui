<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { HoverPreviewCardProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, useId, useTemplateRef, watch } from "vue";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

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
const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const arrowRef = useTemplateRef<HTMLElement>("arrowRef");
const { present, contentAttrs, triggerAttrs, arrowAttrs, style, actualSide, actualAlign, layerOrder, setOpen } = usePopup({
  kind: "hover",
  open: model,
  content: contentRef,
  contentId: cardId,
  keepMounted: () => forceMount,
  trigger: getTriggerFocusTarget,
  anchor: () => triggerRef.value,
  initialFocus: "none",
  finalFocus: getTriggerFocusTarget,
  disabled: () => disabled,
  delay: () => openDelay,
  closeDelay: () => closeDelay,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: () => 4,
  arrow: arrowRef,
  cssVarPrefix: "akaza-hover-preview-card",
  transition: () => "akaza-hover-preview-card",
  request: commitOpen,
});
let lastPointerType = "mouse";

const contentStyle = computed<CSSProperties>(() => ({
  ...style.value,
  transform: undefined,
  transformOrigin: undefined,
}));

function commitOpen(next: boolean, reason: string, event?: Event) {
  if (disabled && next) return;
  if (model.value === next) return;
  const akazaReason = reason === "escape-key" ? "escape"
    : reason === "outside-press" ? "outside-click"
      : reason === "trigger-hover" ? "hover"
        : reason === "trigger-focus" || reason === "focus-out" ? "focus"
          : reason === "trigger-press" ? "trigger"
            : reason === "imperative" ? "programmatic" : reason;
  const changeEvent = createChangeDetails(akazaReason, event);
  emit("open-change", next, changeEvent.details);
  if (!changeEvent.canceled()) model.value = next;
}

function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  setOpen(false, details.reason, details.event);
}

function getTriggerFocusTarget() {
  const trigger = triggerRef.value;
  if (!trigger) return null;
  const selector = "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  return trigger.querySelector<HTMLElement>(selector) ?? trigger;
}

function onPointerDown(event: PointerEvent) {
  lastPointerType = event.pointerType;
}

function onTriggerClick(event: MouseEvent) {
  if (!openOnClick || lastPointerType === "mouse") return;
  const details = resolveAction(event);
  setOpen(!model.value, details.reason, details.event);
}

watch(() => disabled, (value) => {
  if (value && model.value) setOpen(false, "disabled");
});

const triggerProps = computed(() => ({
  "data-slot": triggerAttrs.value["data-slot"],
  "aria-expanded": model.value,
  "aria-controls": model.value ? cardId : undefined,
  "aria-describedby": model.value && !ariaLabel ? cardId : undefined,
  "data-akaza-state": model.value ? "open" : "closed",
}));
</script>

<template>
  <span
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
    >
      <slot name="trigger" :is-open="model" :trigger-props="triggerProps" />
    </span>

    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <div
        v-if="present"
        v-bind="contentAttrs"
        :id="cardId"
        ref="contentRef"
        :class="ui?.content"
        :style="[contentStyle, { '--akaza-layer-order': layerOrder }]"
        :role="ariaLabel ? 'dialog' : undefined"
        :aria-label="ariaLabel"
        :aria-hidden="!model || undefined"
        :inert="!model || undefined"
        :data-akaza-state="model ? 'open' : 'closed'"
        :data-akaza-side="actualSide"
        :data-akaza-align="actualAlign"
        class="akaza-hover-preview-card-content"
      >
        <slot name="content" :close="close" />
        <span
          v-if="arrow"
          v-bind="arrowAttrs"
          ref="arrowRef"
          :class="ui?.arrow"
          class="akaza-hover-preview-card-arrow"
          aria-hidden="true"
        />
      </div>
    </Teleport>
  </span>
</template>

<style>
@layer akaza-reset {
  .akaza-hover-preview-card-root {
    position: relative;
    display: inline-block;
  }

  .akaza-hover-preview-card-trigger {
    display: inline-block;
  }

  .akaza-hover-preview-card-content {
    position: fixed;
    z-index: var(--akaza-z-hover-preview-card, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  .akaza-hover-preview-card-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
  }

  .akaza-hover-preview-card-arrow[data-side="top"] { bottom: -4px; }
  .akaza-hover-preview-card-arrow[data-side="bottom"] { top: -4px; }
  .akaza-hover-preview-card-arrow[data-side="left"] { right: -4px; }
  .akaza-hover-preview-card-arrow[data-side="right"] { left: -4px; }

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
}
</style>
