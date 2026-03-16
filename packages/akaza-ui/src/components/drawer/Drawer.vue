<script setup lang="ts">
import { computed, nextTick, useId, useTemplateRef, watch } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { useFocusTrap } from '../../utils/focusTrap'
import { useDrawer } from '../../composables/drawer'
import type { DrawerSide } from '../../composables/drawer'

export interface DrawerUi {
  overlay?: string
  content?: string
  header?: string
  body?: string
  footer?: string
}

export interface DrawerProps {
  as?: string
  side?: DrawerSide
  inset?: number | string
  closeOnBackdropClick?: boolean
  teleport?: string | false
  ui?: DrawerUi
}

const {
  as = 'div',
  side = 'right',
  inset = 0,
  closeOnBackdropClick = true,
  teleport = 'body',
  ui,
} = defineProps<DrawerProps>()

const model = defineModel<boolean>({ default: false })
const { isOpen, open, close, toggle } = useDrawer(model)

const contentRef = useTemplateRef<HTMLElement>('contentRef')
const titleId = useId()
const descriptionId = useId()
const { activate, deactivate } = useFocusTrap(contentRef)

watch(isOpen, async (val) => {
  if (val) { await nextTick(); activate() }
  else { deactivate() }
})

function onOverlayClick() {
  if (closeOnBackdropClick) close()
}

onKeyStroke('Escape', (e) => {
  if (isOpen.value) { e.preventDefault(); close() }
})

const insetValue = computed(() =>
  typeof inset === 'number' ? `${inset}px` : inset,
)

const drawerStyle = computed(() => ({
  '--akaza-drawer-inset': insetValue.value,
  borderRadius: inset && Number(inset) !== 0 ? '12px' : undefined,
}))

defineExpose({ open, close, toggle, titleId, descriptionId })
</script>

<template>
  <slot name="trigger" :is-open="isOpen" :open="open" :close="close" :toggle="toggle" />

  <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
    <Transition name="akaza-drawer-overlay">
      <div
        v-if="isOpen"
        :class="ui?.overlay"
        class="akaza-drawer-overlay"
        data-akaza-state="open"
        @click="onOverlayClick"
      />
    </Transition>

    <Transition :name="`akaza-drawer-${side}`">
      <component
        :is="as"
        v-if="isOpen"
        ref="contentRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        :class="ui?.content"
        :style="drawerStyle"
        class="akaza-drawer"
        :data-akaza-side="side"
        data-akaza-state="open"
        tabindex="-1"
      >
        <div v-if="$slots.header" :class="ui?.header" class="akaza-drawer-header">
          <slot name="header" :close="close" :title-id="titleId" />
        </div>

        <div :class="ui?.body" class="akaza-drawer-body">
          <slot name="body" :close="close" :description-id="descriptionId" />
        </div>

        <div v-if="$slots.footer" :class="ui?.footer" class="akaza-drawer-footer">
          <slot name="footer" :close="close" />
        </div>
      </component>
    </Transition>
  </Teleport>
</template>

<style>
/* Positioning by side + inset */
.akaza-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
}

.akaza-drawer[data-akaza-side="right"] {
  top: var(--akaza-drawer-inset, 0px);
  right: var(--akaza-drawer-inset, 0px);
  bottom: var(--akaza-drawer-inset, 0px);
}

.akaza-drawer[data-akaza-side="left"] {
  top: var(--akaza-drawer-inset, 0px);
  left: var(--akaza-drawer-inset, 0px);
  bottom: var(--akaza-drawer-inset, 0px);
}

.akaza-drawer[data-akaza-side="top"] {
  top: var(--akaza-drawer-inset, 0px);
  left: var(--akaza-drawer-inset, 0px);
  right: var(--akaza-drawer-inset, 0px);
}

.akaza-drawer[data-akaza-side="bottom"] {
  bottom: var(--akaza-drawer-inset, 0px);
  left: var(--akaza-drawer-inset, 0px);
  right: var(--akaza-drawer-inset, 0px);
}

/* Slide animations */
.akaza-drawer-right-enter-active,
.akaza-drawer-right-leave-active,
.akaza-drawer-left-enter-active,
.akaza-drawer-left-leave-active,
.akaza-drawer-top-enter-active,
.akaza-drawer-top-leave-active,
.akaza-drawer-bottom-enter-active,
.akaza-drawer-bottom-leave-active {
  transition: transform 0.15s ease-out;
}

.akaza-drawer-right-enter-from,
.akaza-drawer-right-leave-to {
  transform: translateX(110%);
}

.akaza-drawer-left-enter-from,
.akaza-drawer-left-leave-to {
  transform: translateX(-110%);
}

.akaza-drawer-top-enter-from,
.akaza-drawer-top-leave-to {
  transform: translateY(-110%);
}

.akaza-drawer-bottom-enter-from,
.akaza-drawer-bottom-leave-to {
  transform: translateY(110%);
}

/* Overlay fade */
.akaza-drawer-overlay-enter-active,
.akaza-drawer-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.akaza-drawer-overlay-enter-from,
.akaza-drawer-overlay-leave-to {
  opacity: 0;
}
</style>
