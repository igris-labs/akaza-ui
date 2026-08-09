---
title: Month Picker
description: Accessible month grid with locale labels, paging, constraints, and single or multiple selection.
navigation:
  icon: i-lucide-calendar-range
  badge:
    label: NEW
    color: success
---

`MonthPicker` presents one year at a time as an accessible month grid. It handles roving focus, year paging, locale labels, constraints, single or multiple selection, and cancelable updates.

Use it when day precision is unnecessary, such as billing periods, reporting months, or publication schedules. One flat component generates all structural parts; slots and `ui` expose customization without a nested part tree.

::callout{icon="i-lucide-package"}
Values use `@internationalized/date`. Install it beside Akaza UI when application code creates dates: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **`#previous`**: Previous-year control content with disabled state.
- **`#heading`**: Current year label and visible month items.
- **`#next`**: Next-year control content with disabled state.
- **`#month`**: Month button content with date, label, selected, today, focused, disabled, and unavailable state.
- **`#footer`**: Optional content after the grid with current value and placeholder.

Month Picker generates the root, header, navigation buttons, live heading, ARIA grid, rows, cells, and month buttons.

## Usage

::component-preview
  :::examples-month-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateValue, MonthPickerModelValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { MonthPicker } from "akaza-ui";

const value = shallowRef<MonthPickerModelValue>(new CalendarDate(2026, 8, 1));
const page = shallowRef<CalendarDateValue>(new CalendarDate(2026, 1, 1));
</script>

<template>
  <MonthPicker v-model="value" v-model:placeholder="page" />
</template>
```
::

## Examples

### Multiple months

Set `multiple` to use an array model. Activating an already selected month removes it unless `preventDeselect` is enabled.

```vue
<MonthPicker v-model="months" multiple />
```

### Constraints and unavailable months

Use `minValue` and `maxValue` for hard boundaries. Use `isMonthDisabled` for application rules and `isMonthUnavailable` for valid but unselectable periods.

```vue
<MonthPicker
  v-model="month"
  :min-value="new CalendarDate(2026, 3, 1)"
  :max-value="new CalendarDate(2026, 10, 1)"
  :is-month-unavailable="date => date.month === 7"
/>
```

Blocked months remain keyboard discoverable through `aria-disabled`, but activation does not update the model.

### Controlled paging

Bind `v-model:placeholder` when application state must own the displayed year. `nextPage` and `prevPage` can replace default one-year arithmetic.

```vue
<MonthPicker
  v-model="month"
  v-model:placeholder="visibleYear"
  :next-page="date => date.add({ years: 2 })"
  :prev-page="date => date.subtract({ years: 2 })"
/>
```

### Custom month content

The `month` slot changes visible button content without replacing keyboard or ARIA behavior.

```vue
<MonthPicker>
  <template #month="{ label, selected, today }">
    <span :class="{ 'font-bold': selected, underline: today }">{{ label }}</span>
  </template>
</MonthPicker>
```

### Cancel changes

Selection and page updates emit cancelable details before mutating their models.

```vue
<MonthPicker
  v-model="month"
  @value-change="(_value, details) => locked && details.cancel()"
/>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateValue \| CalendarDateValue[] \| undefined` | `undefined` | Selected month or selected months when `multiple` is enabled. Values are normalized to day `1`. |
| `v-model:placeholder` | `CalendarDateValue` | selected month or today | Year displayed by the grid. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `string` | `"en-US"` | Locale used for month and year labels. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and horizontal arrow behavior. |
| `calendarLabel` | `string` | `"Month picker"` | Accessible root label. |
| `columns` | `number` | `3` | Number of month columns. |
| `multiple` | `boolean` | `false` | Enables independent multiple selection. |
| `preventDeselect` | `boolean` | `false` | Prevents removing an already selected month. |
| `disabled` | `boolean` | `false` | Disables paging and selection. |
| `readOnly` | `boolean` | `false` | Allows navigation but blocks selection. |
| `initialFocus` | `boolean` | `false` | Focuses the selected month, current month, or first visible month on mount. |
| `minValue` | `CalendarDateValue` | — | Earliest selectable month and page boundary. |
| `maxValue` | `CalendarDateValue` | — | Latest selectable month and page boundary. |
| `isMonthDisabled` | `(date) => boolean` | — | Marks a month disabled by application rules. |
| `isMonthUnavailable` | `(date) => boolean` | — | Marks a month unavailable. |
| `nextPage` | `(placeholder) => CalendarDateValue` | add one year | Custom next-page calculation. |
| `prevPage` | `(placeholder) => CalendarDateValue` | subtract one year | Custom previous-page calculation. |
| `ui` | `MonthPickerUi` | — | Classes for generated parts. |

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
| `heading` | `label`, `items` | Current year heading. |
| `next` | `disabled` | Next control content. |
| `month` | `date`, `label`, `selected`, `today`, `disabled`, `unavailable`, `focused` | Month button content and state. |
| `footer` | `value`, `placeholder` | Optional content after grid. |

### Methods

| Method | Description |
|--------|-------------|
| `focusValue(date)` | Moves roving focus to a month and pages when needed. |
| `selectValue(date, event?)` | Requests month selection. |
| `nextPage(event?)` | Requests next page. |
| `previousPage(event?)` | Requests previous page. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root group. |
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
| `root` | `.akaza-month-picker` | `data-akaza-state`, `data-akaza-selection-mode`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `header` | `.akaza-month-picker-header` | — |
| `previous` | `.akaza-month-picker-previous` | `data-akaza-disabled` |
| `heading` | `.akaza-month-picker-heading` | — |
| `next` | `.akaza-month-picker-next` | `data-akaza-disabled` |
| `grid` | `.akaza-month-picker-grid` | — |
| `gridRow` | `.akaza-month-picker-grid-row` | — |
| `cell` | `.akaza-month-picker-cell` | selection and availability attributes listed below |
| `cellTrigger` | `.akaza-month-picker-cell-trigger` | `data-akaza-state`, `data-akaza-selected`, `data-akaza-today`, `data-akaza-disabled`, `data-akaza-unavailable` |
| `footer` | `.akaza-month-picker-footer` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowLeft` / `ArrowRight` | Moves one month, reversed in RTL. |
| `ArrowUp` / `ArrowDown` | Moves one visual row using `columns`. |
| `Home` / `End` | Moves to first or last month in current row. |
| `PageUp` / `PageDown` | Moves one year. |
| `Shift + PageUp` / `Shift + PageDown` | Moves ten years. |
| `Enter` / `Space` | Selects focused month. |

Native buttons provide pointer and touch activation. Focus never scrolls the document unexpectedly.
