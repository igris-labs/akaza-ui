import type { CalendarDateValue, CalendarRangeFixedDate } from "../calendar";
import type { YearPickerUi } from "../year-picker";

export { default as YearRangePicker } from "./YearRangePicker.vue";

export type YearRangePickerUi = YearPickerUi;

export interface YearRangePickerProps {
  locale?: string;
  dir?: "ltr" | "rtl";
  calendarLabel?: string;
  columns?: number;
  yearsPerPage?: number;
  allowNonContiguousRanges?: boolean;
  maximumYears?: number;
  fixedDate?: CalendarRangeFixedDate;
  disabled?: boolean;
  readOnly?: boolean;
  initialFocus?: boolean;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isYearDisabled?: (date: CalendarDateValue) => boolean;
  isYearUnavailable?: (date: CalendarDateValue) => boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  ui?: YearRangePickerUi;
}
