<script setup lang="ts">
import type { AlertDialogProps } from ".";
import { nextTick, useId, useTemplateRef, watch } from "vue";
import { useAlertDialog } from "../../composables/alert-dialog";
import { useFocusScope } from "../../utils/focusScope";

const {
  as = "div",
  teleport = "body",
  transition = "akaza-alert-dialog",
  duration = 150,
  title,
  description,
  ui,
} = defineProps<AlertDialogProps>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open, close, toggle } = useAlertDialog(model);

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const titleId = useId();
const descriptionId = useId();
const { activate, deactivate } = useFocusScope(contentRef, { initialFocusSelector: "[data-akaza-cancel]" });

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    activate();
  } else {
    deactivate();
  }
});

// Alert dialogs must NOT close on backdrop click or Escape — WAI-ARIA spec.

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
    <Transition name="akaza-alert-dialog-overlay">
      <div
        v-if="isOpen"
        :class="ui?.overlay"
        :style="{ '--akaza-dialog-duration': `${duration}ms` }"
        class="akaza-alert-dialog-overlay"
        data-akaza-state="open"
      />
    </Transition>

    <Transition v-bind="typeof transition === 'string' ? { name: transition } : {}">
      <component
        :is="as"
        v-if="isOpen"
        ref="contentRef"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="($slots.title || title) ? titleId : undefined"
        :aria-describedby="($slots.description || description) ? descriptionId : undefined"
        :class="ui?.content"
        :style="{ '--akaza-dialog-duration': `${duration}ms` }"
        class="akaza-alert-dialog-content"
        data-akaza-state="open"
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
    </Transition>
  </Teleport>
</template>

<style>
.akaza-alert-dialog-overlay-enter-active,
.akaza-alert-dialog-overlay-leave-active {
  transition: opacity var(--akaza-dialog-duration, 150ms) ease-out;
}

.akaza-alert-dialog-overlay-enter-from,
.akaza-alert-dialog-overlay-leave-to {
  opacity: 0;
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
  transform: scale(0.95);
}
</style>
