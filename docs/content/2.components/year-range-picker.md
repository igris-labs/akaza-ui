---
title: Year Range Picker
description: Accessible year-level range selection with preview, limits, fixed endpoints, and paging.
navigation:
  icon: i-lucide-calendar-range
  badge:
    label: NEW
    color: success
---

`YearRangePicker` selects inclusive year ranges. It combines Year Picker's paged grid and roving focus with range anchoring, preview, maximum length, non-contiguous rules, and fixed endpoints.

## Anatomy

- **`#previous`**: Previous-page control content.
- **`#heading`**: Visible year-range heading.
- **`#next`**: Next-page control content.
- **`#year`**: Year content with range and availability state.
- **`#footer`**: Optional content after grid.

## Usage

::component-preview
  :::examples-year-range-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { shallowRef } from "vue";
import { YearRangePicker } from "akaza-ui";

const range = shallowRef<CalendarDateRange>({});
</script>

<template>
  <YearRangePicker v-model="range" :maximum-years="6" />
</template>
```
::

## Examples

### Maximum range

`maximumYears` counts both endpoints and rejects a longer second selection.

```vue
<YearRangePicker v-model="range" :maximum-years="5" />
```

### Fixed boundary

```vue
<YearRangePicker
  v-model="range"
  fixed-date="start"
/>
```

The fixed endpoint must exist. Selections before a fixed start, or after a fixed end, are rejected.

### Custom page shape

```vue
<YearRangePicker :years-per-page="16" :columns="4" />
```

### Unavailable years

```vue
<YearRangePicker
  :is-year-unavailable="date => suspendedYears.has(date.year)"
  allow-non-contiguous-ranges
/>
```

Without `allowNonContiguousRanges`, blocked interior years reject the range. Endpoints always remain selectable.

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateRange` | `{}` | Optional start and end years normalized to January 1. |
| `v-model:placeholder` | `CalendarDateValue` | selected start or today | First visible year. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en-US"` | Locale used for labels. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction. |
| `calendarLabel` | `string` | `"Year range picker"` | Accessible root label. |
| `columns` | `number` | `3` | Visual grid columns. |
| `yearsPerPage` | `number` | `12` | Visible years and paging distance. |
| `allowNonContiguousRanges` | `boolean` | `false` | Allows blocked interior years. |
| `maximumYears` | `number` | — | Maximum inclusive range length. |
| `fixedDate` | `"start" \| "end"` | — | Keeps one endpoint fixed. |
| `disabled` | `boolean` | `false` | Disables paging and selection. |
| `readOnly` | `boolean` | `false` | Allows navigation but blocks selection. |
| `initialFocus` | `boolean` | `false` | Focuses selected/current year on mount. |
| `minValue` / `maxValue` | `CalendarDateValue` | — | Selection and paging boundaries. |
| `isYearDisabled` | `(date) => boolean` | — | Marks years disabled. |
| `isYearUnavailable` | `(date) => boolean` | — | Marks years unavailable. |
| `nextPage` / `prevPage` | `(placeholder) => CalendarDateValue` | page arithmetic | Custom page calculations. |
| `ui` | `YearRangePickerUi` | — | Classes for generated parts. |

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
| `heading` | `label`, `items` | Visible year-range heading. |
| `next` | `disabled` | Next control content. |
| `year` | `date`, `label`, `selected`, `rangeStart`, `rangeEnd`, `inRange`, `highlighted`, `disabled`, `unavailable`, `focused` | Year content and range state. |
| `footer` | `value`, `placeholder` | Optional content after grid. |

### Methods

| Method | Description |
|--------|-------------|
| `focusValue(date)` | Moves roving focus to a year and pages when needed. |
| `selectValue(date, event?)` | Requests an endpoint selection. |
| `nextPage(event?)` | Requests the next year page. |
| `previousPage(event?)` | Requests the previous year page. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root range group. |
| `header` | Navigation header. |
| `previous` | Previous-page button. |
| `heading` | Live year-range heading. |
| `next` | Next-page button. |
| `grid` | ARIA year grid. |
| `gridRow` | Grid row. |
| `cell` | Grid cell. |
| `cellTrigger` | Interactive year button. |
| `footer` | Optional footer. |

### Styling Hooks

| UI key | CSS class | Data attributes |
|--------|-----------|-----------------|
| `root` | `.akaza-year-range-picker` | `data-akaza-state="empty|selecting|selected"`, `data-akaza-selection-mode="range"`, `data-akaza-fixed-date`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `header` | `.akaza-year-range-picker-header` | — |
| `previous` | `.akaza-year-range-picker-previous` | `data-akaza-disabled` |
| `heading` | `.akaza-year-range-picker-heading` | — |
| `next` | `.akaza-year-range-picker-next` | `data-akaza-disabled` |
| `grid` | `.akaza-year-range-picker-grid` | — |
| `gridRow` | `.akaza-year-range-picker-grid-row` | — |
| `cell` | `.akaza-year-range-picker-cell` | Selection, range, highlight, and availability attributes listed below. |
| `cellTrigger` | `.akaza-year-range-picker-cell-trigger` | `data-akaza-state`, `data-akaza-selected`, `data-akaza-today`, `data-akaza-range-start`, `data-akaza-range-end`, `data-akaza-in-range`, `data-akaza-highlighted`, `data-akaza-disabled`, `data-akaza-unavailable` |
| `footer` | `.akaza-year-range-picker-footer` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| Arrow keys | Move by one year or one visual row. Horizontal movement reverses in RTL. |
| `Home` / `End` | Moves to row boundary. |
| `PageUp` / `PageDown` | Moves one page. |
| `Shift + PageUp` / `Shift + PageDown` | Moves ten pages. |
| `Enter` / `Space` | Sets range start or completes range end. |

Hover previews pending ranges for pointer users. Keyboard focus provides the same preview; touch users select endpoints directly.
