<script setup lang="ts">
import type { CollapsibleProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { useId, useTemplateRef } from "vue";
import Panel from "../../composables/internal/sdk/Panel.vue";
import { createChangeDetails, resolveAction } from "../../utils/changeEvent";

const { as = "div", disabled = false, unmountOnHide = false, ui } = defineProps<CollapsibleProps>();

const emit = defineEmits<{
  'open-change': [open: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });

const panelId = `akaza-collapsible-panel-${useId()}`;
const trigger = useTemplateRef<HTMLButtonElement>("trigger");

function handleChange(nextOpen: boolean, reason: string, event?: Event) {
  if (disabled && nextOpen) return;
  const changeEvent = createChangeDetails(reason, event);
  emit('open-change', nextOpen, changeEvent.details);
  if (changeEvent.canceled()) return;
  model.value = nextOpen;
}

function open(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(true, details.reason, details.event);
}
function close(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(false, details.reason, details.event);
}
function toggle(reasonOrEvent?: string | Event, event?: Event) {
  const details = resolveAction(reasonOrEvent, event);
  handleChange(!model.value, details.reason, details.event);
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
      ref="trigger"
      type="button"
      :aria-expanded="model"
      :aria-controls="panelId"
      :class="ui?.trigger"
      :data-akaza-state="model ? 'open' : 'closed'"
      :data-akaza-disabled="disabled || undefined"
      :disabled="disabled"
      class="akaza-collapsible-trigger"
      @click="toggle('trigger', $event)"
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
          :class="ui?.icon"
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

    <Panel
      :id="panelId"
      role="region"
      :open="model"
      :unmount-on-hide="unmountOnHide"
      prefix="akaza-collapsible"
      :trigger="() => trigger ?? undefined"
      :ui="ui"
      :class="ui?.contentWrapper"
    >
      <slot
        name="content"
        :is-open="model"
        :close="close"
      />
    </Panel>
  </component>
</template>

<style>
@layer akaza-reset {

    .akaza-collapsible-trigger {
      background: none;
      border: none;
      padding: 0;
    }

  .akaza-collapsible-icon {
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

  .akaza-collapsible-icon[data-akaza-state="open"] {
      transform: rotate(180deg);
    }

  .akaza-collapsible-content {
    display: block;
    height: var(--akaza-collapsible-content-height, auto);
    overflow: hidden;
    transition: height 0.15s ease-out;
  }

  .akaza-collapsible-content[data-starting-style],
  .akaza-collapsible-content[data-ending-style] {
    height: 0;
  }

  .akaza-collapsible-content[hidden] {
    display: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-collapsible-content,
    .akaza-collapsible-icon {
      transition: none;
    }
  }

  .akaza-collapsible-content-inner {
    min-height: 0;
    overflow: hidden;
  }
}
</style>
