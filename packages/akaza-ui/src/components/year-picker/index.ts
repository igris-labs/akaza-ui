import type { CalendarDateValue } from "../calendar";
import type { PeriodPickerUi } from "../date-period/PeriodPicker.vue";

export { default as YearPicker } from "./YearPicker.vue";

export type YearPickerUi = PeriodPickerUi;
export type YearPickerModelValue = CalendarDateValue | CalendarDateValue[] | undefined;

export interface YearPickerProps {
  locale?: string;
  dir?: "ltr" | "rtl";
  calendarLabel?: string;
  columns?: number;
  yearsPerPage?: number;
  multiple?: boolean;
  preventDeselect?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  initialFocus?: boolean;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isYearDisabled?: (date: CalendarDateValue) => boolean;
  isYearUnavailable?: (date: CalendarDateValue) => boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  ui?: YearPickerUi;
}
