---
title: Date Range Field
description: Locale-ordered segmented start and end dates with aggregate validation, fixed endpoints, and native forms.
navigation:
  icon: i-lucide-calendar-range
  badge:
    label: NEW
    color: success
---

`DateRangeField` combines two segmented date inputs under one range model. It coordinates locale order, partial entry, range constraints, Field state, cancelable changes, and two native form values without exposing a nested part-component API.

Use it when users should type exact start and end dates. Use [Date Range Picker](/components/date-range-picker) when the same range also needs visual calendar selection.

::callout{icon="i-lucide-package"}
Date values come from `@internationalized/date`. Install it beside Akaza UI when application code creates or transforms dates: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **root**: Generated range group containing both endpoint fields.
- **start**: Generated start-endpoint wrapper.
- **start field**: Generated Date Field for the start value.
- **`#start-literal`**: Replaces locale separators inside the start field.
- **`#separator`**: Replaces the visual separator between endpoints.
- **end**: Generated end-endpoint wrapper.
- **end field**: Generated Date Field for the end value.
- **`#end-literal`**: Replaces locale separators inside the end field.
- **hidden input**: Generated aggregate validity control. Each endpoint Date Field also owns its ISO form input.

Date Range Field owns endpoint segment markup because focus movement, spinbutton values, partial text, labels, and validation must stay synchronized. Every visible generated part remains styleable through `ui`.

## Usage

::component-preview
  :::examples-date-range-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { DateRangeField } from "akaza-ui";
import { shallowRef } from "vue";

const range = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 12),
  end: new CalendarDate(2026, 8, 18),
});
</script>

<template>
  <DateRangeField v-model="range" />
</template>
```
::

## Examples

### Field integration

Wrap Date Range Field in `Field` to inherit label, description, required, disabled, name, and error relationships. Aggregate validation stays quiet until users interact or submit.

```vue
<Field
  label="Travel dates"
  name="travel"
  description="Choose arrival and departure."
  required
>
  <DateRangeField v-model="range" />
</Field>
```

The default form names become `travel.start` and `travel.end`. Override them independently with `startName` and `endName`.

### Range constraints

Boundaries apply to both endpoints. `maximumDays` counts both start and end. Unavailable dates inside a range invalidate it unless non-contiguous ranges are allowed.

```vue
<DateRangeField
  v-model="range"
  :min-value="new CalendarDate(2026, 8, 1)"
  :max-value="new CalendarDate(2026, 9, 30)"
  :maximum-days="14"
  :is-date-unavailable="(date) => closedDates.has(date.toString())"
/>
```

Set `allowNonContiguousRanges` when unavailable interior dates may be skipped conceptually. Start and end must still be available.

### Fixed endpoint

Keep one known boundary read-only while users edit the other. The fixed endpoint is exposed through `data-akaza-fixed-date`.

```vue
<DateRangeField v-model="range" fixed-date="start" />
```

### Locale order and paste

Both endpoints use the same locale. For `en-GB`, visual and focus order is day, month, year. Paste a date with three numeric groups into either endpoint.

```vue
<DateRangeField v-model="range" locale="en-GB" />
```

### Cancel changes

Endpoint edits emit the complete proposed range before the model changes. Reasons are prefixed with `start-` or `end-`.

```vue
<DateRangeField
  v-model="range"
  @value-change="(next, details) => {
    if (next.end?.day === 20) details.cancel()
  }"
/>
```

### Read-only and disabled

Read-only segments stay focusable for inspection. Disabled segments leave the tab sequence and both endpoint values are excluded from form submission.

```vue
<DateRangeField :model-value="range" read-only />
<DateRangeField :model-value="range" disabled />
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateRange` | `{}` | Optional `start` and `end` date values. Partial segment text remains internal. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Field/generated id | ID assigned to the first start segment. |
| `name` | `string` | Field name | Base native form name used to create `.start` and `.end` names. |
| `startName` | `string` | `${name}.start` | Explicit start form field name. |
| `endName` | `string` | `${name}.end` | Explicit end form field name. |
| `locale` | `string` | `"en-US"` | Segment order, separators, and accessible labels for both endpoints. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and segment arrow behavior. |
| `placeholder` | `CalendarDateValue` | today | Date context used while endpoint segments are partial. |
| `minValue` | `CalendarDateValue` | - | Earliest valid start and endpoint value. |
| `maxValue` | `CalendarDateValue` | - | Latest valid end and endpoint value. |
| `isDateUnavailable` | `(date) => boolean` | - | Application rule for unavailable dates. |
| `allowNonContiguousRanges` | `boolean` | `false` | Allows unavailable dates inside, but not at boundaries. |
| `maximumDays` | `number` | - | Maximum inclusive range length. |
| `fixedDate` | `"start" \| "end"` | - | Makes one endpoint read-only. |
| `required` | `boolean` | `false` | Requires both endpoints for native validity. |
| `disabled` | `boolean` | `false` | Disables editing and native form participation. |
| `readOnly` | `boolean` | `false` | Keeps segments focusable but blocks changes. |
| `invalid` | `boolean` | `false` | Forces invalid styling and ARIA state. |
| `selectOnFocus` | `boolean` | `true` | Selects focused segment text. |
| `autoAdvance` | `boolean` | `true` | Advances after a segment reaches full length. |
| `startLabel` | `string` | `"Start date"` | Accessible label for the start Date Field. |
| `endLabel` | `string` | `"End date"` | Accessible label for the end Date Field. |
| `ariaLabel` | `string` | `"Date range"` | Root group label without an external label. |
| `ariaLabelledby` | `string` | Field label ID | External label relationship. |
| `ariaDescribedby` | `string` | Field description/error IDs | External description relationship. |
| `ui` | `DateRangeFieldUi` | - | Classes for generated structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `CalendarDateRange` | Fires after an accepted endpoint change or clear. |
| `value-change` | `(range, details)` | Fires before model changes. `details.cancel()` prevents the change. |
| `value-commit` | `(range, details)` | Fires after accepted endpoint input, keyboard, paste, or blur commits. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `start-literal` | `value` | Replaces locale separators inside the start endpoint. |
| `separator` | - | Replaces the visual separator between endpoints. |
| `end-literal` | `value` | Replaces locale separators inside the end endpoint. |

### Methods

| Method | Description |
|--------|-------------|
| `focusStart()` | Focuses first locale-ordered start segment. |
| `focusEnd()` | Focuses first locale-ordered end segment. |
| `clear(event?)` | Requests an empty range through cancelable change flow. |
| `setValue(value, reason, event?)` | Requests an imperative range change. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Range group root. |
| `start` | Start endpoint wrapper. |
| `startField` | Nested `DateFieldUi` for start segments. |
| `separator` | Endpoint separator. |
| `end` | End endpoint wrapper. |
| `endField` | Nested `DateFieldUi` for end segments. |
| `hiddenInput` | Aggregate native validity input. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-date-range-field` | `data-akaza-state="empty\|partial\|complete"`, `data-akaza-fixed-date`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-required`, `data-akaza-invalid`, `data-akaza-dirty`, `data-akaza-touched`, `data-akaza-filled`, `data-akaza-focused` |
| `start` | `akaza-date-range-field-start` | `data-akaza-endpoint="start"`, `data-akaza-state="empty\|filled"` |
| `separator` | `akaza-date-range-field-separator` | - |
| `end` | `akaza-date-range-field-end` | `data-akaza-endpoint="end"`, `data-akaza-state="empty\|filled"` |
| `hiddenInput` | `akaza-date-range-field-hidden-input` | native validity attrs |

Nested endpoint parts retain Date Field's exact semantic classes and data attributes. Plain `class` applies to the Date Range Field root; use `ui.startField` and `ui.endField` for generated segment internals.

### Keyboard

Each endpoint follows [Date Field keyboard behavior](/components/date-field#keyboard). `Tab` moves through start segments, then end segments. Root uses `role="group"`; each date segment remains a labeled `role="spinbutton"`.
