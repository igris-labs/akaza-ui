---
title: Month Range Picker
description: Accessible month-level range selection with preview, limits, fixed endpoints, and constraints.
navigation:
  icon: i-lucide-calendar-range
  badge:
    label: NEW
    color: success
---

`MonthRangePicker` selects inclusive ranges at month precision. First activation sets an anchor; hover or keyboard focus previews a pending range; second activation commits normalized start and end values.

Use it for reporting windows, subscriptions, fiscal periods, and other workflows where days are irrelevant. It shares Month Picker's flat DOM and styling contract.

## Anatomy

- **`#previous`**: Previous-year control content.
- **`#heading`**: Current year heading.
- **`#next`**: Next-year control content.
- **`#month`**: Month content with endpoint, in-range, highlighted, and availability state.
- **`#footer`**: Optional content after the grid.

## Usage

::component-preview
  :::examples-month-range-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthRangePicker } from "akaza-ui";

const range = shallowRef<CalendarDateRange>({});
const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
</script>

<template>
  <MonthRangePicker v-model="range" v-model:placeholder="page" />
</template>
```
::

## Examples

### Maximum range length

`maximumMonths` counts both endpoints. A value of `3` accepts March through May but rejects March through June.

```vue
<MonthRangePicker v-model="range" :maximum-months="3" />
```

### Fixed endpoint

Keep one boundary stable while users choose the other. The fixed boundary must already exist in the model.

```vue
<MonthRangePicker v-model="range" fixed-date="start" />
```

### Non-contiguous ranges

Ranges containing blocked interior months are rejected by default. `allowNonContiguousRanges` permits blocked interior months while keeping both endpoints selectable.

```vue
<MonthRangePicker
  v-model="range"
  allow-non-contiguous-ranges
  :is-month-unavailable="isClosedMonth"
/>
```

### Application constraints

Hard boundaries also disable paging when no month on the target page can be selected.

```vue
<MonthRangePicker
  :min-value="new CalendarDate(2026, 3, 1)"
  :max-value="new CalendarDate(2027, 6, 1)"
/>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateRange` | `{}` | Optional normalized `start` and `end` months. |
| `v-model:placeholder` | `CalendarDateValue` | selected start or today | Year displayed by grid. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en-US"` | Locale used for labels. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and horizontal arrows. |
| `calendarLabel` | `string` | `"Month range picker"` | Accessible root label. |
| `columns` | `number` | `3` | Number of month columns. |
| `allowNonContiguousRanges` | `boolean` | `false` | Allows blocked interior months. |
| `maximumMonths` | `number` | — | Maximum inclusive range length. |
| `fixedDate` | `"start" \| "end"` | — | Keeps one endpoint fixed. |
| `disabled` | `boolean` | `false` | Disables paging and selection. |
| `readOnly` | `boolean` | `false` | Allows navigation but blocks selection. |
| `initialFocus` | `boolean` | `false` | Focuses selected/current month on mount. |
| `minValue` | `CalendarDateValue` | — | Earliest selectable month. |
| `maxValue` | `CalendarDateValue` | — | Latest selectable month. |
| `isMonthDisabled` | `(date) => boolean` | — | Marks months disabled. |
| `isMonthUnavailable` | `(date) => boolean` | — | Marks months unavailable. |
| `nextPage` | `(placeholder) => CalendarDateValue` | add one year | Custom next page. |
| `prevPage` | `(placeholder) => CalendarDateValue` | subtract one year | Custom previous page. |
| `ui` | `MonthRangePickerUi` | — | Classes for generated parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `CalendarDateRange` | Fires after accepted range changes. |
| `update:placeholder` | `CalendarDateValue` | Fires after accepted page changes. |
| `value-change` | `(range, details)` | Cancelable range change. |
| `placeholder-change` | `(date, details)` | Cancelable page change. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `previous` | `disabled` | Previous control content. |
| `heading` | `label`, `items` | Year heading. |
| `next` | `disabled` | Next control content. |
| `month` | `date`, `label`, `selected`, `rangeStart`, `rangeEnd`, `inRange`, `highlighted`, `disabled`, `unavailable`, `focused` | Month content and range state. |
| `footer` | `value`, `placeholder` | Optional footer. |

### Methods

| Method | Description |
|--------|-------------|
| `focusValue(date)` | Moves roving focus to a month and pages when needed. |
| `selectValue(date, event?)` | Requests an endpoint selection. |
| `nextPage(event?)` | Requests the next year. |
| `previousPage(event?)` | Requests the previous year. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root range group. |
| `header` | Navigation header. |
| `previous` | Previous-year button. |
| `heading` | Live year heading. |
| `next` | Next-year button. |
| `grid` | ARIA month grid. |
| `gridRow` | Grid row. |
| `cell` | Grid cell. |
| `cellTrigger` | Interactive month button. |
| `footer` | Optional footer. |

### Styling Hooks

| UI key | CSS class | Data attributes |
|--------|-----------|-----------------|
| `root` | `.akaza-month-range-picker` | `data-akaza-state="empty|selecting|selected"`, `data-akaza-selection-mode="range"`, `data-akaza-fixed-date`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `header` | `.akaza-month-range-picker-header` | — |
| `previous` | `.akaza-month-range-picker-previous` | `data-akaza-disabled` |
| `heading` | `.akaza-month-range-picker-heading` | — |
| `next` | `.akaza-month-range-picker-next` | `data-akaza-disabled` |
| `grid` | `.akaza-month-range-picker-grid` | — |
| `gridRow` | `.akaza-month-range-picker-grid-row` | — |
| `cell` | `.akaza-month-range-picker-cell` | Selection, range, highlight, and availability attributes listed below. |
| `cellTrigger` | `.akaza-month-range-picker-cell-trigger` | `data-akaza-state`, `data-akaza-selected`, `data-akaza-today`, `data-akaza-range-start`, `data-akaza-range-end`, `data-akaza-in-range`, `data-akaza-highlighted`, `data-akaza-disabled`, `data-akaza-unavailable` |
| `footer` | `.akaza-month-range-picker-footer` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| Arrow keys | Move one month horizontally or one `columns` row vertically. Horizontal movement reverses in RTL. |
| `Home` / `End` | Moves to row boundary. |
| `PageUp` / `PageDown` | Moves one year. |
| `Shift + PageUp` / `Shift + PageDown` | Moves ten years. |
| `Enter` / `Space` | Sets range start or completes range end. |

Pointer hover previews a pending range; touch activation selects endpoints without relying on hover.
