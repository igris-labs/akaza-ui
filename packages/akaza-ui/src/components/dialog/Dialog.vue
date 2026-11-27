<script setup lang="ts">
import type { DialogProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { useId, useTemplateRef } from "vue";
import { useDialog } from "../../composables/dialog";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

const {
  as = "div",
  title,
  description,
  ariaLabel,
  closeOnBackdropClick = true,
  fullscreen = false,
  teleport = "body",
  transition = "akaza-dialog",
  duration = 100,
  ui,
} = defineProps<DialogProps>();

const emit = defineEmits<{
  "open-change": [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close } = useDialog(model);

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const overlayRef = useTemplateRef<HTMLElement>("overlayRef");
const titleId = useId();
const descriptionId = useId();
const popup = usePopup({
  kind: "dialog",
  open: isOpen,
  content: contentRef,
  backdrop: overlayRef,
  transition: () => transition,
  backdropTransition: () => transition === false ? false : "akaza-dialog-overlay",
  request(nextOpen, sdkReason, event) {
    if (sdkReason === "outside-press" && !closeOnBackdropClick) return;
    const reason = sdkReason === "escape-key" ? "escape"
      : sdkReason === "outside-press" ? "backdrop-click" : sdkReason;
    handleChange(nextOpen, reason, event);
  },
});
const { present, contentAttrs, backdropAttrs, style: popupStyle, layerOrder } = popup;

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  const changeEvent = createChangeDetails(reason, event);
  emit("open-change", nextOpen, changeEvent.details);
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

defineExpose({ open, close, toggle, titleId, descriptionId });
</script>

<template>
  <slot name="trigger" :is-open="isOpen" :open="open" :close="close" :toggle="toggle" />

  <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
    <div
      v-if="present"
      ref="overlayRef"
      v-bind="backdropAttrs"
      :class="ui?.overlay"
      :style="{ '--akaza-dialog-duration': `${duration}ms`, '--akaza-layer-order': layerOrder }"
      class="akaza-dialog-overlay"
      :data-akaza-backdrop-motion="transition === false ? undefined : ''"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
    >
      <slot name="overlay" />
    </div>
    <component
      :is="as"
      v-if="present"
      ref="contentRef"
      v-bind="contentAttrs"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="$slots.title || title ? titleId : undefined"
      :aria-label="!($slots.title || title) ? ariaLabel : undefined"
      :aria-describedby="$slots.description || description ? descriptionId : undefined"
      :class="ui?.content"
      :style="{ ...popupStyle, '--akaza-dialog-duration': `${duration}ms`, '--akaza-layer-order': layerOrder }"
      :data-akaza-fullscreen="fullscreen || undefined"
      class="akaza-dialog-content"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
      tabindex="-1"
    >
      <div
        v-if="$slots.header || $slots.title || title"
        :class="ui?.header"
        class="akaza-dialog-header"
      >
        <slot name="header" :close="close" :title-id="titleId">
          <div :id="titleId" :class="ui?.title" class="akaza-dialog-title">
            <slot name="title">{{ title }}</slot>
          </div>
        </slot>
      </div>

      <div :class="ui?.body" class="akaza-dialog-body">
        <div
          v-if="$slots.description || description"
          :id="descriptionId"
          :class="ui?.description"
          class="akaza-dialog-description"
        >
          <slot name="description">{{ description }}</slot>
        </div>
        <slot name="body" :close="close" :description-id="descriptionId" />
      </div>

      <div v-if="$slots.footer" :class="ui?.footer" class="akaza-dialog-footer">
        <slot name="footer" :close="close" />
      </div>
    </component>
  </Teleport>
</template>

<style>
@layer akaza-reset {
  .akaza-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--akaza-z-overlay, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0)));
  }

  .akaza-dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: var(--akaza-z-overlay-content, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  .akaza-dialog-content[data-akaza-fullscreen] {
    top: 0;
    left: 0;
    translate: 0;
    width: 100%;
    height: 100%;
  }

  .akaza-dialog-overlay[data-akaza-backdrop-motion] {
    transition-property: none;
  }

  .akaza-dialog-overlay[data-akaza-backdrop-motion]:is([data-akaza-state="closed"], .akaza-dialog-overlay-leave-to) {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .akaza-dialog-overlay[data-akaza-backdrop-motion] {
      transition: opacity var(--akaza-dialog-duration, 100ms) ease-out;
    }

    /* The SDK can reveal the backdrop before its entry classes reach the DOM. */
    @starting-style {
      .akaza-dialog-overlay[data-akaza-backdrop-motion] {
        opacity: 0;
      }
    }
  }

  .akaza-dialog-enter-active,
  .akaza-dialog-leave-active {
    transition:
      opacity var(--akaza-dialog-duration, 100ms) ease-out,
      transform var(--akaza-dialog-duration, 100ms) ease-out;
  }

  .akaza-dialog-enter-from,
  .akaza-dialog-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .akaza-dialog-enter-from,
    .akaza-dialog-leave-to {
      transform: scale(0.95);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-dialog-enter-active,
    .akaza-dialog-leave-active {
      transition-duration: 0s;
    }
  }
}
</style>
