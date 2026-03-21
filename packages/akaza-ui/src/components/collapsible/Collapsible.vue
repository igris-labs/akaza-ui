<script setup lang="ts">
import type { CollapsibleProps } from ".";

const { as = "div", disabled = false, ui } = defineProps<CollapsibleProps>();

const model = defineModel<boolean>({ default: false });

function toggle() {
  if (!disabled) model.value = !model.value;
}

function close() {
  model.value = false;
}
</script>

<template>
  <component
    :is="as"
    :data-akaza-state="model ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-collapsible"
  >
    <button
      type="button"
      :aria-expanded="model"
      :class="ui?.trigger"
      :data-akaza-state="model ? 'open' : 'closed'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-collapsible-trigger"
      @click="toggle"
    >
      <slot
        name="trigger"
        :is-open="model"
        :toggle="toggle"
      />
      <slot
        name="icon"
        :is-open="model"
      >
        <svg
          class="akaza-collapsible-icon"
          :data-akaza-state="model ? 'open' : 'closed'"
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
      class="akaza-collapsible-content"
      :data-akaza-state="model ? 'open' : 'closed'"
    >
      <div
        :class="ui?.content"
        class="akaza-collapsible-content-inner"
      >
        <slot
          name="content"
          :close="close"
        />
      </div>
    </div>
  </component>
</template>

<style>
.akaza-collapsible-trigger {
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

.akaza-collapsible-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.akaza-collapsible-icon[data-akaza-state="open"] {
  transform: rotate(180deg);
}

.akaza-collapsible-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.11s ease-out;
}

.akaza-collapsible-content[data-akaza-state="open"] {
  grid-template-rows: 1fr;
}

.akaza-collapsible-content-inner {
  min-height: 0;
  overflow: hidden;
}
</style>
