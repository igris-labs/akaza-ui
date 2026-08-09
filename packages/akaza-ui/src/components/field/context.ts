import type { ComputedRef, InjectionKey, Ref } from "vue";

export type FieldErrorMatch =
  | boolean
  | "invalid"
  | "valid"
  | "badInput"
  | "customError"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "tooLong"
  | "tooShort"
  | "typeMismatch"
  | "valueMissing";

export interface FieldControlState {
  dirty: ComputedRef<boolean>;
  touched: Ref<boolean>;
  filled: ComputedRef<boolean>;
  focused: Ref<boolean>;
  invalid: Ref<boolean>;
  validationMessage: Ref<string>;
  validity: Ref<ValidityState | null>;
}

export interface FieldContext {
  inputId: ComputedRef<string>;
  labelledBy: ComputedRef<string | undefined>;
  name: ComputedRef<string | undefined>;
  disabled: ComputedRef<boolean>;
  required: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  describedBy: ComputedRef<string | undefined>;
  registerControl: (state: FieldControlState) => () => void;
}

export const fieldContextKey: InjectionKey<FieldContext | null> = Symbol("akaza-field");
