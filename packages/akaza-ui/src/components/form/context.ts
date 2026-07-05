import type { ComputedRef, InjectionKey } from "vue";

export type FormErrors = Record<string, string | string[] | undefined>;

export interface FormContext {
  errors: ComputedRef<FormErrors | undefined>;
}

export const formContextKey: InjectionKey<FormContext> = Symbol("akaza-form");
