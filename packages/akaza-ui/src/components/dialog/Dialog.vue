<script setup lang="ts">
import type { DialogProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { nextTick, useId, useTemplateRef, watch } from "vue";
import { useDialog } from "../../composables/dialog";
import { useDismissableLayer } from "../../utils/dismissableLayer";
import { useFocusScope } from "../../utils/focusScope";

const {
  as = "div",
  title,
  description,
  closeOnBackdropClick = true,
  fullscreen = false,
  teleport = "body",
  transition = "akaza-dialog",
  duration = 100,
  ui,
} = defineProps<DialogProps>();

const emit = defineEmits<{
  'open-change': [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });
const { isOpen, open: _open, close: _close, toggle: _toggle } = useDialog(model);

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const titleId = useId();
const descriptionId = useId();
const { activate, deactivate } = useFocusScope(contentRef);
const { register, unregister } = useDismissableLayer((event?: KeyboardEvent) => close('escape', event));

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  let canceled = false;
  emit('open-change', nextOpen, { reason, ...(event && { event }), cancel: () => { canceled = true; } });
  if (canceled) return;
  nextOpen ? _open() : _close();
}

function open(reason = 'programmatic', event?: Event) { handleChange(true, reason, event); }
function close(reason = 'programmatic', event?: Event) { handleChange(false, reason, event); }
function toggle(reason = 'programmatic', event?: Event) { handleChange(!isOpen.value, reason, event); }

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

function onBackdropClick(event: MouseEvent) {
  if (closeOnBackdropClick) close('backdrop-click', event);
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
    <Transition name="akaza-dialog-overlay">
      <div
        v-if="isOpen"
        :class="ui?.overlay"
        :style="{ '--akaza-dialog-duration': `${duration}ms` }"
        class="akaza-dialog-overlay"
        data-akaza-state="open"
        @click="onBackdropClick"
      >
        <slot name="overlay" />
      </div>
    </Transition>

    <Transition v-bind="typeof transition === 'string' ? { name: transition } : {}">
      <component
        :is="as"
        v-if="isOpen"
        ref="contentRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="($slots.title || title) ? titleId : undefined"
        :aria-describedby="($slots.description || description) ? descriptionId : undefined"
        :class="ui?.content"
        :style="{ '--akaza-dialog-duration': `${duration}ms` }"
        :data-akaza-fullscreen="fullscreen || undefined"
        class="akaza-dialog-content"
        data-akaza-state="open"
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

        <div
          :class="ui?.body"
          class="akaza-dialog-body"
        >
          <div
            v-if="$slots.description || description"
            :id="descriptionId"
            :class="ui?.description"
            class="akaza-dialog-description"
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
          class="akaza-dialog-footer"
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
.akaza-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.akaza-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: 50;
}

.akaza-dialog-content[data-akaza-fullscreen] {
  top: 0;
  left: 0;
  translate: 0;
  width: 100%;
  height: 100%;
}

.akaza-dialog-overlay-enter-active,
.akaza-dialog-overlay-leave-active {
  transition: opacity var(--akaza-dialog-duration, 100ms) ease-out;
}

.akaza-dialog-overlay-enter-from,
.akaza-dialog-overlay-leave-to {
  opacity: 0;
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
  transform: scale(0.95);
}
</style>
