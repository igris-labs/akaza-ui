export { default as Accordion } from './Accordion.vue'

export interface AccordionUi {
  trigger?: string
  content?: string
}

export interface AccordionProps {
  items: any[]
  /** Property to use as value when items are objects. Falls back to item.value → item.id → String(item). */
  valueKey?: string
  type?: 'single' | 'multiple'
  /** Allow toggling open item closed again (single mode only). */
  collapsible?: boolean
  as?: string
  ui?: AccordionUi
}
