<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { HoverPreviewCardProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { onClickOutside } from "@vueuse/core";
import { computed, nextTick, onUnmounted, useId, useTemplateRef, watch } from "vue";
import { createChangeDetails } from "../../utils/changeEvent";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { getFloatingArrowStyle, useFloatingPosition } from "../../utils/floatingPosition";
import { useFocusBranch } from "../../utils/focusScope";
import { useDelayedAction } from "../../utils/useDelayedAction";

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
useFocusBranch(contentRef);
const { style: posStyle, actualSide, geometry } = useFloatingPosition({
  reference: triggerRef,
  floating: contentRef,
  active: model,
  side: () => side,
  align: () => align,
  sideOffset: () => sideOffset,
  collisionPadding: 4,
  fallbackSides: ["bottom", "top", "right", "left"],
  strategy: () => teleport === false ? "absolute" : "fixed",
  cssVarPrefix: "akaza-hover-preview-card",
});
const arrowStyle = computed(() => getFloatingArrowStyle(geometry.value, 8));
const delayed = useDelayedAction();
let lastPointerType = "mouse";
let restoringFocus = false;
const { layerOrder, register, unregister } = useDismissableLayer((event?: KeyboardEvent) => {
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
  transform: undefined,
  transformOrigin: undefined,
}));

function setOpen(next: boolean, reason: string, event?: Event) {
  if (disabled && next) return;
  if (model.value === next) return;
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", next, changeEvent.details);
  if (!changeEvent.canceled()) model.value = next;
}

function open(reason = "programmatic", event?: Event) {
  if (typeof window === "undefined") return;
  delayed.cancel();
  if (model.value) return;
  delayed.schedule(() => setOpen(true, reason, event), openDelay);
}

function close(reason = "programmatic", event?: Event) {
  if (typeof window === "undefined") {
    setOpen(false, reason, event);
    return;
  }
  delayed.schedule(() => setOpen(false, reason, event), closeDelay);
}

function closeImmediately(reason = "programmatic", event?: Event) {
  delayed.cancel();
  setOpen(false, reason, event);
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

watch(() => disabled, (value) => {
  if (value && model.value) setOpen(false, "disabled");
});

onClickOutside(rootRef, (event) => {
  if (model.value) setOpen(false, "outside-click", event);
}, { ignore: [contentRef] });

onUnmounted(unregister);

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
          :style="[contentStyle, { '--akaza-layer-order': layerOrder }]"
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
