<script setup lang="ts">
import type { DrawerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { usePointerSwipe } from "@vueuse/core";
import { computed, nextTick, useId, useTemplateRef, watch } from "vue";
import { useDrawer } from "../../composables/drawer";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFocusScope } from "../../utils/focusScope";

const DISMISS_THRESHOLD = 100;
const TRANSITION_DURATION = 300;

const {
  as = "div",
  title,
  description,
  side = "right",
  inset = 0,
  closeOnBackdropClick = true,
  swipeToClose = true,
  teleport = "body",
  ui,
} = defineProps<DrawerProps>();

const emit = defineEmits<{
  'open-change': [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close, toggle: _toggle } = useDrawer(model);

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  let canceled = false;
  emit('open-change', nextOpen, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  nextOpen ? _open() : _close();
}

function open(reason = 'programmatic', event?: Event) { handleChange(true, reason, event); }
function close(reason = 'programmatic', event?: Event) { handleChange(false, reason, event); }
function toggle(reason = 'programmatic', event?: Event) { handleChange(!isOpen.value, reason, event); }

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const overlayRef = useTemplateRef<HTMLElement>("overlayRef");
const titleId = useId();
const descriptionId = useId();
const { activate, deactivate } = useFocusScope(contentRef);
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close('escape', event));

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    activate();
    register();
  } else {
    deactivate();
    unregister();
  }
});

function onOverlayClick(event: MouseEvent) {
  if (closeOnBackdropClick) close('backdrop-click', event);
}

const insetValue = computed(() =>
  typeof inset === "number" ? `${inset}px` : inset,
);

const drawerStyle = computed(() => ({
  "--akaza-drawer-inset": insetValue.value,
  borderRadius: inset && Number(inset) !== 0 ? "12px" : undefined,
}));

// ─── Swipe helpers ────────────────────────────────────────────────────────────

function getSwipeAxis(): "x" | "y" {
  return side === "left" || side === "right" ? "x" : "y";
}

function getOffscreenValue(axis: "x" | "y"): string {
  if (axis === "x") return side === "right" ? "110%" : "-110%";
  return side === "bottom" ? "110%" : "-110%";
}

// VueUse distanceX/Y = posStart - posEnd.
// Swiping right → posEnd.x > posStart.x → distanceX < 0  → use -dX
// Swiping left  → posEnd.x < posStart.x → distanceX > 0  → use  dX
// Swiping down  → posEnd.y > posStart.y → distanceY < 0  → use -dY
// Swiping up    → posEnd.y < posStart.y → distanceY > 0  → use  dY
function getMovement(dX: number, dY: number): number {
  switch (side) {
    case "right":  return Math.max(0, -dX);
    case "left":   return Math.max(0, dX);
    case "bottom": return Math.max(0, -dY);
    case "top":    return Math.max(0, dY);
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

const { distanceX, distanceY } = usePointerSwipe(contentRef, {
  threshold: 10,
  onSwipe() {
    if (!swipeToClose || !contentRef.value) return;
    const movement = getMovement(distanceX.value, distanceY.value);
    if (movement <= 0) return;
    contentRef.value.setAttribute("data-swiping", "");
    setSwipeVars(movement);
  },
  onSwipeEnd() {
    if (!contentRef.value) return;
    const movement = getMovement(distanceX.value, distanceY.value);
    if (swipeToClose && movement >= DISMISS_THRESHOLD) {
      // Keep data-swiping on; onLeave() removes it and animates from current offset.
      close('swipe');
    } else {
      // Snap back: restore transition, then clear var → animates to 0.
      contentRef.value.removeAttribute("data-swiping");
      clearSwipeVars();
    }
  },
});

// ─── JS transition hooks ──────────────────────────────────────────────────────
//
// We use :css="false" to avoid CSS specificity conflicts between
// `.akaza-drawer[data-akaza-side]` (0,2,0) and Vue transition classes (0,1,0).
// Instead, the CSS variable --drawer-swipe-movement-x/y is the single source
// of truth for the transform value, which the CSS rule reads at all times.
//
// Enter: set var to offscreen → reflow → clear var → CSS transition to 0
// Leave: remove data-swiping → reflow → set var to offscreen → CSS transition
// Snap-back: [data-swiping] removed → clear var → CSS transition handles it

function onBeforeEnter(el: Element) {
  const h = el as HTMLElement;
  h.style.transition = "none"; // suppress CSS transition during initial placement
  h.style.setProperty(`--drawer-swipe-movement-${getSwipeAxis()}`, getOffscreenValue(getSwipeAxis()));
}

function onEnter(el: Element, done: () => void) {
  const h = el as HTMLElement;
  const axis = getSwipeAxis();
  h.style.transition = ""; // restore CSS rule transition
  void h.offsetWidth;       // commit offscreen position as "from" state
  h.style.removeProperty(`--drawer-swipe-movement-${axis}`); // animate to 0

  const fallback = setTimeout(done, TRANSITION_DURATION + 50);
  h.addEventListener("transitionend", (e) => {
    if ((e as TransitionEvent).propertyName === "transform") {
      clearTimeout(fallback);
      done();
    }
  }, { once: true });
}

function onLeave(el: Element, done: () => void) {
  const h = el as HTMLElement;
  h.removeAttribute("data-swiping"); // re-enable CSS transition if mid-swipe dismiss
  const axis = getSwipeAxis();
  void h.offsetWidth; // commit current position (may be at swipe offset) as "from"
  h.style.setProperty(`--drawer-swipe-movement-${axis}`, getOffscreenValue(axis));

  const fallback = setTimeout(done, TRANSITION_DURATION + 50);
  h.addEventListener("transitionend", (e) => {
    if ((e as TransitionEvent).propertyName === "transform") {
      clearTimeout(fallback);
      done();
    }
  }, { once: true });
}

function onAfterLeave() {
  clearSwipeVars();
}

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
    <Transition name="akaza-drawer-overlay">
      <div
        v-if="isOpen"
        ref="overlayRef"
        :class="ui?.overlay"
        class="akaza-drawer-overlay"
        data-akaza-state="open"
        @click="onOverlayClick"
      />
    </Transition>

    <Transition
      :css="false"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <component
        :is="as"
        v-if="isOpen"
        ref="contentRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="($slots.title || title) ? titleId : undefined"
        :aria-describedby="($slots.description || description) ? descriptionId : undefined"
        :class="ui?.content"
        :style="drawerStyle"
        class="akaza-drawer"
        :data-akaza-side="side"
        data-akaza-state="open"
        tabindex="-1"
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
    </Transition>
  </Teleport>
</template>

<style>
/* Positioning by side + inset.
   transform uses the CSS variable as single source of truth.
   CSS transition handles: enter, leave, and snap-back animations.
   JS hooks (onEnter/onLeave) manipulate the variable to trigger transitions. */

.akaza-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
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

/* Disable transition while pointer is dragging */
.akaza-drawer[data-swiping] {
  transition: none !important;
  user-select: none;
}

/* Overlay fade */
.akaza-drawer-overlay-enter-active,
.akaza-drawer-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.akaza-drawer-overlay-enter-from,
.akaza-drawer-overlay-leave-to {
  opacity: 0;
}

/* Auto-rendered title/description */
.akaza-drawer-title {
  font-size: 1rem;
  font-weight: 600;
}

.akaza-drawer-description {
  font-size: 0.875rem;
  margin-bottom: 12px;
}
</style>
