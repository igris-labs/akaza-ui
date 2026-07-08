<script setup lang="ts">
import type { Slots } from "vue";
import type { FieldProps } from ".";
import type { FieldControlState, FieldErrorMatch } from "./context";
import { computed, inject, provide, shallowRef, useId, useSlots } from "vue";
import { formContextKey } from "../form/context";
import { fieldContextKey } from "./context";

const {
  as = "div",
  id,
  name,
  label,
  description,
  error,
  errorMatch,
  required = false,
  disabled = false,
  invalid = false,
  dirty,
  touched,
  filled,
  focused,
  ui,
} = defineProps<FieldProps>();

const slots: Slots = useSlots();
const autoId = useId();
const form = inject(formContextKey, null);
const control = shallowRef<FieldControlState | null>(null);

const inputId = computed(() => id ?? `akaza-field-${autoId}`);
const labelId = `akaza-field-label-${autoId}`;
const descriptionId = `akaza-field-description-${autoId}`;
const errorId = `akaza-field-error-${autoId}`;
const hasLabel = computed<boolean>(() => Boolean(label || slots.label));
const hasDescription = computed<boolean>(() => Boolean(description || slots.description));
const formError = computed(() => {
  if (!name) return undefined;
  const value = form?.errors.value?.[name];
  return Array.isArray(value) ? value[0] : value;
});
const validationMessage = computed(() => control.value?.validationMessage.value || "");
const isDirty = computed(() => dirty ?? control.value?.dirty.value ?? false);
const isTouched = computed(() => touched ?? control.value?.touched.value ?? false);
const isFilled = computed(() => filled ?? control.value?.filled.value ?? false);
const isFocused = computed(() => focused ?? control.value?.focused.value ?? false);
const isInvalid = computed<boolean>(() =>
  invalid || Boolean(error || formError.value || control.value?.invalid.value),
);
const isValid = computed(() => !isInvalid.value);
const explicitError = computed(() => error ?? formError.value);

function matchesError(match: FieldErrorMatch | undefined): boolean {
  if (match === undefined) return isInvalid.value;
  if (typeof match === "boolean") return match;
  if (match === "valid") return isValid.value;
  return Boolean(control.value?.validity.value?.[match]);
}

const shownError = computed(() => {
  if (explicitError.value) return explicitError.value;
  if (!matchesError(errorMatch)) return "";
  return validationMessage.value;
});
const hasError = computed<boolean>(() => Boolean(slots.error || shownError.value));
const describedBy = computed<string | undefined>(() =>
  [hasDescription.value ? descriptionId : undefined, hasError.value ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined,
);

const controlProps = computed(() => ({
  id: inputId.value,
  name,
  required,
  disabled,
  "aria-invalid": isInvalid.value || undefined,
  "aria-describedby": describedBy.value,
}));

const stateAttrs = computed(() => ({
  "data-disabled": disabled || undefined,
  "data-valid": isValid.value || undefined,
  "data-invalid": isInvalid.value || undefined,
  "data-dirty": isDirty.value || undefined,
  "data-touched": isTouched.value || undefined,
  "data-filled": isFilled.value || undefined,
  "data-focused": isFocused.value || undefined,
  "data-akaza-disabled": disabled || undefined,
  "data-akaza-valid": isValid.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dirty": isDirty.value || undefined,
  "data-akaza-touched": isTouched.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": isFocused.value || undefined,
}));

function registerControl(state: FieldControlState) {
  control.value = state;
  return () => {
    if (control.value === state) control.value = null;
  };
}

provide(fieldContextKey, {
  inputId,
  name: computed(() => name),
  disabled: computed(() => disabled),
  required: computed(() => required),
  invalid: isInvalid,
  describedBy,
  registerControl,
});
</script>

<template>
  <component
    :is="as"
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-field"
  >
    <label
      v-if="hasLabel"
      :id="labelId"
      :for="inputId"
      :class="ui?.label"
      v-bind="stateAttrs"
      class="akaza-field-label"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        aria-hidden="true"
        :class="ui?.required"
        class="akaza-field-required"
      >*</span>
    </label>

    <div :class="ui?.control" v-bind="stateAttrs" class="akaza-field-control">
      <slot
        :id="inputId"
        :field-name="name"
        :required="required"
        :disabled="disabled"
        :invalid="isInvalid"
        :valid="isValid"
        :dirty="isDirty"
        :touched="isTouched"
        :filled="isFilled"
        :focused="isFocused"
        :described-by="describedBy"
        :control-props="controlProps"
      />
    </div>

    <div
      v-if="hasDescription"
      :id="descriptionId"
      :class="ui?.description"
      v-bind="stateAttrs"
      class="akaza-field-description"
    >
      <slot name="description">{{ description }}</slot>
    </div>

    <div
      v-if="hasError"
      :id="errorId"
      :class="ui?.error"
      v-bind="stateAttrs"
      class="akaza-field-error"
    >
      <slot name="error">{{ shownError }}</slot>
    </div>
  </component>
</template>

<style>
.akaza-field {
  display: grid;
  gap: 0.375rem;
}
</style>
