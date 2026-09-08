<script setup lang="ts">
import type { CheckboxGroupOption, CheckboxGroupProps, CheckboxGroupValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CheckboxUi, CheckboxValue } from "../checkbox";
import { computed, provide, useTemplateRef } from "vue";
import { useCheckableField } from "../../utils/useCheckableField";
import { Checkbox } from "../checkbox";
import { fieldContextKey } from "../field/context";

const {
  options,
  valueKey,
  labelKey = "label",
  descriptionKey = "description",
  disabledKey = "disabled",
  allValues,
  parent = false,
  parentLabel = "Select all",
  parentDescription,
  disabled = false,
  required = false,
  orientation = "vertical",
  legend,
  name,
  ariaLabel,
  ariaLabelledby,
  ui,
} = defineProps<CheckboxGroupProps>();

const emit = defineEmits<{
  "value-change": [value: CheckboxGroupValue[], details: AkazaChangeEventDetails];
}>();

const model = defineModel<CheckboxGroupValue[]>({ default: () => [] });
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const validationRef = useTemplateRef<HTMLInputElement>("validationRef");
const bridge = useCheckableField(model, validationRef, () => rootRef.value?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(), computed(() => model.value.length > 0));
const effectiveDisabled = computed(() => disabled || bridge.field?.disabled.value || false);
const effectiveRequired = computed(() => required || bridge.field?.required.value || false);
const effectiveName = computed(() => name ?? bridge.field?.name.value);
provide(fieldContextKey, null);

const optionValues = computed(() => allValues ?? options.map((option) => getValue(option)));
const enabledOptionValues = computed(() =>
  optionValues.value.filter((value) => {
    const option = options.find((item) => getValue(item) === value);
    return option ? !isItemDisabled(option) : true;
  }),
);
const parentState = computed<CheckboxValue>(() => {
  const values = enabledOptionValues.value;
  const checkedCount = values.filter((value) => model.value.includes(value)).length;
  if (checkedCount === 0) return false;
  if (checkedCount === values.length) return true;
  return "indeterminate";
});

function getValue(option: CheckboxGroupOption): CheckboxGroupValue {
  if (valueKey) return option[valueKey] as CheckboxGroupValue;
  return option.value ?? String(option.label ?? option);
}

function getLabel(option: CheckboxGroupOption): string {
  return String(option[labelKey] ?? getValue(option));
}

function getDescription(option: CheckboxGroupOption): string | undefined {
  const description = option[descriptionKey];
  return description === undefined ? undefined : String(description);
}

function getCheckboxProps(option: CheckboxGroupOption) {
  const props: { id?: string; name?: string; description?: string; ui?: CheckboxUi } = {};
  if (option === options.find(item => !isItemDisabled(item)) && bridge.field) props.id = bridge.field.inputId.value;
  const description = getDescription(option);
  if (effectiveName.value) props.name = effectiveName.value;
  if (description) props.description = description;
  if (ui?.checkbox) props.ui = ui.checkbox;
  return props;
}

function getParentCheckboxProps() {
  const props: { description?: string; ui?: CheckboxUi } = {};
  if (parentDescription) props.description = parentDescription;
  if (ui?.checkbox) props.ui = ui.checkbox;
  return props;
}

function isItemDisabled(option: CheckboxGroupOption): boolean {
  return effectiveDisabled.value || Boolean(option[disabledKey]);
}

function isChecked(option: CheckboxGroupOption): boolean {
  return model.value.includes(getValue(option));
}

function setOption(option: CheckboxGroupOption, checked: boolean, details: AkazaChangeEventDetails) {
  if (isItemDisabled(option)) return;
  const value = getValue(option);
  const next = checked
    ? [...new Set([...model.value, value])]
    : model.value.filter((item) => item !== value);

  let canceled = false;
  emit("value-change", next, {
    reason: details.reason,
    ...(details.event && { event: details.event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) {
    details.cancel();
    return;
  }
  model.value = next;
  bridge.onChange();
}

function setAll(value: CheckboxValue, details: AkazaChangeEventDetails) {
  if (effectiveDisabled.value || validationRef.value?.matches(":disabled")) return;
  const checked = value === true;
  const retained = model.value.filter(item => !enabledOptionValues.value.includes(item));
  const targetValues = checked ? [...retained, ...enabledOptionValues.value] : retained;
  let canceled = false;
  emit("value-change", targetValues, {
    reason: details.reason,
    ...(details.event && { event: details.event }),
    cancel: () => {
      canceled = true;
    },
  });
  if (canceled) {
    details.cancel();
    return;
  }
  model.value = targetValues;
  bridge.onChange();
}
</script>

<template>
  <div
    ref="rootRef"
    v-bind="bridge.attrs.value"
    :aria-invalid="bridge.invalid.value || undefined"
    :aria-describedby="bridge.field?.describedBy.value"
    role="group"
    :aria-label="ariaLabel ?? legend"
    :aria-labelledby="ariaLabelledby ?? bridge.field?.labelledBy.value"
    :aria-required="effectiveRequired || undefined"
    :class="ui?.root"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="effectiveDisabled || undefined"
    :data-disabled="effectiveDisabled || undefined"
    class="akaza-checkbox-group"
    @focusin="bridge.onFocus"
    @focusout="!rootRef?.contains($event.relatedTarget as Node | null) && bridge.onBlur()"
  >
    <input
      ref="validationRef"
      type="text"
      :value="model.length ? 'selected' : ''"
      :required="effectiveRequired"
      :disabled="effectiveDisabled"
      tabindex="-1"
      aria-hidden="true"
      class="akaza-checkbox-group-input"
      :class="ui?.input"
      @invalid="bridge.onInvalid"
    >
    <div
      v-if="legend"
      :class="ui?.legend"
      class="akaza-checkbox-group-legend"
    >
      {{ legend }}
    </div>

    <div
      v-if="parent"
      :class="ui?.parentItem"
      class="akaza-checkbox-group-parent"
      :data-akaza-state="parentState === true ? 'checked' : parentState === 'indeterminate' ? 'indeterminate' : 'unchecked'"
      :data-state="parentState === true ? 'checked' : parentState === 'indeterminate' ? 'indeterminate' : 'unchecked'"
      :data-akaza-disabled="disabled || undefined"
      :data-disabled="disabled || undefined"
    >
      <Checkbox
        :model-value="parentState"
        :true-value="true"
        :false-value="false"
        :disabled="effectiveDisabled"
        :label="parentLabel"
        v-bind="getParentCheckboxProps()"
        @value-change="setAll"
      >
        <template #indicator="{ checked }">
          <slot name="parent-indicator" :checked="checked" />
        </template>
      </Checkbox>
    </div>

    <div
      v-for="option in options"
      :key="String(getValue(option))"
      :class="ui?.item"
      class="akaza-checkbox-group-item"
      :data-akaza-state="isChecked(option) ? 'checked' : 'unchecked'"
      :data-state="isChecked(option) ? 'checked' : 'unchecked'"
      :data-akaza-disabled="isItemDisabled(option) || undefined"
      :data-disabled="isItemDisabled(option) || undefined"
    >
      <slot
        name="item"
        :option="option"
        :value="getValue(option)"
        :checked="isChecked(option)"
        :disabled="isItemDisabled(option)"
      >
        <Checkbox
          :model-value="isChecked(option) ? getValue(option) : false"
          :true-value="getValue(option)"
          :false-value="false"
          :disabled="isItemDisabled(option)"
          :label="getLabel(option)"
          v-bind="getCheckboxProps(option)"
          @value-change="(value: CheckboxValue, details: AkazaChangeEventDetails) => setOption(option, value === getValue(option), details)"
        >
          <template #indicator="{ checked }">
            <slot name="indicator" :option="option" :checked="checked" />
          </template>
          <template v-if="option.slot && $slots[option.slot]" #label>
            <slot :name="option.slot" :option="option" :value="getValue(option)" />
          </template>
        </Checkbox>
      </slot>
    </div>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-checkbox-group-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .akaza-checkbox-group {
    display: grid;
  }

  .akaza-checkbox-group[data-akaza-orientation="horizontal"] {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
