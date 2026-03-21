import type { Component } from 'vue'

export { default as Button } from './Button.vue'

export interface ButtonProps {
  as?: string | Component
  disabled?: boolean
  focusableWhenDisabled?: boolean
  loading?: boolean
}
