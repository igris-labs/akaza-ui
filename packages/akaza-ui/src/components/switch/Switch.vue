<script setup lang="ts">
import type { SwitchProps } from '.'

const { disabled = false, ui } = defineProps<SwitchProps>()

const model = defineModel<boolean>({ default: false })

function toggle() {
  if (!disabled) model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :class="ui?.root"
    :data-akaza-state="model ? 'checked' : 'unchecked'"
    :data-akaza-disabled="disabled || undefined"
    :disabled="disabled"
    class="akaza-switch"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <span
      :class="ui?.thumb"
      :data-akaza-state="model ? 'checked' : 'unchecked'"
      class="akaza-switch-thumb"
    >
      <slot name="thumb" :checked="model" />
    </span>
  </button>
</template>
