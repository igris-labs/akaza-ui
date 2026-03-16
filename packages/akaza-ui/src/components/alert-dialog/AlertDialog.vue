<script setup lang="ts">
import { nextTick, useId, useTemplateRef, watch } from 'vue'
import { useFocusTrap } from '../../utils/focusTrap'
import { useAlertDialog } from '../../composables/alert-dialog'

export interface AlertDialogUi {
  overlay?: string
  content?: string
  header?: string
  body?: string
  footer?: string
}

export interface AlertDialogProps {
  as?: string
  teleport?: string | false
  transition?: string | false
  duration?: number
  ui?: AlertDialogUi
}

const {
  as = 'div',
  teleport = 'body',
  transition = 'akaza-alert-dialog',
  duration = 150,
  ui,
} = defineProps<AlertDialogProps>()

const model = defineModel<boolean>({ default: false })
const { isOpen, open, close, toggle } = useAlertDialog(model)

const contentRef = useTemplateRef<HTMLElement>('contentRef')
const titleId = useId()
const descriptionId = useId()
const { activate, deactivate } = useFocusTrap(contentRef)

watch(isOpen, async (val) => {
  if (val) { await nextTick(); activate() }
  else { deactivate() }
})

// Alert dialogs must NOT close on backdrop click or Escape — WAI-ARIA spec.

defineExpose({ open, close, toggle, titleId, descriptionId })
</script>

<template>
  <slot name="trigger" :is-open="isOpen" :open="open" :close="close" :toggle="toggle" />

  <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
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
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        :class="ui?.content"
        :style="{ '--akaza-dialog-duration': `${duration}ms` }"
        class="akaza-alert-dialog-content"
        data-akaza-state="open"
        tabindex="-1"
      >
        <div v-if="$slots.header" :class="ui?.header" class="akaza-alert-dialog-header">
          <slot name="header" :close="close" :title-id="titleId" />
        </div>

        <div :class="ui?.body" class="akaza-alert-dialog-body">
          <slot name="body" :close="close" :description-id="descriptionId" />
        </div>

        <div v-if="$slots.footer" :class="ui?.footer" class="akaza-alert-dialog-footer">
          <slot name="footer" :close="close" />
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
  transition: opacity var(--akaza-dialog-duration, 150ms) ease-out,
    transform var(--akaza-dialog-duration, 150ms) ease-out;
}

.akaza-alert-dialog-enter-from,
.akaza-alert-dialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
