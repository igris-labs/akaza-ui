<script setup lang="ts">
import type { EditableProps, EditableState } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId } from "vue";
import { fieldContextKey } from "../field/context";

const {
  id,
  name,
  placeholder = "Enter text...",
  activationMode = "focus",
  submitMode = "blur",
  startWithEditMode = false,
  selectOnFocus = false,
  autoResize = false,
  multiline = false,
  rows = 2,
  maxLength,
  required = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  dir,
  ariaLabel,
  ariaDescribedby,
  ui,
} = defineProps<EditableProps>();

const emit = defineEmits<{
  "value-change": [value: string, details: AkazaChangeEventDetails];
  "draft-change": [value: string, details: AkazaChangeEventDetails];
  "state-change": [state: EditableState, details: AkazaChangeEventDetails];
  submit: [value: string, details: AkazaChangeEventDetails];
  cancel: [value: string, details: AkazaChangeEventDetails];
}>();

const model = defineModel<string | null>({ default: "" });
const field = inject(fieldContextKey, null);
const autoId = useId();
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const hiddenRef = ref<HTMLInputElement | null>(null);
const editing = ref(startWithEditMode);
const draft = ref(model.value ?? "");
const focused = ref(false);
const preserveSelectionOnPointerUp = ref(false);
const touched = ref(false);
const validationActive = ref(false);
const nativeInvalid = ref(false);
const validationMessage = ref("");
const validity = ref<ValidityState | null>(null);
const initialValue = model.value;

const resolvedId = computed(() => id ?? field?.inputId.value ?? `akaza-editable-${autoId}`);
const resolvedName = computed(() => name ?? field?.name.value);
const isDisabled = computed(() => disabled || field?.disabled.value || false);
const isRequired = computed(() => required || field?.required.value || false);
const describedBy = computed(() => ariaDescribedby ?? field?.describedBy.value);
const isEmpty = computed(() => !(model.value ?? "").length);
const isFilled = computed(() => !isEmpty.value);
const isDirty = computed(() => model.value !== initialValue);
const isInvalid = computed(() => invalid || field?.invalid.value || nativeInvalid.value || false);
const state = computed(() => editing.value ? "editing" : "preview");
const previewPlaceholder = computed(() => typeof placeholder === "string" ? placeholder : (placeholder.preview ?? "Enter text..."));
const editPlaceholder = computed(() => typeof placeholder === "string" ? placeholder : (placeholder.edit ?? "Enter text..."));

const unregister = field?.registerControl({
  dirty: isDirty,
  touched,
  filled: isFilled,
  focused,
  invalid: nativeInvalid,
  validationMessage,
  validity,
});

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

function updateValidity(reveal = validationActive.value) {
  const input = hiddenRef.value;
  if (!input) return;
  input.setCustomValidity(isRequired.value && !(model.value ?? "").length ? "Enter a value." : "");
  validity.value = input.validity;
  nativeInvalid.value = reveal && !input.validity.valid;
  validationMessage.value = input.validationMessage;
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function onPreviewPointerDown(event: PointerEvent) {
  if (activationMode !== "focus") return;
  event.preventDefault();
  edit(event);
}

function emitState(next: EditableState, reason: string, event?: Event) {
  emit("state-change", next, createDetails(reason, event).details);
}

function edit(event?: Event) {
  if (isDisabled.value || readOnly || editing.value) return;
  draft.value = model.value ?? "";
  editing.value = true;
  emitState("edit", event ? "trigger" : "programmatic", event);
  focusInput();
}

function setDraft(value: string, event?: Event): boolean {
  const change = createDetails("input", event);
  emit("draft-change", value, change.details);
  if (change.canceled()) return false;
  draft.value = value;
  return true;
}

function submit(event?: Event, reason = "submit"): boolean {
  if (isDisabled.value || readOnly || !editing.value) return false;
  validationActive.value = true;
  if (isRequired.value && !draft.value.length) {
    nativeInvalid.value = true;
    validationMessage.value = "Enter a value.";
    focusInput();
    return false;
  }

  const valueChange = createDetails(reason, event);
  emit("value-change", draft.value, valueChange.details);
  if (valueChange.canceled()) return false;

  const submitChange = createDetails(reason, event);
  emit("submit", draft.value, submitChange.details);
  if (submitChange.canceled()) return false;

  model.value = draft.value;
  editing.value = false;
  touched.value = true;
  nativeInvalid.value = false;
  validationMessage.value = "";
  emitState("submit", reason, event);
  nextTick(updateValidity);
  return true;
}

function cancel(event?: Event) {
  if (!editing.value) return;
  const value = model.value ?? "";
  const change = createDetails(event ? "trigger" : "programmatic", event);
  emit("cancel", value, change.details);
  if (change.canceled()) return;
  draft.value = value;
  editing.value = false;
  touched.value = true;
  emitState("cancel", change.details.reason, event);
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (!setDraft(target.value, event)) target.value = draft.value;
}

function onInputFocus(event: FocusEvent) {
  if (!selectOnFocus) return;
  (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).select();
}

function onInputPointerDown(event: PointerEvent) {
  if (!selectOnFocus) return;
  const input = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
  preserveSelectionOnPointerUp.value = input.ownerDocument.activeElement !== input;
}

function onInputPointerUp(event: PointerEvent) {
  if (!preserveSelectionOnPointerUp.value) return;
  event.preventDefault();
  preserveSelectionOnPointerUp.value = false;
  (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).select();
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    cancel(event);
    return;
  }
  const enterSubmits = submitMode === "enter" || submitMode === "both";
  if (event.key === "Enter" && enterSubmits && (!multiline || event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    submit(event, "enter");
  }
}

function onFocusIn() {
  focused.value = true;
}

async function onFocusOut(event: FocusEvent) {
  if (rootRef.value?.contains(event.relatedTarget as Node | null)) return;
  await nextTick();
  const root = rootRef.value;
  if (!root || root.contains(root.ownerDocument.activeElement)) return;
  preserveSelectionOnPointerUp.value = false;
  focused.value = false;
  touched.value = true;
  if (editing.value && (submitMode === "blur" || submitMode === "both")) submit(event, "blur");
  updateValidity();
}

function onInvalid(event: Event) {
  event.preventDefault();
  validationActive.value = true;
  updateValidity();
  if (!editing.value) edit(event);
  else focusInput();
}

defineExpose({ cancel, edit, focus: focusInput, submit });

onMounted(() => {
  updateValidity(false);
  if (startWithEditMode) focusInput();
});
onUpdated(updateValidity);
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <div
    ref="rootRef"
    :class="ui?.root"
    class="akaza-editable"
    :data-akaza-state="state"
    :data-state="state"
    :data-akaza-disabled="isDisabled || undefined"
    :data-akaza-readonly="readOnly || undefined"
    :data-akaza-invalid="isInvalid || undefined"
    :data-akaza-focused="focused || undefined"
    :data-akaza-filled="isFilled || undefined"
    :dir="dir"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <input
      ref="hiddenRef"
      type="text"
      :name="resolvedName"
      :value="model ?? ''"
      :required="isRequired"
      :disabled="isDisabled"
      aria-hidden="true"
      tabindex="-1"
      :class="ui?.hiddenInput"
      class="akaza-editable-hidden-input"
      @invalid="onInvalid"
    >

    <div :class="ui?.area" class="akaza-editable-area" :data-akaza-state="state">
      <button
        v-if="!editing"
        :id="resolvedId"
        type="button"
        :disabled="isDisabled"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-disabled="readOnly || undefined"
        :class="ui?.preview"
        class="akaza-editable-preview"
        data-akaza-state="preview"
        :data-akaza-empty="isEmpty || undefined"
        @pointerdown="onPreviewPointerDown"
        @click="activationMode === 'click' && edit($event)"
        @dblclick="activationMode === 'dblclick' && edit($event)"
        @focus="activationMode === 'focus' && edit($event)"
      >
        <slot name="preview" :value="model" :is-empty="isEmpty" :edit="edit">
          {{ isEmpty ? previewPlaceholder : model }}
        </slot>
      </button>

      <component
        :is="multiline ? 'textarea' : 'input'"
        v-else
        :id="resolvedId"
        ref="inputRef"
        :type="multiline ? undefined : 'text'"
        :rows="multiline ? rows : undefined"
        :value="draft"
        :placeholder="editPlaceholder"
        :maxlength="maxLength"
        :disabled="isDisabled"
        :readonly="readOnly"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-invalid="isInvalid || undefined"
        :aria-required="isRequired || undefined"
        :class="ui?.input"
        :style="autoResize ? { fieldSizing: 'content' } : undefined"
        class="akaza-editable-input"
        data-akaza-state="editing"
        @focus="onInputFocus"
        @input="onInput"
        @keydown="onInputKeydown"
        @pointerdown="onInputPointerDown"
        @pointerup="onInputPointerUp"
        @pointercancel="preserveSelectionOnPointerUp = false"
      />
    </div>

    <div :class="ui?.actions" class="akaza-editable-actions" :data-akaza-state="state">
      <button
        v-if="!editing"
        type="button"
        :disabled="isDisabled || readOnly"
        :class="ui?.edit"
        class="akaza-editable-edit"
        @click="edit($event)"
      >
        <slot name="edit">Edit</slot>
      </button>
      <template v-else>
        <button
          type="button"
          :disabled="isDisabled || readOnly"
          :class="ui?.submit"
          class="akaza-editable-submit"
          @click="submit($event)"
        >
          <slot name="submit">Submit</slot>
        </button>
        <button
          type="button"
          :disabled="isDisabled"
          :class="ui?.cancel"
          class="akaza-editable-cancel"
          @click="cancel($event)"
        >
          <slot name="cancel">Cancel</slot>
        </button>
      </template>
    </div>

    <slot
      name="state"
      :value="model"
      :draft="draft"
      :is-editing="editing"
      :is-empty="isEmpty"
      :edit="edit"
      :submit="submit"
      :cancel="cancel"
    />
  </div>
</template>

<style>
@layer akaza-reset {
  .akaza-editable {
    position: relative;
    min-width: 0;
  }

  .akaza-editable-hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .akaza-editable-input {
    min-width: 0;
  }
}
</style>
