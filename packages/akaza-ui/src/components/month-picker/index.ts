import type { CalendarDateValue } from "../calendar";
import type { PeriodPickerUi } from "../date-period/PeriodPicker.vue";

export { default as MonthPicker } from "./MonthPicker.vue";

export type MonthPickerUi = PeriodPickerUi;
export type MonthPickerModelValue = CalendarDateValue | CalendarDateValue[] | undefined;

export interface MonthPickerProps {
  locale?: string;
  dir?: "ltr" | "rtl";
  calendarLabel?: string;
  columns?: number;
  multiple?: boolean;
  preventDeselect?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  initialFocus?: boolean;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isMonthDisabled?: (date: CalendarDateValue) => boolean;
  isMonthUnavailable?: (date: CalendarDateValue) => boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  ui?: MonthPickerUi;
}
