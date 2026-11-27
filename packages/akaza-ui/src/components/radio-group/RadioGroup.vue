<script setup lang="ts">
import type { RadioGroupProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { isComposing } from "@ui-sdk/core";
import { computed, useTemplateRef } from "vue";
import { useRovingGroup } from "../../composables/internal/sdk/useRovingGroup";
import { createChangeDetails } from "../../utils/changeEvent";
import { useCheckableField } from "../../utils/useCheckableField";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabled = false,
  orientation = "vertical",
  as = "div",
  legend,
  name,
  required,
  loop = true,
  ariaLabel,
  ariaLabelledby,
  getItemDisabled,
  ui,
} = defineProps<RadioGroupProps>();

const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<string>({ default: "" });
const validationRef = useTemplateRef<HTMLInputElement>("validationRef");
const bridge = useCheckableField(model, validationRef, () => focusItem(getRovingIndex()), computed(() => model.value !== ""));
const effectiveDisabled = computed(() => disabled || bridge.field?.disabled.value || false);
const effectiveRequired = computed(() => required || bridge.field?.required.value || false);
const effectiveName = computed(() => name ?? bridge.field?.name.value);

function getValue(option: any): string {
  if (valueKey) return String(option[valueKey]);
  if (typeof option === "string" || typeof option === "number") return String(option);
  return String(option?.value ?? option?.id ?? option);
}

function getLabel(option: any): string | undefined {
  if (typeof option === "string" || typeof option === "number") return String(option);
  if (labelKey && option?.[labelKey] !== undefined) return String(option[labelKey]);
  return option?.label !== undefined ? String(option.label) : undefined;
}

function getDescription(option: any): string | undefined {
  if (descriptionKey && option?.[descriptionKey] !== undefined) return String(option[descriptionKey]);
  return option?.description !== undefined ? String(option.description) : undefined;
}

function isItemDisabled(option: any): boolean {
  if (effectiveDisabled.value) return true;
  if (getItemDisabled) return getItemDisabled(option);
  return option?.disabled === true;
}

const roving = useRovingGroup({
  keys: () => options.map(getValue),
  disabled: key => {
    const index = options.findIndex(option => getValue(option) === key);
    return index < 0 || isItemDisabled(options[index]);
  },
  preferred: () => model.value,
  orientation: () => "both",
  loop: () => loop,
  remember: false,
});

// Roving tabindex: only the selected (or first enabled) item has tabindex=0
function setItemRef(el: HTMLElement | null, option: unknown) {
  roving.bind(getValue(option), el);
}
function focusItem(index: number) {
  if (index >= 0) roving.focus(getValue(options[index]));
}

function getRovingIndex(): number {
  const selectedIdx = options.findIndex((o) => getValue(o) === model.value && !isItemDisabled(o));
  if (selectedIdx >= 0) return selectedIdx;
  return options.findIndex((o) => !isItemDisabled(o));
}

function getTabIndex(index: number): 0 | -1 {
  return roving.tabIndex(getValue(options[index])) === 0 ? 0 : -1;
}

function select(option: any, event?: Event) {
  if (isItemDisabled(option) || validationRef.value?.matches(":disabled")) return;
  const value = getValue(option);
  const changeEvent = createChangeDetails(event ? "select" : "programmatic", event);
  emit("value-change", value, changeEvent.details);
  if (!changeEvent.canceled()) model.value = value;
  if (!changeEvent.canceled()) bridge.onChange();
}

function handleKeyDown(event: KeyboardEvent, index: number) {
  if (event.defaultPrevented || isComposing(event) || isItemDisabled(options[index])) return;
  const isSpace = event.key === " ";

  if (isSpace) {
    event.preventDefault();
    select(options[index], event);
    return;
  }

  const movement = roving.keydown(event, event.currentTarget as HTMLElement);
  if (movement && movement.key !== movement.from) {
    const target = options.find(option => getValue(option) === movement.key);
    if (target !== undefined) select(target, event);
  }
}
</script>

<template>
  <component
    :is="as"
    role="radiogroup"
    v-bind="bridge.attrs.value"
    :aria-invalid="bridge.invalid.value || undefined"
    :aria-describedby="bridge.field?.describedBy.value"
    :aria-label="ariaLabel ?? legend"
    :aria-labelledby="ariaLabelledby ?? bridge.field?.labelledBy.value"
    :aria-orientation="orientation"
    :aria-required="effectiveRequired || undefined"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="effectiveDisabled || undefined"
    :class="ui?.root"
    class="akaza-radio-group"
    @focusin="bridge.onFocus"
    @focusout="!($event.currentTarget as HTMLElement).contains($event.relatedTarget as Node | null) && bridge.onBlur()"
  >
    <input
      ref="validationRef"
      type="text"
      :value="model"
      :required="effectiveRequired"
      :disabled="effectiveDisabled"
      tabindex="-1"
      aria-hidden="true"
      class="akaza-radio-group-input"
      :class="ui?.input"
      @invalid="bridge.onInvalid"
    >
    <slot name="legend" :legend="legend">
      <span v-if="legend" :class="ui?.legend" class="akaza-radio-group-legend">{{ legend }}</span>
    </slot>

    <template v-for="(option, index) in options" :key="getValue(option)">
      <input
        v-if="effectiveName"
        type="radio"
        :name="effectiveName"
        :value="getValue(option)"
        :checked="model === getValue(option)"
        :disabled="isItemDisabled(option)"
        aria-hidden="true"
        tabindex="-1"
        :class="ui?.input"
        class="akaza-radio-group-input"
      >

      <button
        :id="index === getRovingIndex() ? bridge.field?.inputId.value : undefined"
        :ref="(el) => setItemRef(el as HTMLElement | null, option)"
        type="button"
        role="radio"
        :aria-checked="model === getValue(option)"
        :tabindex="getTabIndex(index)"
        :class="ui?.item"
        :data-akaza-state="model === getValue(option) ? 'checked' : 'unchecked'"
        :data-akaza-disabled="isItemDisabled(option) || undefined"
        :disabled="isItemDisabled(option)"
        class="akaza-radio-group-item"
        @click="select(option, $event)"
        @keydown="handleKeyDown($event, index)"
      >
        <slot
          name="item"
          :option="option"
          :value="getValue(option)"
          :label="getLabel(option)"
          :description="getDescription(option)"
          :is-checked="model === getValue(option)"
          :is-disabled="isItemDisabled(option)"
          :select="() => select(option)"
        >
          <span :class="ui?.indicator" class="akaza-radio-group-indicator" aria-hidden="true" />
          <span :class="ui?.text" class="akaza-radio-group-text">
            <span v-if="getLabel(option)" :class="ui?.label" class="akaza-radio-group-label">
              {{ getLabel(option) }}
            </span>
            <span v-if="getDescription(option)" :class="ui?.description" class="akaza-radio-group-description">
              {{ getDescription(option) }}
            </span>
          </span>
        </slot>
      </button>
    </template>
  </component>
</template>

<style>
@layer akaza-reset {
  .akaza-radio-group-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    pointer-events: none;
  }
}
</style>
