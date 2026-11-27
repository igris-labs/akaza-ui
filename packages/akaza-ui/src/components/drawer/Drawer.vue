<script setup lang="ts">
import type { DrawerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, nextTick, useId, useTemplateRef, watch } from "vue";
import { useDrawer } from "../../composables/drawer";
import { usePointerDrag } from "../../composables/internal/sdk/usePointerDrag";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

const {
  as = "div",
  title,
  description,
  ariaLabel,
  side = "right",
  inset = 0,
  modal = true,
  closeOnBackdropClick = true,
  swipeToClose = true,
  teleport = "body",
  ui,
} = defineProps<DrawerProps>();

const emit = defineEmits<{
  'open-change': [open: boolean, details: AkazaChangeEventDetails];
}>();

const DISMISS_THRESHOLD = 100;

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close } = useDrawer(model);

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const overlayRef = useTemplateRef<HTMLElement>("overlayRef");
const titleId = useId();
const descriptionId = useId();
const popup = usePopup({
  kind: "dialog",
  open: isOpen,
  content: contentRef,
  backdrop: overlayRef,
  modal: () => modal,
  get initialFocus() { return modal ? "auto" : "none"; },
  transition: () => "akaza-drawer",
  backdropTransition: () => "akaza-drawer-overlay",
  request(nextOpen, sdkReason, event) {
    if (sdkReason === "outside-press" && (!modal || !closeOnBackdropClick)) return;
    const reason = sdkReason === "escape-key" ? "escape"
      : sdkReason === "outside-press" ? "backdrop-click" : sdkReason;
    handleChange(nextOpen, reason, event);
  },
});
const { present, contentAttrs, backdropAttrs, style: popupStyle, layerOrder } = popup;

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  const changeEvent = createChangeDetails(reason, event);
  emit('open-change', nextOpen, changeEvent.details);
  if (changeEvent.canceled()) return;
  nextOpen ? _open() : _close();
}

function open(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  popup.setOpen(true, details.reason, details.event);
}
function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  popup.setOpen(false, details.reason, details.event);
}
function toggle(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  popup.setOpen(!isOpen.value, details.reason, details.event);
}

const insetValue = computed(() =>
  typeof inset === "number" ? `${inset}px` : inset,
);
const drawerStyle = computed(() => ({
  "--akaza-drawer-inset": insetValue.value,
}));

// ─── Swipe helpers ────────────────────────────────────────────────────────────

function getSwipeAxis(): "x" | "y" {
  return side === "left" || side === "right" ? "x" : "y";
}

function getMovement(dX: number, dY: number): number {
  switch (side) {
    case "right":  return Math.max(0, dX);
    case "left":   return Math.max(0, -dX);
    case "bottom": return Math.max(0, dY);
    case "top":    return Math.max(0, -dY);
    default:       return 0;
  }
}

function setSwipeVars(movement: number) {
  if (!contentRef.value) return;
  const axis = getSwipeAxis();
  const sign = side === "right" || side === "bottom" ? 1 : -1;
  contentRef.value.style.setProperty(`--drawer-swipe-movement-${axis}`, `${sign * movement}px`);
  const progress = String(Math.min(1, movement / DISMISS_THRESHOLD));
  contentRef.value.style.setProperty("--drawer-swipe-progress", progress);
  overlayRef.value?.style.setProperty("--drawer-swipe-progress", progress);
}

function clearSwipeVars() {
  contentRef.value?.style.removeProperty("--drawer-swipe-movement-x");
  contentRef.value?.style.removeProperty("--drawer-swipe-movement-y");
  contentRef.value?.style.removeProperty("--drawer-swipe-progress");
  overlayRef.value?.style.removeProperty("--drawer-swipe-progress");
}

const drag = usePointerDrag(() => !swipeToClose || !isOpen.value);

function resetSwipe() {
  contentRef.value?.removeAttribute("data-swiping");
  clearSwipeVars();
}

function onSwipePointerDown(event: PointerEvent) {
  if (event.defaultPrevented || !contentRef.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest("button, a, input, select, textarea, [contenteditable='true']")) return;
  const element = contentRef.value;
  const movement = (sample: PointerEvent) => getMovement(sample.clientX - event.clientX, sample.clientY - event.clientY);
  drag.start(element, event, {
    onMove(sample) {
      const distance = movement(sample);
      if (distance < 10) {
        resetSwipe();
        return;
      }
      element.setAttribute("data-swiping", "");
      setSwipeVars(distance);
    },
    async onEnd(sample, canceled) {
      if (canceled || movement(sample) < DISMISS_THRESHOLD) {
        resetSwipe();
        return;
      }
      // Keep the final offset until SDK exit styles apply, or snap back if the parent refuses.
      setSwipeVars(movement(sample));
      close("swipe", sample);
      await nextTick();
      if (isOpen.value) resetSwipe();
      else element.removeAttribute("data-swiping");
    },
  });
}

watch([() => side, () => swipeToClose], () => {
  drag.cancel();
  resetSwipe();
});

watch(isOpen, (open) => {
  if (open) return;
  drag.cancel();
  contentRef.value?.removeAttribute("data-swiping");
});

defineExpose({ open, close, toggle, titleId, descriptionId });
</script>

<template>
  <slot
    name="trigger"
    :is-open="isOpen"
    :open="open"
    :close="close"
    :toggle="toggle"
  />

  <Teleport
    :to="typeof teleport === 'string' ? teleport : 'body'"
    :disabled="teleport === false"
  >
    <div
      v-if="present && modal"
      ref="overlayRef"
      v-bind="backdropAttrs"
      :class="ui?.overlay"
      :style="{ '--akaza-layer-order': layerOrder }"
      class="akaza-drawer-overlay"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
    />
    <component
      :is="as"
      v-if="present"
      ref="contentRef"
      v-bind="contentAttrs"
      role="dialog"
      :aria-modal="modal ? true : undefined"
      :aria-labelledby="($slots.title || title) ? titleId : undefined"
      :aria-label="!($slots.title || title) ? ariaLabel : undefined"
      :aria-describedby="($slots.description || description) ? descriptionId : undefined"
      :class="ui?.content"
      :style="{ ...popupStyle, ...drawerStyle, '--akaza-layer-order': layerOrder }"
      class="akaza-drawer"
      :data-akaza-side="side"
      :data-akaza-swipe-enabled="swipeToClose || undefined"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
      tabindex="-1"
      @pointerdown="onSwipePointerDown"
    >
      <!-- Handle bar area — render at top of panel before header -->
      <slot name="handle" />

      <div
        v-if="$slots.header || $slots.title || title"
        :class="ui?.header"
        class="akaza-drawer-header"
      >
        <slot name="header" :close="close" :title-id="titleId">
          <div :id="titleId" :class="ui?.title" class="akaza-drawer-title">
            <slot name="title">{{ title }}</slot>
          </div>
        </slot>
      </div>

      <div :class="ui?.body" class="akaza-drawer-body">
        <div
          v-if="$slots.description || description"
          :id="descriptionId"
          :class="ui?.description"
          class="akaza-drawer-description"
        >
          <slot name="description">{{ description }}</slot>
        </div>
        <slot name="body" :close="close" :description-id="descriptionId" />
      </div>

      <div
        v-if="$slots.footer"
        :class="ui?.footer"
        class="akaza-drawer-footer"
      >
        <slot name="footer" :close="close" />
      </div>
    </component>
  </Teleport>
</template>

<style>
@layer akaza-reset {
  /* SDK presence flags override swipe offsets only at the animation edges. */

  .akaza-drawer {
    position: fixed;
    display: flex;
    flex-direction: column;
    z-index: var(--akaza-z-overlay-content, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  .akaza-drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--akaza-z-overlay, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0)));
  }

  .akaza-drawer[data-akaza-side="right"] {
    top: var(--akaza-drawer-inset, 0px);
    right: var(--akaza-drawer-inset, 0px);
    bottom: var(--akaza-drawer-inset, 0px);
    transform: translateX(var(--drawer-swipe-movement-x, 0px));
    transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .akaza-drawer[data-akaza-side="left"] {
    top: var(--akaza-drawer-inset, 0px);
    left: var(--akaza-drawer-inset, 0px);
    bottom: var(--akaza-drawer-inset, 0px);
    transform: translateX(var(--drawer-swipe-movement-x, 0px));
    transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .akaza-drawer[data-akaza-side="top"] {
    top: var(--akaza-drawer-inset, 0px);
    left: var(--akaza-drawer-inset, 0px);
    right: var(--akaza-drawer-inset, 0px);
    transform: translateY(var(--drawer-swipe-movement-y, 0px));
    transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .akaza-drawer[data-akaza-side="bottom"] {
    bottom: var(--akaza-drawer-inset, 0px);
    left: var(--akaza-drawer-inset, 0px);
    right: var(--akaza-drawer-inset, 0px);
    transform: translateY(var(--drawer-swipe-movement-y, 0px));
    transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .akaza-drawer[data-akaza-side="right"]:is([data-starting-style], [data-ending-style]) {
    transform: translateX(110%);
  }

  .akaza-drawer[data-akaza-side="left"]:is([data-starting-style], [data-ending-style]) {
    transform: translateX(-110%);
  }

  .akaza-drawer[data-akaza-side="top"]:is([data-starting-style], [data-ending-style]) {
    transform: translateY(-110%);
  }

  .akaza-drawer[data-akaza-side="bottom"]:is([data-starting-style], [data-ending-style]) {
    transform: translateY(110%);
  }

  .akaza-drawer[data-akaza-swipe-enabled][data-akaza-side="left"],
  .akaza-drawer[data-akaza-swipe-enabled][data-akaza-side="right"] {
    touch-action: pan-y;
  }

  .akaza-drawer[data-akaza-swipe-enabled][data-akaza-side="top"],
  .akaza-drawer[data-akaza-swipe-enabled][data-akaza-side="bottom"] {
    touch-action: pan-x;
  }

  /* Disable transition while pointer is dragging */
  .akaza-drawer[data-swiping] {
    transition: none !important;
    user-select: none;
  }

  /* Overlay fade */
  .akaza-drawer-overlay {
    transition-property: none;
  }

  .akaza-drawer-overlay:is([data-akaza-state="closed"], .akaza-drawer-overlay-leave-to) {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .akaza-drawer-overlay {
      transition: opacity 300ms ease;
    }

    /* The SDK can reveal the backdrop before its entry classes reach the DOM. */
    @starting-style {
      .akaza-drawer-overlay {
        opacity: 0;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-drawer[data-akaza-side] {
      transition-duration: 0s;
    }

    .akaza-drawer[data-akaza-side]:is([data-starting-style], [data-ending-style]) {
      transform: none;
    }
  }

  /* Auto-rendered title/description */
}
</style>
