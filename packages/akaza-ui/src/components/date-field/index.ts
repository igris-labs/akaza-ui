import type { CalendarDateValue, CalendarUi } from "../calendar";
import type { PopoverAlign, PopoverSide } from "../popover";

export { default as DateField } from "./DateField.vue";

export type DateFieldSegment = "day" | "month" | "year";

export interface DateFieldUi {
  root?: string;
  segments?: string;
  segment?: string;
  literal?: string;
  calendarTrigger?: string;
  calendarContent?: string;
  calendar?: CalendarUi;
  hiddenInput?: string;
}

export interface DateFieldProps {
  id?: string;
  name?: string;
  locale?: string;
  dir?: "ltr" | "rtl";
  placeholder?: CalendarDateValue;
  minValue?: CalendarDateValue;
  maxValue?: CalendarDateValue;
  isDateUnavailable?: (date: CalendarDateValue) => boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  selectOnFocus?: boolean;
  autoAdvance?: boolean;
  showCalendar?: boolean;
  calendarLabel?: string;
  calendarSide?: PopoverSide;
  calendarAlign?: PopoverAlign;
  calendarSideOffset?: number;
  calendarTeleport?: string | false;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ui?: DateFieldUi;
}
