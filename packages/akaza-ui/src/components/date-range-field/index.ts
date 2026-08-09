import type { CalendarDateRange, CalendarDateValue, CalendarRangeFixedDate } from "../calendar";
import type { DateFieldUi } from "../date-field";

export { default as DateRangeField } from "./DateRangeField.vue";

export type DateRangeFieldEndpoint = "start" | "end";

export interface DateRangeFieldUi {
  root?: string;
  start?: string;
  startField?: DateFieldUi;
  separator?: string;
  end?: string;
  endField?: DateFieldUi;
  hiddenInput?: string;
}

export interface DateRangeFieldProps {
  id?: string;
  name?: string;
  startName?: string;
  endName?: string;
  locale?: string;
  dir?: "ltr" | "rtl";
  placeholder?: CalendarDateValue;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isDateUnavailable?: (date: CalendarDateValue) => boolean;
  allowNonContiguousRanges?: boolean;
  maximumDays?: number;
  fixedDate?: CalendarRangeFixedDate;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  selectOnFocus?: boolean;
  autoAdvance?: boolean;
  startLabel?: string;
  endLabel?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: DateRangeFieldUi;
}

export type DateRangeFieldModelValue = CalendarDateRange;
