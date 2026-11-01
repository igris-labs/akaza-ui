<script setup lang="ts">
import type { ToggleProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { createChangeDetails } from "../../utils/changeEvent";

const { as = "button", disabled = false, ariaLabel, ui } = defineProps<ToggleProps>();

const emit = defineEmits<{
  "pressed-change": [pressed: boolean, details: AkazaChangeEventDetails];
}>();

const model = defineModel<boolean>({ default: false });

function toggle(event?: Event) {
  if (disabled) return;
  const next = !model.value;
  const changeEvent = createChangeDetails(event ? "trigger" : "programmatic", event);
  emit("pressed-change", next, changeEvent.details);
  if (!changeEvent.canceled()) model.value = next;
}

function onKeydown(event: KeyboardEvent) {
  if (as === "button") return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggle(event);
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    :role="as === 'button' ? undefined : 'button'"
    :aria-pressed="model"
    :aria-disabled="disabled || undefined"
    :aria-label="ariaLabel"
    :data-akaza-state="model ? 'on' : 'off'"
    :data-akaza-disabled="disabled || undefined"
    :disabled="as === 'button' ? disabled : undefined"
    :tabindex="as === 'button' ? undefined : disabled ? -1 : 0"
    :class="ui?.root"
    class="akaza-toggle"
    @click="toggle($event)"
    @keydown="onKeydown"
  >
    <slot
      :pressed="model"
      :state="model ? 'on' : 'off'"
    />
  </component>
</template>
