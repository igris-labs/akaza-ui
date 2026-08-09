import type { CalendarDateValue, CalendarRangeFixedDate } from "../calendar";
import type { MonthPickerUi } from "../month-picker";

export { default as MonthRangePicker } from "./MonthRangePicker.vue";

export type MonthRangePickerUi = MonthPickerUi;

export interface MonthRangePickerProps {
  locale?: string;
  dir?: "ltr" | "rtl";
  calendarLabel?: string;
  columns?: number;
  allowNonContiguousRanges?: boolean;
  maximumMonths?: number;
  fixedDate?: CalendarRangeFixedDate;
  disabled?: boolean;
  readOnly?: boolean;
  initialFocus?: boolean;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isMonthDisabled?: (date: CalendarDateValue) => boolean;
  isMonthUnavailable?: (date: CalendarDateValue) => boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  ui?: MonthRangePickerUi;
}
