export { default as Checkbox } from './Checkbox.vue'

export type CheckboxValue = boolean | 'indeterminate'

export interface CheckboxUi {
  root?: string
  indicator?: string
}

export interface CheckboxProps {
  disabled?: boolean
  ui?: CheckboxUi
}
