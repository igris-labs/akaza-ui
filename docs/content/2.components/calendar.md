---
title: Calendar
description: Locale-aware date grid with keyboard navigation, constraints, and single, multiple, or range selection.
navigation:
  icon: i-lucide-calendar-days
  badge:
    label: NEW
    color: success
---

`Calendar` renders an accessible date grid and owns date navigation, selection, locale formatting, constraints, and roving focus. It uses `@internationalized/date` values, so calendar arithmetic does not depend on JavaScript `Date` parsing or local midnight behavior.

Use it when users select dates directly from a visible month. Calendar stays flat: one component generates structural parts while slots expose labels, dates, state, and actions for custom UI.

::callout{icon="i-lucide-package"}
Date values come from `@internationalized/date`. Install it beside Akaza UI when application code creates or transforms dates: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **`#previous`**: Previous-page control content with disabled state.
- **`#heading`**: Visible month or month-range heading with generated month data.
- **`#next`**: Next-page control content with disabled state.
- **`#weekday`**: Weekday heading content with date and formatted label.
- **`#day`**: Day button content with date, selection, range, today, outside, disabled, unavailable, and focus state.
- **`#footer`**: Optional content after all grids with current value and placeholder.

Calendar generates the root, navigation buttons, live heading, one or more ARIA grids, rows, cells, and day buttons. Style every generated part through `ui`.

## Usage

::component-preview
  :::examples-calendar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { Calendar } from "akaza-ui";

const date = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
</script>

<template>
  <Calendar
    v-model="date"
    :placeholder="new CalendarDate(2026, 8, 1)"
  />
</template>
```
::

## Examples

### Date constraints

Use `minValue` and `maxValue` for hard boundaries. `isDateDisabled` applies application rules while `isDateUnavailable` marks dates that exist but cannot be selected, such as fully booked days.

```vue
<Calendar
  v-model="date"
  :min-value="new CalendarDate(2026, 8, 5)"
  :max-value="new CalendarDate(2026, 8, 24)"
  :is-date-unavailable="(date) => closedDates.has(date.toString())"
/>
```

Disabled and unavailable days remain keyboard discoverable and expose `aria-disabled`; activation does not change the model.

### Popover calendar

Compose Calendar with `Popover` when date selection starts from a separate button. Popover owns positioning and dismissal; Calendar keeps date focus, navigation, and selection behavior.

```vue
<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";
import { Calendar, Popover } from "akaza-ui";
import { ref, shallowRef } from "vue";

const date = shallowRef<CalendarDateValue>();
const open = ref(false);
</script>

<template>
<Popover v-model="open" teleport="body">
  <template #trigger="{ toggle, triggerProps }">
    <button v-bind="triggerProps" @click="toggle">
      {{ date?.toString() ?? "Choose date" }}
    </button>
  </template>

  <template #content>
    <Calendar
      v-model="date"
      prevent-deselect
      @value-change="open = false"
    />
  </template>
</Popover>
</template>
```

Use Date Field's `showCalendar` prop instead when users also need segmented keyboard entry and native form integration.

### Multiple dates

Set `selectionMode="multiple"` to bind an array. Selecting an existing date removes it unless `preventDeselect` is enabled. The older `multiple` boolean remains as a compatibility alias.

```vue
<Calendar v-model="dates" selection-mode="multiple" />
```

### Date range

Use `selectionMode="range"` with a `{ start, end }` model. First activation sets the anchor; pointer hover or keyboard focus previews the pending range; second activation commits normalized start and end values.

```vue
<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { shallowRef } from "vue";

const range = shallowRef<CalendarDateRange>({});
</script>

<template>
  <Calendar
    v-model="range"
    selection-mode="range"
    :maximum-days="14"
  />
</template>
```

Ranges containing disabled or unavailable dates are rejected by default. Set `allowNonContiguousRanges` when unavailable dates may remain inside a range; range endpoints must still be selectable.

### Multiple months

`numberOfMonths` renders adjacent grids. Add `pagedNavigation` when previous and next should move by the full visible month count.

```vue
<Calendar
  v-model="date"
  :number-of-months="2"
  paged-navigation
  fixed-weeks
/>
```

### Locale and week start

Locale controls month, weekday, and accessible date labels. Override the locale-derived first day when product requirements demand it.

```vue
<Calendar
  locale="fr-FR"
  week-starts-on="mon"
  weekday-format="short"
/>
```

### Outside days

Outside days are rendered to keep complete weeks. Set `disableDaysOutsideCurrentView` to make them non-selectable while preserving keyboard context.

```vue
<Calendar disable-days-outside-current-view />
```

### Custom day content

The day slot changes button content without replacing its keyboard and ARIA behavior.

```vue
<Calendar v-model="date">
  <template #day="{ label, today, unavailable }">
    <span :class="{ 'font-bold': today, 'line-through': unavailable }">
      {{ label }}
    </span>
  </template>
</Calendar>
```

### Cancel changes

Both selection and visible-month changes emit cancelable details before updating their models.

```vue
<Calendar
  v-model="date"
  @value-change="(_value, details) => {
    if (hasUnsavedChanges) details.cancel()
  }"
/>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateValue \| CalendarDateValue[] \| CalendarDateRange \| undefined` | `undefined` | Selected single date, independent dates, or `{ start, end }` range according to `selectionMode`. |
| `v-model:placeholder` | `CalendarDateValue` | selected date or today | Month used as the start of the visible view. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en-US"` | Locale used for labels and week calculations. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and horizontal arrow behavior. |
| `calendarLabel` | `string` | `"Calendar"` | Accessible root label prefix. |
| `weekStartsOn` | `"sun" \| "mon" \| ...` | locale default | Explicit first day of week. |
| `weekdayFormat` | `"narrow" \| "short" \| "long"` | `"narrow"` | Visible weekday label format. |
| `fixedWeeks` | `boolean` | `false` | Always renders six weeks per month. |
| `numberOfMonths` | `number` | `1` | Adjacent month grids to render. |
| `pagedNavigation` | `boolean` | `false` | Navigates by `numberOfMonths` instead of one month. |
| `preventDeselect` | `boolean` | `false` | Prevents removing an already selected date. |
| `selectionMode` | `"single" \| "multiple" \| "range"` | `"single"` | Selects model shape and interaction behavior. |
| `multiple` | `boolean` | `false` | Deprecated compatibility alias for `selectionMode="multiple"`. |
| `allowNonContiguousRanges` | `boolean` | `false` | Allows unavailable or disabled dates inside a range, but not at either endpoint. |
| `maximumDays` | `number` | — | Maximum inclusive length accepted in range mode. |
| `fixedDate` | `"start" \| "end"` | — | Keeps one boundary fixed while range interactions update only the opposite boundary. |
| `disabled` | `boolean` | `false` | Disables navigation and selection. |
| `readOnly` | `boolean` | `false` | Allows focus/navigation but blocks selection. |
| `initialFocus` | `boolean` | `false` | Focuses the roving day after mount. |
| `disableDaysOutsideCurrentView` | `boolean` | `false` | Prevents selecting outside days. |
| `minValue` | `CalendarDateValue` | — | Earliest selectable date and navigation boundary. |
| `maxValue` | `CalendarDateValue` | — | Latest selectable date and navigation boundary. |
| `isDateDisabled` | `(date) => boolean` | — | Marks dates disabled by application rules. |
| `isDateUnavailable` | `(date) => boolean` | — | Marks dates unavailable and invalid when externally selected. |
| `nextPage` | `(placeholder) => CalendarDateValue` | add month(s) | Custom next-page calculation. |
| `prevPage` | `(placeholder) => CalendarDateValue` | subtract month(s) | Custom previous-page calculation. |
| `ui` | `CalendarUi` | — | Classes for generated structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Fired after accepted selection changes. |
| `update:placeholder` | `date` | Fired after accepted visible-month changes. |
| `value-change` | `(value, details)` | Fires before selection changes. `details.cancel()` prevents update. |
| `placeholder-change` | `(date, details)` | Fires before page changes. `details.cancel()` prevents update. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `previous` | `disabled` | Previous control content. |
| `heading` | `label`, `months` | Current month or range heading. |
| `next` | `disabled` | Next control content. |
| `weekday` | `date`, `label` | Weekday heading content. |
| `day` | `date`, `label`, `selected`, `rangeStart`, `rangeEnd`, `inRange`, `highlighted`, `today`, `outside`, `disabled`, `unavailable`, `focused` | Day button content and complete selection state. |
| `footer` | `value`, `placeholder` | Optional content after grids. |

### Methods

| Method | Description |
|--------|-------------|
| `selectDate(date, event?)` | Selects or deselects an accepted date. |
| `focusDate(date, reason?, event?)` | Moves roving focus and visible month when needed. |
| `previousPage(event?)` | Shows previous page when within constraints. |
| `nextPage(event?)` | Shows next page when within constraints. |
| `placeholder` | Read-only computed visible placeholder. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Calendar root. |
| `header` | Navigation header. |
| `previous` | Previous-page button. |
| `heading` | Live month heading. |
| `next` | Next-page button. |
| `grids` | Grid collection wrapper. |
| `grid` | Each ARIA date grid. |
| `gridHead` | Grid heading group. |
| `gridBody` | Grid body group. |
| `gridRow` | Weekday and date rows. |
| `headCell` | Weekday heading cells. |
| `cell` | Date grid cells. |
| `cellTrigger` | Interactive day buttons. |
| `footer` | Optional footer wrapper. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-calendar` | `data-akaza-state="empty|selecting|selected"`, `data-akaza-selection-mode`, `data-akaza-fixed-date`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `header` | `akaza-calendar-header` | — |
| `previous` | `akaza-calendar-previous` | `data-akaza-disabled` |
| `heading` | `akaza-calendar-heading` | — |
| `next` | `akaza-calendar-next` | `data-akaza-disabled` |
| `grids` | `akaza-calendar-grids` | — |
| `grid` | `akaza-calendar-grid` | `data-akaza-month` |
| `gridHead` | `akaza-calendar-grid-head` | — |
| `gridBody` | `akaza-calendar-grid-body` | — |
| `gridRow` | `akaza-calendar-grid-row` | — |
| `headCell` | `akaza-calendar-head-cell` | — |
| `cell` | `akaza-calendar-cell` | state and granular day attrs |
| `cellTrigger` | `akaza-calendar-cell-trigger` | `data-akaza-state="available|selected|today|outside|disabled|unavailable"`, `data-akaza-selected`, `data-akaza-range-start`, `data-akaza-range-end`, `data-akaza-in-range`, `data-akaza-highlighted`, `data-akaza-today`, `data-akaza-outside-view`, `data-akaza-disabled`, `data-akaza-unavailable` |
| `footer` | `akaza-calendar-footer` | — |

Plain `class` applies to the Calendar root. Use `ui.cellTrigger` for generated day buttons and data variants for state styling.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowLeft` / `ArrowRight` | Move one day, direction-aware in RTL. |
| `ArrowUp` / `ArrowDown` | Move one week. |
| `Home` / `End` | Move to start/end of current week. |
| `PageUp` / `PageDown` | Move one month. |
| `Shift + PageUp` / `Shift + PageDown` | Move one year. |
| `Enter` / `Space` | Select or deselect focused date. |

Only one day is in the Tab sequence. Arrow navigation can cross month boundaries and updates `v-model:placeholder` before moving focus.
