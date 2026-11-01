import type { FieldContext, FieldControlState } from "../components/field/context";
import { onBeforeUnmount, ref, shallowRef } from "vue";

type FieldInteractionState = Pick<FieldControlState, "dirty" | "touched" | "filled" | "focused">;

/** Native validity and Field registration; interaction/reveal policy stays local. */
export function useFieldControl(field: FieldContext | null) {
  const nativeInvalid = ref(false);
  const validationMessage = ref("");
  const validity = shallowRef<ValidityState | null>(null);
  let unregister: (() => void) | undefined;
  function registerControl(state: FieldInteractionState) {
    unregister?.();
    unregister = field?.registerControl({ ...state, invalid: nativeInvalid, validationMessage, validity });
  }
  onBeforeUnmount(() => unregister?.());

  function syncValidity(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null, reveal: boolean) {
    if (!input) return;
    validity.value = input.validity;
    validationMessage.value = input.validationMessage;
    nativeInvalid.value = reveal && !input.validity.valid;
  }

  return { nativeInvalid, validationMessage, validity, syncValidity, registerControl };
}
