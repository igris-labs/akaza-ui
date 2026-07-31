<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { TagsInputProps, TagsInputValue } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId } from "vue";
import { fieldContextKey } from "../field/context";

const {
  displayValue,
  convertValue,
  serializeValue,
  isEqual,
  validate,
  delimiter = ",",
  addOnBlur = false,
  addOnPaste = false,
  addOnTab = false,
  duplicate = false,
  max = 0,
  trim = true,
  clearable = false,
  placeholder,
  maxLength,
  autoFocus = false,
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  dir = "ltr",
  ariaLabel = "Tags input",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<TagsInputProps>();

const emit = defineEmits<{
  "value-change": [value: TagsInputValue[], details: AkazaChangeEventDetails];
  "input-change": [value: string, details: AkazaChangeEventDetails];
  add: [value: TagsInputValue, details: AkazaChangeEventDetails];
  remove: [value: TagsInputValue, details: AkazaChangeEventDetails];
  "invalid-value": [value: TagsInputValue | string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<TagsInputValue[]>({ default: () => [] });
const inputModel = defineModel<string>("input", { default: "" });
const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = ref<HTMLElement | null>(null);
const hiddenRef = ref<HTMLInputElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const itemRefs = ref<Array<HTMLElement | null>>([]);
const activeIndex = ref(-1);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);

const initialValue = [...model.value];
const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-tags-input-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isFilled = computed(() => model.value.length > 0);
const isAtMax = computed(() => max > 0 && model.value.length >= max);
const isDirty = computed(() => !valuesEqual(model.value, initialValue));
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isFilled.value ? "filled" : "empty");

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function valueLabel(value: TagsInputValue): string {
  if (displayValue) return displayValue(value);
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function formValue(value: TagsInputValue): string {
  if (serializeValue) return serializeValue(value);
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function equal(a: TagsInputValue, b: TagsInputValue): boolean {
  return isEqual ? isEqual(a, b) : Object.is(a, b);
}

function valuesEqual(a: TagsInputValue[], b: TagsInputValue[]): boolean {
  return a.length === b.length && a.every((value, index) => equal(value, b[index]!));
}

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isFilled.value ? "Add at least one tag." : "");
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function createDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  };
  return { details, canceled: () => canceled };
}

function commitValue(value: TagsInputValue[], reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const change = createDetails(reason, event);
  emit("value-change", value, change.details);
  if (change.canceled()) return false;
  validationActive.value = true;
  model.value = value;
  nextTick(updateValidity);
  return true;
}

function setInput(value: string, reason: string, event?: Event): boolean {
  const change = createDetails(reason, event);
  emit("input-change", value, change.details);
  if (change.canceled()) return false;
  inputModel.value = value;
  return true;
}

function emitInvalidValue(value: TagsInputValue | string, reason: string, event?: Event) {
  emit("invalid-value", value, createDetails(reason, event).details);
}

function toTag(rawValue: string): TagsInputValue | undefined {
  const value = trim ? rawValue.trim() : rawValue;
  if (!value) return undefined;
  return convertValue ? convertValue(value) : value;
}

function addTag(rawValue = inputModel.value, event?: Event, reason = "add"): boolean {
  if (isDisabled.value || readOnly) return false;
  let value: TagsInputValue | undefined;
  try {
    value = toTag(rawValue);
  } catch {
    emitInvalidValue(rawValue, "convert", event);
    return false;
  }
  if (value === undefined) {
    emitInvalidValue(rawValue, "empty", event);
    return false;
  }
  if (validate && !validate(value)) {
    emitInvalidValue(value, "invalid", event);
    return false;
  }
  if (!duplicate && model.value.some((item) => equal(item, value))) {
    emitInvalidValue(value, "duplicate", event);
    return false;
  }
  if (isAtMax.value) {
    emitInvalidValue(value, "max", event);
    return false;
  }
  const addChange = createDetails(reason, event);
  emit("add", value, addChange.details);
  if (addChange.canceled()) return false;
  if (!commitValue([...model.value, value], reason, event)) return false;
  setInput("", reason, event);
  activeIndex.value = -1;
  return true;
}

function removeTag(index: number, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const value = model.value[index];
  if (value === undefined) return false;
  const removeChange = createDetails("remove", event);
  emit("remove", value, removeChange.details);
  if (removeChange.canceled()) return false;
  const next = model.value.filter((_, itemIndex) => itemIndex !== index);
  return commitValue(next, "remove", event);
}

function clear(event?: Event) {
  if (!commitValue([], "clear", event)) return;
  activeIndex.value = -1;
  nextTick(() => inputRef.value?.focus());
}

function splitInput(value: string): string[] {
  return value.split(delimiter).map((item) => trim ? item.trim() : item).filter(Boolean);
}

function isDelimiterKey(key: string): boolean {
  if (typeof delimiter === "string") return delimiter.length === 1 && key === delimiter;
  return new RegExp(delimiter.source, delimiter.flags.replace(/[gy]/g, "")).test(key);
}

function setItemRef(element: Element | ComponentPublicInstance | null, index: number) {
  itemRefs.value[index] = element as HTMLElement | null;
}

function focusItem(index: number) {
  if (index < 0 || index >= model.value.length) {
    activeIndex.value = -1;
    inputRef.value?.focus();
    return;
  }
  activeIndex.value = index;
  itemRefs.value[index]?.focus();
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!setInput(target.value, "input", event)) target.value = inputModel.value;
}

function onInputKeydown(event: KeyboardEvent) {
  if (isDisabled.value || readOnly) return;
  if (event.key === "Enter" || isDelimiterKey(event.key)) {
    if (!inputModel.value) return;
    event.preventDefault();
    addTag(inputModel.value, event, "keyboard");
  } else if (event.key === "Tab" && addOnTab && inputModel.value) {
    event.preventDefault();
    addTag(inputModel.value, event, "tab");
  } else if (event.key === "Backspace" && !inputModel.value && model.value.length) {
    event.preventDefault();
    focusItem(model.value.length - 1);
  } else if (event.key === (dir === "rtl" ? "ArrowRight" : "ArrowLeft")) {
    const input = event.target as HTMLInputElement;
    if (input.selectionStart === 0 && model.value.length) {
      event.preventDefault();
      focusItem(model.value.length - 1);
    }
  }
}

function onItemKeydown(index: number, event: KeyboardEvent) {
  const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  if (event.key === previousKey || event.key === nextKey) {
    event.preventDefault();
    focusItem(index + (event.key === nextKey ? 1 : -1));
  } else if (event.key === "Home") {
    event.preventDefault();
    focusItem(0);
  } else if (event.key === "End") {
    event.preventDefault();
    focusItem(model.value.length - 1);
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    if (removeTag(index, event)) nextTick(() => focusItem(Math.min(index, model.value.length - 1)));
  } else if (event.key === "Escape") {
    event.preventDefault();
    focusItem(-1);
  }
}

function onPaste(event: ClipboardEvent) {
  if (!addOnPaste || isDisabled.value || readOnly) return;
  const rawValue = event.clipboardData?.getData("text") ?? "";
  const values = splitInput(rawValue);
  if (values.length < 2 && !isDelimiterKey(rawValue)) return;
  event.preventDefault();
  const next = [...model.value];
  for (const rawTag of values) {
    let value: TagsInputValue | undefined;
    try {
      value = toTag(rawTag);
    } catch {
      emitInvalidValue(rawTag, "convert", event);
      continue;
    }
    if (value === undefined || (validate && !validate(value))) {
      emitInvalidValue(value ?? rawTag, value === undefined ? "empty" : "invalid", event);
      continue;
    }
    if (!duplicate && next.some((item) => equal(item, value))) {
      emitInvalidValue(value, "duplicate", event);
      continue;
    }
    if (max > 0 && next.length >= max) {
      emitInvalidValue(value, "max", event);
      continue;
    }
    const addChange = createDetails("paste", event);
    emit("add", value, addChange.details);
    if (!addChange.canceled()) next.push(value);
  }
  if (!valuesEqual(next, model.value) && commitValue(next, "paste", event)) {
    setInput("", "paste", event);
    activeIndex.value = -1;
  }
}

function onInputBlur(event: FocusEvent) {
  if (addOnBlur && inputModel.value) addTag(inputModel.value, event, "blur");
}

function onFocusIn() {
  focused.value = true;
}

function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  focused.value = false;
  activeIndex.value = -1;
  touched.value = true;
  validationActive.value = true;
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  nextTick(() => inputRef.value?.focus());
}

function onRootClick(event: MouseEvent) {
  if (event.target === rootRef.value && !isDisabled.value) inputRef.value?.focus();
}

function getInputProps() {
  return {
    id: resolvedId.value,
    ref: (element: Element | ComponentPublicInstance | null) => {
      inputRef.value = element as HTMLInputElement | null;
    },
    type: "text",
    value: inputModel.value,
    placeholder,
    maxlength: maxLength,
    disabled: isDisabled.value,
    readonly: readOnly || isAtMax.value,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": describedBy.value,
    "aria-invalid": isInvalid.value || undefined,
    "data-akaza-disabled": isDisabled.value || undefined,
    "data-akaza-readonly": readOnly || undefined,
    "data-akaza-invalid": isInvalid.value || undefined,
    class: ["akaza-tags-input-input", ui?.input],
    onInput,
    onKeydown: onInputKeydown,
    onPaste,
    onBlur: onInputBlur,
  };
}

defineExpose({ add: addTag, clear, focus: () => inputRef.value?.focus() });

onMounted(() => {
  updateValidity(false);
  if (autoFocus) nextTick(() => inputRef.value?.focus());
});
onUpdated(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <div
    ref="rootRef"
    role="group"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="describedBy"
    :class="ui?.root"
    class="akaza-tags-input"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-focused="focused || undefined"
    :data-akaza-filled="isFilled || undefined"
    :data-akaza-max="isAtMax || undefined"
    :dir="dir"
    @click="onRootClick"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <input
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="model.length ? formValue(model[0]!) : ''"
      :required="isRequired"
      :disabled="isDisabled"
      :aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-tags-input-hidden-input"
      @invalid="onInvalid"
    >
    <input
      v-for="value in model.slice(1)"
      :key="formValue(value)"
      type="hidden"
      :name="resolvedName"
      :value="formValue(value)"
      :disabled="isDisabled"
      :class="ui?.hiddenInput"
      class="akaza-tags-input-hidden-input"
    >

    <div
      v-for="(value, index) in model"
      :key="`${formValue(value)}:${index}`"
      :ref="(element) => setItemRef(element, index)"
      :tabindex="activeIndex === index ? 0 : -1"
      :aria-label="valueLabel(value)"
      :class="ui?.item"
      class="akaza-tags-input-item"
      data-akaza-state="active"
      :data-akaza-highlighted="activeIndex === index || undefined"
      :data-akaza-disabled="isDisabled || undefined"
      @focus="activeIndex = index"
      @keydown="onItemKeydown(index, $event)"
    >
      <slot
        name="tag"
        :value="value"
        :label="valueLabel(value)"
        :index="index"
        :is-highlighted="activeIndex === index"
        :remove="(event?: Event) => removeTag(index, event)"
      >
        <span :class="ui?.itemText" class="akaza-tags-input-item-text">
          {{ valueLabel(value) }}
        </span>
        <button
          type="button"
          :disabled="isDisabled || readOnly"
          :aria-label="`Remove ${valueLabel(value)}`"
          :class="ui?.delete"
          class="akaza-tags-input-delete"
          @click="removeTag(index, $event)"
        >
          <slot name="delete" :value="value" :index="index">×</slot>
        </button>
      </slot>
    </div>

    <slot
      name="input"
      :value="inputModel"
      :input-props="getInputProps()"
      :add="(event?: Event) => addTag(inputModel, event)"
    >
      <input v-bind="getInputProps()">
    </slot>

    <button
      v-if="clearable && model.length"
      type="button"
      :disabled="isDisabled || readOnly"
      aria-label="Clear all tags"
      :class="ui?.clear"
      class="akaza-tags-input-clear"
      @click="clear($event)"
    >
      <slot name="clear">Clear</slot>
    </button>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-tags-input {
    position: relative;
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
  }

  .akaza-tags-input-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .akaza-tags-input-input {
    min-width: 0;
    flex: 1;
  }
}
</style>
