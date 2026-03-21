<script setup lang="ts">
import type { AccordionProps } from '.'

const {
  items,
  valueKey,
  type = 'single',
  collapsible = false,
  as = 'div',
  ui,
} = defineProps<AccordionProps>()

const model = defineModel<string | string[]>({ default: '' })

function getValue(item: any): string {
  if (valueKey) return String(item[valueKey])
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  return String(item?.value ?? item?.id ?? item)
}

function isOpen(item: any): boolean {
  const v = getValue(item)
  if (type === 'single') return (model.value as string) === v
  return Array.isArray(model.value) && model.value.includes(v)
}

function toggle(item: any) {
  const v = getValue(item)
  if (type === 'single') {
    const current = (model.value as string) ?? ''
    model.value = current === v && collapsible ? '' : v
  }
  else {
    const current = Array.isArray(model.value) ? model.value : []
    model.value = current.includes(v)
      ? current.filter(x => x !== v)
      : [...current, v]
  }
}
</script>

<template>
  <component :is="as" data-akaza-orientation="vertical" class="akaza-accordion">
    <div
      v-for="item in items"
      :key="getValue(item)"
      :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
      class="akaza-accordion-item"
    >
      <button
        type="button"
        :aria-expanded="isOpen(item)"
        :class="ui?.trigger"
        :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
        class="akaza-accordion-trigger"
        @click="toggle(item)"
      >
        <slot
          name="trigger"
          :item="item"
          :value="getValue(item)"
          :is-open="isOpen(item)"
          :toggle="() => toggle(item)"
        />
        <slot name="icon" :is-open="isOpen(item)" :item="item">
          <svg
            class="akaza-accordion-icon"
            :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </slot>
      </button>

      <div
        class="akaza-accordion-content"
        :data-akaza-state="isOpen(item) ? 'open' : 'closed'"
      >
        <div :class="ui?.content" class="akaza-accordion-content-inner">
          <slot
            name="content"
            :item="item"
            :value="getValue(item)"
            :is-open="isOpen(item)"
          />
        </div>
      </div>
    </div>
  </component>
</template>

<style>
.akaza-accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.akaza-accordion-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.akaza-accordion-icon[data-akaza-state="open"] {
  transform: rotate(180deg);
}

.akaza-accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.15s ease-out;
}

.akaza-accordion-content[data-akaza-state="open"] {
  grid-template-rows: 1fr;
}

.akaza-accordion-content-inner {
  min-height: 0;
  overflow: hidden;
}
</style>
