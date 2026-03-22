<script setup lang="ts">
import type { CollapsibleProps } from ".";
import { useId } from "vue";

const { as = "div", disabled = false, unmountOnHide = false, ui } = defineProps<CollapsibleProps>();

const model = defineModel<boolean>({ default: false });

const panelId = `akaza-collapsible-panel-${useId()}`;

function open() {
  if (!disabled) model.value = true;
}

function close() {
  model.value = false;
}

function toggle() {
  if (!disabled) model.value = !model.value;
}

defineExpose({ open, close, toggle });
</script>

<template>
  <component
    :is="as"
    :class="ui?.root"
    :data-akaza-state="model ? 'open' : 'closed'"
    :data-akaza-disabled="disabled || undefined"
    class="akaza-collapsible"
  >
    <button
      type="button"
      :aria-expanded="model"
      :aria-controls="panelId"
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
        :open="open"
        :close="close"
        :toggle="toggle"
      />
      <slot name="icon" :is-open="model">
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
      :id="panelId"
      role="region"
      class="akaza-collapsible-content"
      :data-akaza-state="model ? 'open' : 'closed'"
    >
      <div class="akaza-collapsible-content-inner">
        <div
          :class="ui?.content"
          class="akaza-collapsible-content-body"
        >
          <template v-if="!unmountOnHide || model">
            <slot
              name="content"
              :is-open="model"
              :close="close"
            />
          </template>
        </div>
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

.akaza-collapsible-trigger:disabled,
.akaza-collapsible-trigger[data-akaza-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
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
  transition: grid-template-rows 0.15s ease-out;
}

.akaza-collapsible-content[data-akaza-state="open"] {
  grid-template-rows: 1fr;
}

.akaza-collapsible-content-inner {
  min-height: 0;
  overflow: hidden;
}
</style>
