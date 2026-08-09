import type {
  CalendarDateValue,
  CalendarRangeFixedDate,
  CalendarUi,
  CalendarWeekdayFormat,
  CalendarWeekStartsOn,
} from "../calendar";
import type { DateRangeFieldUi } from "../date-range-field";
import type { PopoverAlign, PopoverSide } from "../popover";

export { default as DateRangePicker } from "./DateRangePicker.vue";

export interface DateRangePickerUi {
  root?: string;
  field?: DateRangeFieldUi;
  trigger?: string;
  content?: string;
  calendar?: CalendarUi;
  close?: string;
}

export interface DateRangePickerProps {
  id?: string;
  name?: string;
  startName?: string;
  endName?: string;
  locale?: string;
  dir?: "ltr" | "rtl";
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isDateDisabled?: (date: CalendarDateValue) => boolean;
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
  calendarLabel?: string;
  closeLabel?: string;
  closeOnSelect?: boolean;
  weekStartsOn?: CalendarWeekStartsOn;
  weekdayFormat?: CalendarWeekdayFormat;
  fixedWeeks?: boolean;
  numberOfMonths?: number;
  pagedNavigation?: boolean;
  disableDaysOutsideCurrentView?: boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  teleport?: string | false;
  ui?: DateRangePickerUi;
}
