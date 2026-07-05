import type { AkazaChangeEventDetails } from "../../types";
import type { FormErrors } from "./context";

export { default as Form } from "./Form.vue";
export type { FormErrors };

export type FormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

export interface FormSubmitDetails extends AkazaChangeEventDetails {
  event: SubmitEvent;
  formData: FormData;
  valid: boolean;
}

export interface FormUi {
  root?: string;
}

export interface FormProps {
  id?: string;
  action?: string;
  method?: "get" | "post" | "dialog";
  autocomplete?: "on" | "off";
  novalidate?: boolean;
  preventDefault?: boolean;
  errors?: FormErrors;
  ui?: FormUi;
}
