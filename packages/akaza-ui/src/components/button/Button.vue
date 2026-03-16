<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

export interface ButtonProps {
  as?: string | Component
  disabled?: boolean
  focusableWhenDisabled?: boolean
  loading?: boolean
}

const {
  as = 'button',
  disabled = false,
  focusableWhenDisabled = false,
  loading = false,
} = defineProps<ButtonProps>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

// loading implies disabled — neither should fire clicks
const isDisabled = computed(() => disabled || loading)

function onClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    :disabled="as === 'button' && isDisabled && !focusableWhenDisabled ? true : undefined"
    :aria-disabled="isDisabled ? true : undefined"
    :aria-busy="loading ? true : undefined"
    :tabindex="focusableWhenDisabled ? 0 : isDisabled ? -1 : undefined"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-loading="loading || undefined"
    :data-akaza-state="loading ? 'loading' : disabled ? 'disabled' : 'enabled'"
    class="akaza-button"
    @click="onClick"
  >
    <slot v-if="!loading" />
    <slot v-else name="loading">
      <svg
        class="akaza-button-spinner"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span class="sr-only">Loading…</span>
    </slot>
  </component>
</template>
