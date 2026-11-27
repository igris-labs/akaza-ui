<script setup lang="ts">
import type { AlertDialogProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { useId, useTemplateRef } from "vue";
import { useAlertDialog } from "../../composables/alert-dialog";
import { usePopup } from "../../composables/internal/sdk/usePopup";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

const {
  as = "div",
  teleport = "body",
  transition = "akaza-alert-dialog",
  duration = 150,
  title,
  ariaLabel,
  description,
  ui,
} = defineProps<AlertDialogProps>();

const emit = defineEmits<{
  'open-change': [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close } = useAlertDialog(model);

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const overlayRef = useTemplateRef<HTMLElement>("overlayRef");
const titleId = useId();
const descriptionId = useId();
const popup = usePopup({
  kind: "alertdialog",
  open: isOpen,
  content: contentRef,
  backdrop: overlayRef,
  get initialFocus() {
    return contentRef.value?.querySelector("[data-akaza-cancel]") ? "[data-akaza-cancel]" : "auto";
  },
  transition: () => transition,
  backdropTransition: () => transition === false ? false : "akaza-alert-dialog-overlay",
  request(nextOpen, sdkReason, event) {
    if (sdkReason === "escape-key" || sdkReason === "outside-press") return;
    handleChange(nextOpen, sdkReason, event);
  },
});
const { present, contentAttrs, backdropAttrs, style: popupStyle, layerOrder } = popup;

function handleChange(open: boolean, reason: string, event?: Event) {
  const changeEvent = createChangeDetails(reason, event);
  emit('open-change', open, changeEvent.details);
  if (changeEvent.canceled()) return;
  open ? _open() : _close();
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

// Akaza alert dialogs require an explicit response instead of Escape or backdrop dismissal.

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
      v-if="present"
      ref="overlayRef"
      v-bind="backdropAttrs"
      :class="ui?.overlay"
      :style="{ '--akaza-dialog-duration': `${duration}ms`, '--akaza-layer-order': layerOrder }"
      class="akaza-alert-dialog-overlay"
      :data-akaza-backdrop-motion="transition === false ? undefined : ''"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
    />
    <component
      :is="as"
      v-if="present"
      ref="contentRef"
      v-bind="contentAttrs"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="($slots.title || title) ? titleId : undefined"
      :aria-label="!($slots.title || title) ? ariaLabel : undefined"
      :aria-describedby="($slots.description || description) ? descriptionId : undefined"
      :class="ui?.content"
      :style="{ ...popupStyle, '--akaza-dialog-duration': `${duration}ms`, '--akaza-layer-order': layerOrder }"
      class="akaza-alert-dialog-content"
      :data-akaza-state="isOpen ? 'open' : 'closed'"
      tabindex="-1"
    >
      <div
        v-if="$slots.header || $slots.title || title"
        :class="ui?.header"
        class="akaza-alert-dialog-header"
      >
        <slot name="header" :close="close" :title-id="titleId">
          <div
            v-if="$slots.title || title"
            :id="titleId"
            :class="ui?.title"
            class="akaza-alert-dialog-title"
          >
            <slot name="title">{{ title }}</slot>
          </div>
        </slot>
      </div>

      <div
        :class="ui?.body"
        class="akaza-alert-dialog-body"
      >
        <div
          v-if="$slots.description || description"
          :id="descriptionId"
          :class="ui?.description"
          class="akaza-alert-dialog-description"
        >
          <slot name="description">{{ description }}</slot>
        </div>
        <slot
          name="body"
          :close="close"
          :description-id="descriptionId"
        />
      </div>

      <div
        v-if="$slots.footer"
        :class="ui?.footer"
        class="akaza-alert-dialog-footer"
      >
        <slot
          name="footer"
          :close="close"
        />
      </div>
    </component>
  </Teleport>
</template>

<style>
@layer akaza-reset {
  .akaza-alert-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--akaza-z-overlay, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0)));
  }

  .akaza-alert-dialog-content {
    position: fixed;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: var(--akaza-z-overlay-content, calc(var(--akaza-z-layer-base, 1200) + var(--akaza-layer-order, 0) + 1));
  }

  .akaza-alert-dialog-overlay[data-akaza-backdrop-motion] {
    transition-property: none;
  }

  .akaza-alert-dialog-overlay[data-akaza-backdrop-motion]:is([data-akaza-state="closed"], .akaza-alert-dialog-overlay-leave-to) {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .akaza-alert-dialog-overlay[data-akaza-backdrop-motion] {
      transition: opacity var(--akaza-dialog-duration, 150ms) ease-out;
    }

    /* The SDK can reveal the backdrop before its entry classes reach the DOM. */
    @starting-style {
      .akaza-alert-dialog-overlay[data-akaza-backdrop-motion] {
        opacity: 0;
      }
    }
  }

  .akaza-alert-dialog-enter-active,
  .akaza-alert-dialog-leave-active {
    transition:
      opacity var(--akaza-dialog-duration, 150ms) ease-out,
      transform var(--akaza-dialog-duration, 150ms) ease-out;
  }

  .akaza-alert-dialog-enter-from,
  .akaza-alert-dialog-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .akaza-alert-dialog-enter-from,
    .akaza-alert-dialog-leave-to {
      transform: scale(0.95);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-alert-dialog-enter-active,
    .akaza-alert-dialog-leave-active {
      transition-duration: 0s;
    }
  }
}
</style>
