---
title: Time Field
description: Locale-aware segmented time input with keyboard editing, constraints, granularity, and native forms.
navigation:
  icon: i-lucide-clock-3
  badge:
    label: NEW
    color: success
---

`TimeField` renders locale-ordered hour, minute, second, and day-period controls. It handles 12/24-hour cycles, keyboard stepping, paste, granularity, step snapping, constraints, Field state, cancelable changes, and native form submission.

Use it when users need precise, editable clock values. Akaza keeps one flat component: generated segment behavior stays intact while `ui`, semantic classes, data attributes, and focused slots control presentation.

::callout{icon="i-lucide-package"}
`TimeValue` is `Time | CalendarDateTime | ZonedDateTime` from `@internationalized/date`. Install it beside Akaza UI when application code creates values: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **`#literal`**: Locale separator content, such as `:` or spacing.
- **`#day-period`**: AM/PM button content with canonical value, localized label, and toggle action.
- **`#time-zone`**: Time-zone label content for `ZonedDateTime` values.

Time Field generates the root group, segment container, spinbutton inputs, locale literals, optional day-period button, optional time-zone label, and native form input.

## Usage

::component-preview
  :::examples-time-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { TimeValue } from "akaza-ui";
import { Time } from "@internationalized/date";
import { shallowRef } from "vue";
import { TimeField } from "akaza-ui";

const value = shallowRef<TimeValue>(new Time(9, 30));
</script>

<template>
  <TimeField v-model="value" :hour-cycle="12" />
</template>
```
::

## Examples

### 12-hour and 24-hour cycles

Omit `hourCycle` to follow locale preference. Bind numeric `12` or `24` when product requirements must override it.

```vue
<TimeField v-model="time" :hour-cycle="12" />
<TimeField v-model="time" :hour-cycle="24" />
```

In 12-hour mode, day period is a real button. It works with click, touch, arrow keys, and direct `A` or `P` input.

### Granularity

`granularity` renders through the requested smallest unit. Omitted minutes or seconds are stored as zero when a complete value is committed.

```vue
<TimeField v-model="hour" granularity="hour" />
<TimeField v-model="minute" granularity="minute" />
<TimeField v-model="precise" granularity="second" />
```

### Step and snapping

Step values control keyboard increments for each segment. `stepSnapping` also rounds complete typed or pasted values to the nearest combined interval.

```vue
<TimeField
  v-model="time"
  :step="{ minute: 15 }"
  step-snapping
/>
```

### Constraints and unavailable times

Constraints report native validity after interaction without turning an untouched field red.

```vue
<TimeField
  v-model="time"
  :min-value="new Time(9)"
  :max-value="new Time(17)"
  :is-time-unavailable="value => value.hour === 12"
/>
```

### Field and native form

`TimeField` inherits `id`, `name`, `required`, `disabled`, descriptions, and validation presentation from `Field`.

```vue
<Field label="Meeting time" name="meeting" required>
  <TimeField v-model="time" />
</Field>
```

Complete values submit ISO time strings such as `09:30:00`. Disabled controls are omitted from `FormData`.

### Zoned values

Passing a `ZonedDateTime` preserves its date and zone when editing time fields. The zone identifier is visible unless `hideTimeZone` is enabled.

```vue
<TimeField v-model="zonedTime" />
<TimeField v-model="zonedTime" hide-time-zone />
```

### Cancel changes

```vue
<TimeField
  v-model="time"
  @value-change="(value, details) => {
    if (value && value.hour < 8) details.cancel()
  }"
/>
```

Canceled updates restore segment text to the accepted model.

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `TimeValue \| undefined` | `undefined` | Accepted clock value. Existing date and zone data are preserved. |
| `v-model:placeholder` | `TimeValue \| undefined` | `placeholder` or midnight | Base value used before a model exists; accepted edits update it. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Field id or generated | Id placed on first segment. |
| `name` | `string` | Field name | Native form name. |
| `locale` | `string` | `"en-US"` | Segment order, literals, labels, and default hour cycle. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and horizontal focus movement. |
| `placeholder` | `TimeValue` | midnight | Base time and value type used before selection. |
| `minValue` | `TimeValue` | — | Earliest valid clock time. |
| `maxValue` | `TimeValue` | — | Latest valid clock time. |
| `isTimeUnavailable` | `(time) => boolean` | — | Application-level unavailable matcher. |
| `granularity` | `"hour" \| "minute" \| "second"` | `"minute"` | Smallest rendered and committed unit. |
| `hourCycle` | `12 \| 24` | locale preference | Explicit hour cycle. Use `:hour-cycle="24"`, not a string attribute. |
| `hideTimeZone` | `boolean` | `false` | Hides zone label for zoned values. |
| `step` | `{ hour?, minute?, second? }` | each segment `1` | Segment stepping and optional snap interval. |
| `stepSnapping` | `boolean` | `false` | Rounds complete values to nearest combined step. |
| `required` | `boolean` | `false` | Requires a complete time. |
| `disabled` | `boolean` | `false` | Disables all segments and native submission. |
| `readOnly` | `boolean` | `false` | Allows focus but blocks edits. |
| `invalid` | `boolean` | `false` | Forces invalid presentation. |
| `selectOnFocus` | `boolean` | `true` | Selects segment text on focus. |
| `autoAdvance` | `boolean` | `true` | Moves focus after two digits. |
| `ariaLabel` | `string` | `"Time"` | Root label when no labelled-by relation exists. |
| `ariaLabelledby` | `string` | Field label id | Explicit label relation. |
| `ariaDescribedby` | `string` | Field description/error ids | Explicit description relation. |
| `ui` | `TimeFieldUi` | — | Classes for generated parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `TimeValue \| undefined` | Fires after accepted value changes. |
| `update:placeholder` | `TimeValue \| undefined` | Fires when accepted interaction updates placeholder. |
| `value-change` | `(value, details)` | Fires before model mutation. `details.cancel()` rejects it. |
| `value-commit` | `(value, details)` | Fires after complete input, keyboard, paste, day-period, blur, or clear commit. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `literal` | `value` | Locale separator content. |
| `day-period` | `value`, `label`, `toggle` | AM/PM control content and event-safe toggle action. |
| `time-zone` | `value` | Zone identifier content. |

### Methods

| Method | Description |
|--------|-------------|
| `focus()` | Focuses first segment without scrolling page. |
| `clear(event?)` | Requests an undefined value. |
| `setValue(value, reason, event?)` | Requests programmatic value change through cancelable contract. |

### UI Options

| Key | Part |
|-----|------|
| `root` | Root group. |
| `segments` | Locale-ordered segment container. |
| `segment` | Every numeric spinbutton input. |
| `literal` | Locale separators. |
| `dayPeriod` | AM/PM button. |
| `timeZone` | Zone label. |
| `hiddenInput` | Native form/validity input. |

### Styling Hooks

| UI key | CSS class | Data attributes |
|--------|-----------|-----------------|
| `root` | `.akaza-time-field` | `data-akaza-state="empty|partial|complete"`, `data-akaza-granularity`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-required`, `data-akaza-invalid`, `data-akaza-dirty`, `data-akaza-touched`, `data-akaza-filled`, `data-akaza-focused` |
| `segments` | `.akaza-time-field-segments` | — |
| `segment` | `.akaza-time-field-segment` | `data-akaza-segment`, `data-akaza-state="empty|filled"`, `data-akaza-placeholder` |
| `literal` | `.akaza-time-field-literal` | — |
| `dayPeriod` | `.akaza-time-field-day-period` | `data-akaza-state="am|pm"` |
| `timeZone` | `.akaza-time-field-time-zone` | — |
| `hiddenInput` | `.akaza-time-field-hidden-input` | — |

Direct `class` applies to root. Use `ui.segment`, `ui.dayPeriod`, and other keys for generated inner parts.

### Keyboard

| Key | Behavior |
|-----|----------|
| Number keys | Replaces selected segment text. Complete segments update model. |
| `ArrowUp` / `ArrowDown` | Steps focused segment, wrapping at boundaries. |
| `PageUp` / `PageDown` | Steps focused segment by ten increments. |
| `Home` / `End` | Sets segment minimum or maximum. |
| `ArrowLeft` / `ArrowRight` | Moves between segments and day period, reversed in RTL. |
| `Backspace` | Clears text; when empty, moves to previous segment. |
| `A` / `P` | Sets AM or PM while day period is focused. |
| Paste | Distributes colon- or space-separated time parts. |

Each numeric segment uses `role="spinbutton"` with value bounds. Native inputs and button semantics provide keyboard, mouse, touch, and screen-reader behavior.
