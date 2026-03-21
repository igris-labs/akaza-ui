<script setup lang="ts">
import type { RadioGroupProps } from '.'

const {
  options,
  valueKey,
  disabled = false,
  orientation = 'vertical',
  as = 'div',
  ui,
} = defineProps<RadioGroupProps>()

const model = defineModel<string>({ default: '' })

function getValue(option: any): string {
  if (valueKey) return String(option[valueKey])
  if (typeof option === 'string' || typeof option === 'number') return String(option)
  return String(option?.value ?? option?.id ?? option)
}

function select(option: any) {
  if (!disabled) model.value = getValue(option)
}
</script>

<template>
  <component
    :is="as"
    role="radiogroup"
    :aria-orientation="orientation"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-radio-group"
  >
    <button
      v-for="option in options"
      :key="getValue(option)"
      type="button"
      role="radio"
      :aria-checked="model === getValue(option)"
      :class="ui?.item"
      :data-akaza-state="model === getValue(option) ? 'checked' : 'unchecked'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-radio-group-item"
      @click="select(option)"
      @keydown.space.prevent="select(option)"
    >
      <slot
        name="item"
        :option="option"
        :value="getValue(option)"
        :is-checked="model === getValue(option)"
        :select="() => select(option)"
      />
    </button>
  </component>
</template>
