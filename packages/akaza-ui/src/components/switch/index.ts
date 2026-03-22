export { default as Switch } from "./Switch.vue";

export type SwitchValue = boolean | string | number;

export interface SwitchUi {
  wrapper?: string;
  root?: string;
  thumb?: string;
  label?: string;
  description?: string;
}

export interface SwitchProps {
  disabled?: boolean;
  /** Custom id for the switch button. Auto-generated if omitted. */
  id?: string;
  /** Name submitted with the owning form. */
  name?: string;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /** Value the model holds when checked. Default: true. */
  trueValue?: SwitchValue;
  /** Value the model holds when unchecked. Default: false. */
  falseValue?: SwitchValue;
  /** Label text rendered beside the switch. Also used as aria-labelledby target. */
  label?: string;
  /** Description text rendered below the label. */
  description?: string;
  /** aria-label for icon-only switches with no label prop or slot. */
  ariaLabel?: string;
  ui?: SwitchUi;
}
