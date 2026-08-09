import type { CalendarDate, CalendarDateTime, ZonedDateTime } from "@internationalized/date";

export { default as Calendar } from "./Calendar.vue";

export type CalendarDateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
export interface CalendarDateRange {
  start?: CalendarDateValue;
  end?: CalendarDateValue;
}
export type CalendarModelValue = CalendarDateValue | CalendarDateValue[] | CalendarDateRange | undefined;
export type CalendarSelectionMode = "single" | "multiple" | "range";
export type CalendarRangeFixedDate = "start" | "end";
export type CalendarWeekdayFormat = "narrow" | "short" | "long";
export type CalendarWeekStartsOn = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface CalendarDay {
  date: CalendarDateValue;
  label: string;
  selected: boolean;
  today: boolean;
  outside: boolean;
  disabled: boolean;
  unavailable: boolean;
  focused: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  highlighted: boolean;
}

export interface CalendarMonth {
  date: CalendarDateValue;
  label: string;
  weeks: CalendarDay[][];
}

export interface CalendarUi {
  root?: string;
  header?: string;
  previous?: string;
  heading?: string;
  next?: string;
  grids?: string;
  grid?: string;
  gridHead?: string;
  gridBody?: string;
  gridRow?: string;
  headCell?: string;
  cell?: string;
  cellTrigger?: string;
  footer?: string;
}

export interface CalendarProps {
  locale?: string;
  dir?: "ltr" | "rtl";
  calendarLabel?: string;
  weekStartsOn?: CalendarWeekStartsOn;
  weekdayFormat?: CalendarWeekdayFormat;
  fixedWeeks?: boolean;
  numberOfMonths?: number;
  pagedNavigation?: boolean;
  preventDeselect?: boolean;
  selectionMode?: CalendarSelectionMode;
  /** @deprecated Use selectionMode="multiple". */
  multiple?: boolean;
  allowNonContiguousRanges?: boolean;
  maximumDays?: number;
  fixedDate?: CalendarRangeFixedDate;
  disabled?: boolean;
  readOnly?: boolean;
  initialFocus?: boolean;
  disableDaysOutsideCurrentView?: boolean;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isDateDisabled?: (date: CalendarDateValue) => boolean;
  isDateUnavailable?: (date: CalendarDateValue) => boolean;
  nextPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  prevPage?: (placeholder: CalendarDateValue) => CalendarDateValue;
  ui?: CalendarUi;
}
