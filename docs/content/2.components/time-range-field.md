---
title: Time Range Field
description: Coordinated segmented start and end times with aggregate validation and native form values.
navigation:
  icon: i-lucide-clock-arrow-up
  badge:
    label: NEW
    color: success
---

`TimeRangeField` composes two Time Field behaviors under one range model and one aggregate validity state. It coordinates locale order, granularity, hour cycle, constraints, partial input, Field integration, cancelable updates, and separate start/end form values.

Use it for schedules, availability windows, operating hours, and appointments where end time must be on or after start time.

## Anatomy

- **`#start-literal`**: Locale separators inside start field.
- **`#start-day-period`**: Start AM/PM content and action.
- **`#start-time-zone`**: Start zone content.
- **`#separator`**: Decorative separator between endpoints.
- **`#end-literal`**: Locale separators inside end field.
- **`#end-day-period`**: End AM/PM content and action.
- **`#end-time-zone`**: End zone content.

The root generates endpoint wrappers, two functional Time Fields, separator, and aggregate native validity input.

## Usage

::component-preview
  :::examples-time-range-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { TimeRange } from "akaza-ui";
import { Time } from "@internationalized/date";
import { shallowRef } from "vue";
import { TimeRangeField } from "akaza-ui";

const value = shallowRef<TimeRange>({
  start: new Time(9),
  end: new Time(17),
});
</script>

<template>
  <TimeRangeField v-model="value" :hour-cycle="24" />
</template>
```
::

## Examples

### Required range with Field

Aggregate validation starts after interaction. Untouched empty fields remain neutral; blur or submit reveals missing endpoints and Field error text.

```vue
<Field label="Availability" name="window" required>
  <TimeRangeField v-model="range" />
</Field>
```

FormData receives `window.start` and `window.end`. Set `startName` and `endName` when a backend expects different keys.

### Constraints

```vue
<TimeRangeField
  v-model="range"
  :min-value="new Time(8)"
  :max-value="new Time(20)"
  :is-time-unavailable="isUnavailable"
/>
```

Each endpoint validates boundaries and unavailable values. The parent additionally rejects reversed ranges.

### Seconds and step

```vue
<TimeRangeField
  v-model="range"
  granularity="second"
  :step="{ minute: 15 }"
  step-snapping
/>
```

### Custom endpoint presentation

Use nested `startField` and `endField` UI objects for segment parts while root UI keys style range layout.

```vue
<TimeRangeField
  :ui="{
    root: 'flex rounded border',
    startField: { segment: 'tabular-nums' },
    separator: 'text-neutral-500',
    endField: { segment: 'tabular-nums' },
  }"
/>
```

### Cancel changes

`value-change` reports the proposed full range with reasons such as `start-input` and `end-keyboard`.

```vue
<TimeRangeField
  v-model="range"
  @value-change="(value, details) => {
    if (isLocked(value)) details.cancel()
  }"
/>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `TimeRange` | `{}` | Optional `start` and `end` TimeValues. Partial segment text stays internal. |
| `v-model:placeholder` | `TimeValue \| undefined` | `placeholder` | Shared base value for both endpoints. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Field id or generated | Start field id; end adds `-end`. |
| `name` | `string` | Field name | Derives `.start` and `.end` form names. |
| `startName` / `endName` | `string` | derived | Explicit native form names. |
| `locale` | `string` | `"en-US"` | Segment order, labels, and default hour cycle. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction. |
| `placeholder` | `TimeValue` | midnight | Shared base time and value type. |
| `minValue` / `maxValue` | `TimeValue` | — | Endpoint boundaries. |
| `isTimeUnavailable` | `(time) => boolean` | — | Endpoint application constraint. |
| `granularity` | `"hour" \| "minute" \| "second"` | `"minute"` | Smallest endpoint unit. |
| `hourCycle` | `12 \| 24` | locale preference | Explicit hour cycle. |
| `hideTimeZone` | `boolean` | `false` | Hides zoned endpoint labels. |
| `step` | `{ hour?, minute?, second? }` | each `1` | Endpoint keyboard step. |
| `stepSnapping` | `boolean` | `false` | Snaps complete endpoint values. |
| `required` | `boolean` | `false` | Requires both endpoints. |
| `disabled` | `boolean` | `false` | Disables endpoints and form submission. |
| `readOnly` | `boolean` | `false` | Allows focus but blocks edits. |
| `invalid` | `boolean` | `false` | Forces invalid presentation. |
| `selectOnFocus` | `boolean` | `true` | Selects focused segment text. |
| `autoAdvance` | `boolean` | `true` | Advances after two digits. |
| `startLabel` | `string` | `"Start time"` | Accessible start label. |
| `endLabel` | `string` | `"End time"` | Accessible end label. |
| `ariaLabel` | `string` | `"Time range"` | Root label without Field label relation. |
| `ariaLabelledby` / `ariaDescribedby` | `string` | Field relations | Explicit ARIA relationships. |
| `ui` | `TimeRangeFieldUi` | — | Classes for range and endpoint parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `TimeRange` | Fires after accepted endpoint changes. |
| `update:placeholder` | `TimeValue \| undefined` | Fires after accepted placeholder changes. |
| `value-change` | `(range, details)` | Cancelable proposed range update. |
| `value-commit` | `(range, details)` | Accepted endpoint commit with prefixed reason. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `start-literal` / `end-literal` | `value` | Endpoint locale separators. |
| `start-day-period` / `end-day-period` | `value`, `label`, `toggle` | Endpoint AM/PM content. |
| `start-time-zone` / `end-time-zone` | `value` | Endpoint zone content. |
| `separator` | — | Visual separator; hidden from assistive technology. |

### Methods

| Method | Description |
|--------|-------------|
| `focusStart()` / `focusEnd()` | Focuses first segment of endpoint. |
| `clear(event?)` | Requests empty range. |
| `setValue(range, reason, event?)` | Requests programmatic range change. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root range group. |
| `start` | Start endpoint wrapper. |
| `startField` | Nested `TimeFieldUi` for start. |
| `separator` | Endpoint separator. |
| `end` | End endpoint wrapper. |
| `endField` | Nested `TimeFieldUi` for end. |
| `hiddenInput` | Aggregate native validity input. |

### Styling Hooks

| UI key | CSS class | Data attributes |
|--------|-----------|-----------------|
| `root` | `.akaza-time-range-field` | `data-akaza-state="empty|partial|complete"`, granularity, disabled, read-only, required, invalid, dirty, touched, filled, focused |
| `start` | `.akaza-time-range-field-start` | `data-akaza-endpoint="start"`, `data-akaza-state` |
| `separator` | `.akaza-time-range-field-separator` | — |
| `end` | `.akaza-time-range-field-end` | `data-akaza-endpoint="end"`, `data-akaza-state` |
| `hiddenInput` | `.akaza-time-range-field-hidden-input` | — |
| `startField` / `endField` | `.akaza-time-field-*` | All Time Field segment hooks. |

### Keyboard

Each endpoint uses Time Field keyboard behavior:

| Key | Behavior |
|-----|----------|
| Number keys / paste | Edits focused endpoint segment. |
| `ArrowUp` / `ArrowDown` | Steps segment. |
| `PageUp` / `PageDown` | Steps by ten increments. |
| `Home` / `End` | Sets segment boundary. |
| `ArrowLeft` / `ArrowRight` | Moves within current endpoint. |
| `Tab` / `Shift + Tab` | Uses native order across both endpoints and surrounding controls. |
| `A` / `P` | Sets focused endpoint day period. |

Mouse and touch edit native inputs and day-period buttons directly. No hover-only action is required.
