import type { Ref } from "vue";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from "vue";
import { fieldContextKey } from "../components/field/context";
import { useFormReset } from "./useFormReset";

/** Native checkbox validity/reset bridged to Field without imposing public parts. */
export function useCheckableField<T>(model: Ref<T>, input: Ref<HTMLInputElement | null>, focus: () => void, filled: Ref<boolean>) {
  const field = inject(fieldContextKey, null);
  const initialValue = Array.isArray(model.value) ? [...model.value] as T : model.value;
  const touched = ref(false);
  const focused = ref(false);
  const nativeInvalid = ref(false);
  const validationMessage = ref("");
  const validity = ref<ValidityState | null>(null);
  const dirty = computed(() => Array.isArray(model.value) && Array.isArray(initialValue)
    ? model.value.length !== initialValue.length || model.value.some((value, index) => value !== initialValue[index])
    : model.value !== initialValue);
  const invalid = computed(() => nativeInvalid.value || field?.invalid.value || false);
  let revealed = false;
  const unregister = field?.registerControl({ dirty, touched, focused, filled: computed(() => filled.value), invalid: nativeInvalid, validationMessage, validity });

  function sync() {
    validity.value = input.value?.validity ?? null;
    validationMessage.value = input.value?.validationMessage ?? "";
    nativeInvalid.value = revealed && Boolean(input.value && !input.value.validity.valid);
  }
  function onInvalid(event: Event) {
    event.preventDefault();
    revealed = true;
    sync();
    focus();
  }
  useFormReset(() => input.value, () => {
    model.value = Array.isArray(initialValue) ? [...initialValue] as T : initialValue;
    touched.value = false;
    revealed = false;
    nativeInvalid.value = false;
    nextTick(sync);
  });
  onMounted(sync);
  onUpdated(sync);
  onBeforeUnmount(() => {
    unregister?.();
  });
  return {
    field, invalid, onInvalid,
    attrs: computed(() => ({
      "data-akaza-invalid": invalid.value || undefined,
      "data-akaza-dirty": dirty.value || undefined,
      "data-akaza-touched": touched.value || undefined,
      "data-akaza-focused": focused.value || undefined,
      "data-akaza-filled": filled.value || undefined,
    })),
    onFocus: () => { focused.value = true; },
    onBlur: () => { focused.value = false; touched.value = true; revealed = true; sync(); },
    onChange: () => { revealed = true; nextTick(sync); },
  };
}
