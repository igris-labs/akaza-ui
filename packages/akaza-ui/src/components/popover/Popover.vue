<script setup lang="ts">
import { nextTick, ref, useId, useTemplateRef, watch } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { usePopover } from '../../composables/popover'

export type PopoverDirection = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverUi {
  content?: string
}

export interface PopoverProps {
  direction?: PopoverDirection
  teleport?: string | false
  transition?: string | false
  ui?: PopoverUi
}

const { direction = 'bottom', teleport = 'body', transition = 'akaza-popover', ui } = defineProps<PopoverProps>()

const model = defineModel<boolean>({ default: false })
const { open, close, toggle } = usePopover(model)

const popoverId = useId()
const triggerRef = useTemplateRef<HTMLElement>('triggerRef')
const contentRef = useTemplateRef<HTMLElement>('contentRef')

// Ignore clicks inside the popover content so it doesn't close on interaction
onClickOutside(triggerRef, () => { if (model.value) close() }, { ignore: [contentRef] })
onKeyStroke('Escape', (e) => { if (model.value) { e.preventDefault(); close() } })

const GAP = 6
const posStyle = ref({ top: '-9999px', left: '-9999px' })
const actualDirection = ref<PopoverDirection>(direction)

function computePosition() {
  if (!triggerRef.value || !contentRef.value) return

  const t = triggerRef.value.getBoundingClientRect()
  const c = contentRef.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const order: PopoverDirection[] = [direction, 'bottom', 'top', 'right', 'left']
  const candidates = [...new Set(order)]

  let chosen: PopoverDirection = candidates[candidates.length - 1]!
  for (const d of candidates) {
    if (d === 'top' && t.top >= c.height + GAP) { chosen = d; break }
    if (d === 'bottom' && vh - t.bottom >= c.height + GAP) { chosen = d; break }
    if (d === 'right' && vw - t.right >= c.width + GAP) { chosen = d; break }
    if (d === 'left' && t.left >= c.width + GAP) { chosen = d; break }
  }

  let top = 0
  let left = 0
  if (chosen === 'top') {
    top = t.top - c.height - GAP
    left = t.left
  }
  else if (chosen === 'bottom') {
    top = t.bottom + GAP
    left = t.left
  }
  else if (chosen === 'left') {
    top = t.top
    left = t.left - c.width - GAP
  }
  else {
    top = t.top
    left = t.right + GAP
  }

  // Clamp to viewport
  top = Math.max(4, Math.min(top, vh - c.height - 4))
  left = Math.max(4, Math.min(left, vw - c.width - 4))

  actualDirection.value = chosen
  posStyle.value = { top: `${top}px`, left: `${left}px` }
}

watch(model, async (val) => {
  if (val) {
    await nextTick()
    computePosition()
  }
})
</script>

<template>
  <span ref="triggerRef" :data-akaza-state="model ? 'open' : 'closed'" class="akaza-popover-root">
    <slot name="trigger" :is-open="model" :open="open" :close="close" :toggle="toggle" />
    <Teleport :to="typeof teleport === 'string' ? teleport : 'body'" :disabled="teleport === false">
      <Transition v-bind="typeof transition === 'string' ? { name: transition } : {}" :css="transition !== false">
        <div
          v-if="model"
          :id="popoverId"
          ref="contentRef"
          :class="ui?.content"
          :data-akaza-state="'open'"
          :data-akaza-direction="actualDirection"
          :style="posStyle"
          class="akaza-popover-content"
        >
          <slot name="content" :close="close" />
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
.akaza-popover-enter-active,
.akaza-popover-leave-active {
  transition: opacity 0.1s ease-out, transform 0.1s ease-out;
}

.akaza-popover-enter-from,
.akaza-popover-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
