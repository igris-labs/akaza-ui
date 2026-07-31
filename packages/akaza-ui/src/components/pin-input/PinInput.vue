<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { PinInputProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId } from "vue";
import { fieldContextKey } from "../field/context";

const {
  length = 4,
  type = "text",
  mask = false,
  otp = false,
  placeholder = "",
  allowedChars,
  selectOnFocus = true,
  autoFocus = false,
  id,
  name,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  dir = "ltr",
  ariaLabel = "Pin input",
  ariaLabelledby,
  ariaDescribedby,
  ui,
} = defineProps<PinInputProps>();

const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  complete: [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<string>({ default: "" });
const autoId = useId();
const field = inject(fieldContextKey, null);
const rootRef = ref<HTMLElement | null>(null);
const hiddenRef = ref<HTMLInputElement | null>(null);
const inputRefs = ref<Array<HTMLInputElement | null>>([]);
const activeIndex = ref(-1);
const focused = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);

const initialValue = model.value;
const safeLength = computed(() => Math.max(1, Math.floor(length)));
const normalizedValue = computed(() => Array.from(model.value).slice(0, safeLength.value).join(""));
const cells = computed(() => Array.from({ length: safeLength.value }, (_, index) => Array.from(normalizedValue.value)[index] ?? ""));
const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-pin-input-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isFilled = computed(() => normalizedValue.value.length > 0);
const isComplete = computed(() => normalizedValue.value.length === safeLength.value);
const isDirty = computed(() => model.value !== initialValue);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => isComplete.value ? "complete" : "incomplete");

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !isComplete.value ? `Enter all ${safeLength.value} characters.` : "");
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

function normalizeCharacters(value: string): string[] {
  return Array.from(value).filter((character) => {
    if (type === "number" && !/^\d$/.test(character)) return false;
    if (typeof allowedChars === "function") return allowedChars(character);
    if (allowedChars) {
      return new RegExp(allowedChars.source, allowedChars.flags.replace(/[gy]/g, "")).test(character);
    }
    return character.trim().length > 0;
  });
}

function commitValue(value: string, reason: string, event?: Event): boolean {
  if (isDisabled.value || readOnly) return false;
  const next = normalizeCharacters(value).slice(0, safeLength.value).join("");
  if (next === normalizedValue.value) return true;
  const change = createDetails(reason, event);
  emit("value-change", next, change.details);
  if (change.canceled()) return false;
  validationActive.value = true;
  model.value = next;
  nextTick(() => {
    updateValidity();
    if (next.length === safeLength.value) {
      const completeDetails = createDetails("complete", event).details;
      emit("complete", next, completeDetails);
    }
  });
  return true;
}

function focusInput(index: number) {
  const target = Math.min(Math.max(index, 0), safeLength.value - 1);
  inputRefs.value[target]?.focus();
  if (selectOnFocus) inputRefs.value[target]?.select();
}

function setInputRef(element: Element | ComponentPublicInstance | null, index: number) {
  inputRefs.value[index] = element as HTMLInputElement | null;
}

function replaceCell(index: number, value: string, reason: string, event?: Event) {
  const next = [...cells.value];
  next[index] = value;
  return commitValue(next.join(""), reason, event);
}

function fillFrom(index: number, rawValue: string, reason: string, event?: Event) {
  const characters = normalizeCharacters(rawValue);
  if (!characters.length) {
    if (!rawValue) replaceCell(index, "", reason, event);
    return;
  }
  const next = [...cells.value];
  let cursor = index;
  for (const character of characters) {
    if (cursor >= safeLength.value) break;
    next[cursor] = character;
    cursor++;
  }
  if (commitValue(next.join(""), reason, event)) {
    nextTick(() => focusInput(Math.min(cursor, safeLength.value - 1)));
  }
}

function onInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  fillFrom(index, target.value, "input", event);
  nextTick(() => {
    target.value = cells.value[index] ?? "";
  });
}

function onPaste(index: number, event: ClipboardEvent) {
  const value = event.clipboardData?.getData("text") ?? "";
  if (!value) return;
  event.preventDefault();
  fillFrom(index, value, "paste", event);
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (isDisabled.value || readOnly) return;
  const previousKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const nextKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  if (event.key === previousKey || event.key === nextKey) {
    event.preventDefault();
    focusInput(index + (event.key === nextKey ? 1 : -1));
  } else if (event.key === "Home") {
    event.preventDefault();
    focusInput(0);
  } else if (event.key === "End") {
    event.preventDefault();
    focusInput(safeLength.value - 1);
  } else if (event.key === "Backspace") {
    event.preventDefault();
    if (cells.value[index]) replaceCell(index, "", "backspace", event);
    else if (index > 0) {
      replaceCell(index - 1, "", "backspace", event);
      nextTick(() => focusInput(index - 1));
    }
  } else if (event.key === "Delete") {
    event.preventDefault();
    replaceCell(index, "", "delete", event);
  }
}

function onCellFocus(index: number, event: FocusEvent) {
  activeIndex.value = index;
  focused.value = true;
  if (selectOnFocus) (event.target as HTMLInputElement).select();
}

function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  activeIndex.value = -1;
  focused.value = false;
  touched.value = true;
  validationActive.value = true;
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  nextTick(() => focusInput(Math.min(normalizedValue.value.length, safeLength.value - 1)));
}

function clear(event?: Event) {
  if (commitValue("", "clear", event)) nextTick(() => focusInput(0));
}

function getInputProps(index: number) {
  const value = cells.value[index] ?? "";
  return {
    id: index === 0 ? resolvedId.value : `${resolvedId.value}-${index + 1}`,
    ref: (element: Element | ComponentPublicInstance | null) => setInputRef(element, index),
    type: mask ? "password" : "text",
    value,
    placeholder,
    disabled: isDisabled.value,
    readonly: readOnly,
    inputmode: type === "number" ? ("numeric" as const) : ("text" as const),
    pattern: type === "number" ? "[0-9]*" : undefined,
    autocomplete: otp && index === 0 ? "one-time-code" : "off",
    maxlength: otp && index === 0 ? safeLength.value : 1,
    "aria-label": `${ariaLabel}, character ${index + 1} of ${safeLength.value}`,
    "aria-describedby": describedBy.value,
    "aria-invalid": isInvalid.value || undefined,
    "data-akaza-state": value ? "filled" : "empty",
    "data-state": value ? "filled" : "empty",
    "data-akaza-index": index,
    "data-akaza-active": activeIndex.value === index || undefined,
    "data-akaza-disabled": isDisabled.value || undefined,
    "data-akaza-invalid": isInvalid.value || undefined,
    class: ["akaza-pin-input-input", ui?.input],
    onInput: (event: Event) => onInput(index, event),
    onPaste: (event: ClipboardEvent) => onPaste(index, event),
    onKeydown: (event: KeyboardEvent) => onKeydown(index, event),
    onFocus: (event: FocusEvent) => onCellFocus(index, event),
  };
}

defineExpose({ clear, focus: () => focusInput(0) });

onMounted(() => {
  updateValidity(false);
  if (autoFocus) nextTick(() => focusInput(0));
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
    class="akaza-pin-input"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-focused="focused || undefined"
    :data-akaza-filled="isFilled || undefined"
    :dir="dir"
    @focusout="onFocusOut"
  >
    <input
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="normalizedValue"
      :required="isRequired"
      :disabled="isDisabled"
      :aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-pin-input-hidden-input"
      @invalid="onInvalid"
    >

    <slot
      v-for="(_, index) in cells"
      :key="index"
      name="cell"
      :index="index"
      :value="cells[index]"
      :is-filled="Boolean(cells[index])"
      :is-active="activeIndex === index"
      :input-props="getInputProps(index)"
    >
      <input v-bind="getInputProps(index)">
    </slot>
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-pin-input {
    position: relative;
    display: inline-flex;
    min-width: 0;
  }

  .akaza-pin-input-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .akaza-pin-input-input {
    min-width: 0;
  }
}
</style>
