<script setup lang="ts">
import { computed } from 'vue'

export interface ProgressUi {
  root?: string
  indicator?: string
}

export interface ProgressProps {
  max?: number
  ui?: ProgressUi
}

const { max = 100, ui } = defineProps<ProgressProps>()

const model = defineModel<number | null>({ default: null })

const state = computed(() => {
  if (model.value === null) return 'indeterminate'
  return model.value >= max ? 'complete' : 'loading'
})

const percentage = computed(() => {
  if (model.value === null) return null
  return Math.min(100, Math.max(0, (model.value / max) * 100))
})
</script>

<template>
  <div
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="model ?? undefined"
    :class="ui?.root"
    :data-akaza-state="state"
    class="akaza-progress"
  >
    <div
      :class="ui?.indicator"
      :data-akaza-state="state"
      class="akaza-progress-indicator"
    >
      <slot name="indicator" :value="model" :percentage="percentage" :max="max" :state="state" />
    </div>
  </div>
</template>
