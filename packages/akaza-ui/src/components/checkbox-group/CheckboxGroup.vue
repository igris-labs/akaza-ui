<script setup lang="ts">
import type { CheckboxGroupOption, CheckboxGroupProps, CheckboxGroupValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CheckboxUi, CheckboxValue } from "../checkbox";
import { computed } from "vue";
import { Checkbox } from "../checkbox";

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

const hasValue = computed(() => model.value.length > 0);
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
  const props: { name?: string; description?: string; ui?: CheckboxUi } = {};
  const description = getDescription(option);
  if (name) props.name = name;
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
  return disabled || Boolean(option[disabledKey]);
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
}

function setAll(value: CheckboxValue, details: AkazaChangeEventDetails) {
  if (disabled) return;
  const checked = value === true;
  const targetValues = checked ? enabledOptionValues.value : [];
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
}
</script>

<template>
  <div
    role="group"
    :aria-label="ariaLabel ?? legend"
    :aria-labelledby="ariaLabelledby"
    :aria-required="required || undefined"
    :class="ui?.root"
    :data-akaza-orientation="orientation"
    :data-akaza-disabled="disabled || undefined"
    :data-disabled="disabled || undefined"
    class="akaza-checkbox-group"
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
        :disabled="disabled"
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
      v-for="(option, index) in options"
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
          :required="required && !hasValue && index === 0"
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
.akaza-checkbox-group {
  display: grid;
  gap: 0.5rem;
}

.akaza-checkbox-group[data-akaza-orientation="horizontal"] {
  display: flex;
  flex-wrap: wrap;
}
</style>
