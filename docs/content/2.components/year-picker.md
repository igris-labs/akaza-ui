---
title: Year Picker
description: Accessible paged year grid with constraints and single or multiple selection.
navigation:
  icon: i-lucide-calendar-days
  badge:
    label: NEW
    color: success
---

`YearPicker` presents a configurable page of years with roving focus, paging, constraints, locale formatting, and single or multiple selection. Selected values are `@internationalized/date` dates normalized to January 1.

## Anatomy

- **`#previous`**: Previous-page control content.
- **`#heading`**: Visible year-range heading.
- **`#next`**: Next-page control content.
- **`#year`**: Year button content and state.
- **`#footer`**: Optional content after grid.

## Usage

::component-preview
  :::examples-year-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateValue, YearPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { YearPicker } from "akaza-ui";

const value = shallowRef<YearPickerModelValue>();
const page = shallowRef<CalendarDateValue>(new CalendarDate(2024, 1, 1));
</script>

<template>
  <YearPicker v-model="value" v-model:placeholder="page" />
</template>
```
::

## Examples

### Page size and columns

`yearsPerPage` controls paging distance and visible item count. `columns` controls visual keyboard rows independently.

```vue
<YearPicker :years-per-page="9" :columns="3" />
```

### Multiple years

Use `multiple` with an array model for non-contiguous years.

```vue
<YearPicker v-model="years" multiple prevent-deselect />
```

### Constraints

Boundaries and matcher props use complete date values but are compared at year precision.

```vue
<YearPicker
  :min-value="new CalendarDate(2025, 1, 1)"
  :max-value="new CalendarDate(2035, 1, 1)"
  :is-year-unavailable="date => date.year === 2030"
/>
```

### Custom year content

```vue
<YearPicker>
  <template #year="{ label, selected }">
    <strong v-if="selected">{{ label }}</strong>
    <span v-else>{{ label }}</span>
  </template>
</YearPicker>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateValue \| CalendarDateValue[] \| undefined` | `undefined` | Selected year(s), normalized to January 1. |
| `v-model:placeholder` | `CalendarDateValue` | selected year or today | First year displayed on current page. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en-US"` | Locale used for year labels. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction. |
| `calendarLabel` | `string` | `"Year picker"` | Accessible root label. |
| `columns` | `number` | `3` | Visual grid columns. |
| `yearsPerPage` | `number` | `12` | Visible years and paging distance. |
| `multiple` | `boolean` | `false` | Enables independent multiple selection. |
| `preventDeselect` | `boolean` | `false` | Prevents removing a selected year. |
| `disabled` | `boolean` | `false` | Disables paging and selection. |
| `readOnly` | `boolean` | `false` | Allows navigation but blocks selection. |
| `initialFocus` | `boolean` | `false` | Focuses selected/current year on mount. |
| `minValue` / `maxValue` | `CalendarDateValue` | — | Selection and paging boundaries. |
| `isYearDisabled` | `(date) => boolean` | — | Marks years disabled. |
| `isYearUnavailable` | `(date) => boolean` | — | Marks years unavailable. |
| `nextPage` / `prevPage` | `(placeholder) => CalendarDateValue` | page arithmetic | Replaces default page calculation. |
| `ui` | `YearPickerUi` | — | Classes for generated parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Fires after accepted selection changes. |
| `update:placeholder` | `date` | Fires after accepted page changes. |
| `value-change` | `(value, details)` | Fires before selection. `details.cancel()` prevents update. |
| `placeholder-change` | `(date, details)` | Fires before paging. `details.cancel()` prevents update. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `previous` | `disabled` | Previous control content. |
| `heading` | `label`, `items` | Visible year-range heading. |
| `next` | `disabled` | Next control content. |
| `year` | `date`, `label`, `selected`, `today`, `disabled`, `unavailable`, `focused` | Year button content and state. |
| `footer` | `value`, `placeholder` | Optional content after grid. |

### Methods

| Method | Description |
|--------|-------------|
| `focusValue(date)` | Moves roving focus to a year and pages when needed. |
| `selectValue(date, event?)` | Requests year selection. |
| `nextPage(event?)` | Requests the next year page. |
| `previousPage(event?)` | Requests the previous year page. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root group. |
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
| `root` | `.akaza-year-picker` | `data-akaza-state`, `data-akaza-selection-mode`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `header` | `.akaza-year-picker-header` | — |
| `previous` | `.akaza-year-picker-previous` | `data-akaza-disabled` |
| `heading` | `.akaza-year-picker-heading` | — |
| `next` | `.akaza-year-picker-next` | `data-akaza-disabled` |
| `grid` | `.akaza-year-picker-grid` | — |
| `gridRow` | `.akaza-year-picker-grid-row` | — |
| `cell` | `.akaza-year-picker-cell` | Selection and availability attributes listed below. |
| `cellTrigger` | `.akaza-year-picker-cell-trigger` | `data-akaza-state`, `data-akaza-selected`, `data-akaza-today`, `data-akaza-disabled`, `data-akaza-unavailable` |
| `footer` | `.akaza-year-picker-footer` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowLeft` / `ArrowRight` | Moves one year, reversed in RTL. |
| `ArrowUp` / `ArrowDown` | Moves one visual row. |
| `Home` / `End` | Moves to row boundary. |
| `PageUp` / `PageDown` | Moves one `yearsPerPage` page. |
| `Shift + PageUp` / `Shift + PageDown` | Moves ten pages. |
| `Enter` / `Space` | Selects focused year. |
