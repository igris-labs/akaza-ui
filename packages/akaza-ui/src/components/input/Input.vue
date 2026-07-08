<script setup lang="ts">
import type { InputProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId, useTemplateRef } from "vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
  type = "text",
  placeholder,
  autocomplete,
  inputmode,
  minlength,
  maxlength,
  pattern,
  required = false,
  disabled = false,
  readonly = false,
  invalid = false,
  ariaLabel,
  ariaDescribedby,
  ui,
} = defineProps<InputProps>();

const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<string>({ default: "" });
const field = inject(fieldContextKey, null);
const autoId = useId();
const inputRef = useTemplateRef<HTMLInputElement>("inputRef");
const initialValue = model.value;
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-input-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const isValid = computed(() => !isInvalid.value);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isFilled = computed(() => model.value.length > 0);
const isDirty = computed(() => model.value !== initialValue);

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

const stateAttrs = computed(() => ({
  "data-disabled": isDisabled.value || undefined,
  "data-valid": isValid.value || undefined,
  "data-invalid": isInvalid.value || undefined,
  "data-dirty": isDirty.value || undefined,
  "data-touched": touched.value || undefined,
  "data-filled": isFilled.value || undefined,
  "data-focused": focused.value || undefined,
  "data-akaza-disabled": isDisabled.value || undefined,
  "data-akaza-valid": isValid.value || undefined,
  "data-akaza-invalid": isInvalid.value || undefined,
  "data-akaza-dirty": isDirty.value || undefined,
  "data-akaza-touched": touched.value || undefined,
  "data-akaza-filled": isFilled.value || undefined,
  "data-akaza-focused": focused.value || undefined,
}));

function updateValidity(reveal = validationActive.value) {
  const input = inputRef.value;
  if (!input) return;
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function onInput(event: Event) {
  validationActive.value = true;
  const value = (event.target as HTMLInputElement).value;
  let canceled = false;
  emit("value-change", value, {
    reason: "input",
    event,
    cancel: () => {
      canceled = true;
    },
  });
  if (!canceled) model.value = value;
  updateValidity();
}

function onFocus() {
  focused.value = true;
}

function onBlur() {
  validationActive.value = true;
  touched.value = true;
  focused.value = false;
  updateValidity();
}

function onInvalid() {
  validationActive.value = true;
  updateValidity();
}

onMounted(() => updateValidity(false));
onUpdated(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <input
    :id="resolvedId"
    ref="inputRef"
    :name="resolvedName"
    :type="type"
    :value="model"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :inputmode="inputmode"
    :minlength="minlength"
    :maxlength="maxlength"
    :pattern="pattern"
    :required="isRequired"
    :disabled="isDisabled"
    :readonly="readonly"
    :aria-label="ariaLabel"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid || undefined"
    :class="ui?.root"
    v-bind="stateAttrs"
    class="akaza-input"
    @blur="onBlur"
    @focus="onFocus"
    @input="onInput"
    @invalid="onInvalid"
  >
</template>
