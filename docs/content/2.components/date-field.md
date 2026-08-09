---
title: Date Field
description: Locale-ordered segmented date input with keyboard editing, optional Calendar, validation, paste, and native forms.
navigation:
  icon: i-lucide-calendar-clock
  badge:
    label: NEW
    color: success
---

`DateField` splits a date into focusable day, month, and year spinbutton segments. It handles locale order, keyboard stepping, complete-date validation, ISO paste, Field state, native form submission, and optional visual selection through Calendar while keeping one Vue-native component API.

Use it when users need to type an exact date. Enable `showCalendar` when the same control should also offer visual date selection.

::callout{icon="i-lucide-package"}
Date values come from `@internationalized/date`. Install it beside Akaza UI when application code creates or transforms dates: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **root**: Generated date group containing segments and optional calendar trigger.
- **segments**: Generated locale-ordered segment wrapper.
- **segment**: Generated day, month, or year text input with `role="spinbutton"`.
- **`#literal`**: Optional replacement content for generated separators such as `/` or `.`.
- **`#calendar-trigger`**: Optional trigger content with open, close, and toggle actions.
- **calendar content**: Generated, positioned `role="dialog"` containing Calendar when `showCalendar` is enabled.
- **`#calendar`**: Replaces the built-in Calendar while retaining popup positioning and dismissal.
- **hidden input**: Generated native form control carrying the ISO date string and validity.

Date Field owns segment markup because editing, focus movement, labels, and spinbutton values must remain synchronized. Use `ui.segment` and state attributes for complete visual control.

## Usage

::component-preview
  :::examples-date-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { shallowRef } from "vue";
import { DateField } from "akaza-ui";

const date = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
</script>

<template>
  <DateField
    v-model="date"
    :placeholder="new CalendarDate(2026, 8, 1)"
  />
</template>
```
::

## Examples

### Field integration

Wrap Date Field in `Field` to inherit its name, label relationship, required state, description, native error message, and granular interaction attributes.

```vue
<Field
  label="Start date"
  name="start"
  description="Required for scheduling."
  required
>
  <DateField v-model="date" />
</Field>
```

Validation stays quiet on initial render. It becomes visible after users leave the group, enter an invalid complete date, or submit its form.

### Locale order

`locale` controls segment order, separators, and segment labels. The model remains an `@internationalized/date` value.

```vue
<DateField v-model="date" locale="en-GB" />
```

For `en-GB`, focus order is day, month, year. For `en-US`, it is month, day, year.

### Date constraints

Use boundaries for fixed limits and `isDateUnavailable` for application rules. Invalid dates expose Field error state after interaction.

```vue
<DateField
  v-model="date"
  :min-value="new CalendarDate(2026, 8, 10)"
  :max-value="new CalendarDate(2026, 8, 24)"
  :is-date-unavailable="(date) => closedDates.has(date.toString())"
/>
```

### Calendar picker

Set `showCalendar` to add a keyboard-accessible calendar trigger. Date Field forwards locale, direction, constraints, disabled state, read-only state, and `ui.calendar` to its built-in Calendar. Selection commits the date and closes the popup.

```vue
<DateField v-model="date" show-calendar>
  <template #calendar-trigger>Calendar</template>
</DateField>
```

Use `v-model:calendar-open` when popup state must be controlled. Use `#calendar` to replace the calendar body without replacing positioning, outside-click dismissal, Escape handling, or layer ordering.

```vue
<DateField v-model="date" show-calendar>
  <template #calendar="{ value, select, close }">
    <MyCalendar :value="value" @select="select" @cancel="close" />
  </template>
</DateField>
```

### Paste a date

Paste a date containing three numeric groups into any segment. ISO year-first values such as `2026-11-24` are recognized independently of visible locale order.

### Native form submission

Provide `name` directly or inherit it from `Field`. A complete value submits as an ISO calendar date.

```vue
<form @submit.prevent="submit">
  <DateField v-model="date" name="start" required />
  <button>Submit</button>
</form>
```

### Cancel changes

`value-change` fires before the model updates. Canceling restores segment text to the controlled value.

```vue
<DateField
  v-model="date"
  @value-change="(next, details) => {
    if (next && blockedDates.has(next.toString())) details.cancel()
  }"
/>
```

### Read-only and disabled

Read-only segments stay focusable for inspection but cannot change. Disabled segments leave the tab sequence and the hidden input is excluded from form submission.

```vue
<DateField v-model="date" read-only />
<DateField v-model="date" disabled />
```

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateValue \| undefined` | `undefined` | Complete date value. Partial segment text is internal until it forms a valid date. |
| `v-model:calendar-open` | `boolean` | `false` | Controls the optional calendar popup. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | generated | ID assigned to the first locale-ordered segment. |
| `name` | `string` | Field name | Native form field name. |
| `locale` | `string` | `"en-US"` | Segment order, separators, and accessible labels. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reading direction and horizontal arrow behavior. |
| `placeholder` | `CalendarDateValue` | today | Date context used while segments are empty or partial. |
| `minValue` | `CalendarDateValue` | — | Earliest valid complete date. |
| `maxValue` | `CalendarDateValue` | — | Latest valid complete date. |
| `isDateUnavailable` | `(date) => boolean` | — | Marks complete dates invalid by application rule. |
| `required` | `boolean` | `false` | Requires a complete date for native form validation. |
| `disabled` | `boolean` | `false` | Disables segments and native form participation. |
| `readOnly` | `boolean` | `false` | Keeps segments focusable but blocks changes. |
| `invalid` | `boolean` | `false` | Forces invalid styling and ARIA state. |
| `selectOnFocus` | `boolean` | `true` | Selects current segment text when focused. |
| `autoAdvance` | `boolean` | `true` | Moves focus after a segment reaches its maximum length. |
| `showCalendar` | `boolean` | `false` | Adds a trigger and positioned Calendar popup. |
| `calendarLabel` | `string` | `"Choose date"` | Trigger and popup accessible label. |
| `calendarSide` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred popup side with collision flipping. |
| `calendarAlign` | `"start" \| "center" \| "end"` | `"start"` | Popup alignment against Date Field. |
| `calendarSideOffset` | `number` | `6` | Trigger-to-popup gap in pixels. |
| `calendarTeleport` | `string \| false` | `"body"` | Teleport target; `false` keeps popup beside Date Field. |
| `ariaLabel` | `string` | `"Date"` | Root group label when no external label exists. |
| `ariaLabelledby` | `string` | Field label ID | External label relationship. |
| `ariaDescribedby` | `string` | Field description/error IDs | External description relationship. |
| `ui` | `DateFieldUi` | — | Classes for generated structural parts. |

Date Field currently handles calendar dates through day granularity. Time segments belong to the planned `TimeField` contract instead of overloading this component early.

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `CalendarDateValue \| undefined` | Fires after an accepted complete value or clear. |
| `value-change` | `(value, details)` | Fires before model changes. `details.cancel()` prevents the change. |
| `value-commit` | `(value, details)` | Fires after accepted input, keyboard, paste, blur, or clear commits. |
| `update:calendarOpen` | `boolean` | Fires after accepted calendar popup changes. |
| `calendar-open-change` | `(open, details)` | Fires before popup changes. `details.cancel()` prevents the change. |

Value `details.reason` can be `input`, `keyboard`, `paste`, `blur`, `clear`, or `calendar`. Calendar-open reasons include `trigger`, `select`, `escape`, and `outside-click`.

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `literal` | `value` | Replaces visible locale separator content without changing segment behavior. |
| `calendar-trigger` | `isOpen`, `open`, `close`, `toggle` | Replaces optional trigger content. Actions accept native event-first handlers. |
| `calendar` | `value`, `select`, `close` | Replaces built-in Calendar content while retaining popup behavior. |

### Methods

| Method | Description |
|--------|-------------|
| `focus()` | Focuses the first segment in locale order. |
| `clear(event?)` | Clears an accepted value and returns whether it changed. |
| `setValue(value, reason, event?)` | Requests an imperative value change through the normal cancelable event path. |
| `openCalendar(reasonOrEvent?, event?)` | Opens optional calendar through cancelable lifecycle. |
| `closeCalendar(reasonOrEvent?, event?)` | Closes optional calendar and restores trigger focus when appropriate. |
| `toggleCalendar(reasonOrEvent?, event?)` | Toggles optional calendar. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Date group root. |
| `segments` | Locale-ordered segment wrapper. |
| `segment` | Every generated day, month, and year input. |
| `literal` | Every generated separator. |
| `calendarTrigger` | Optional calendar button. |
| `calendarContent` | Positioned calendar popup. |
| `calendar` | Nested `CalendarUi` object for built-in Calendar parts. |
| `hiddenInput` | Visually hidden native form input. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-date-field` | `data-akaza-state="empty\|filled"`, `data-akaza-calendar-open`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-required`, `data-akaza-invalid`, `data-akaza-dirty`, `data-akaza-touched`, `data-akaza-filled`, `data-akaza-focused` |
| `segments` | `akaza-date-field-segments` | — |
| `segment` | `akaza-date-field-segment` | `data-akaza-segment="day\|month\|year"`, `data-akaza-state="empty\|filled"`, `data-akaza-placeholder`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `literal` | `akaza-date-field-literal` | — |
| `calendarTrigger` | `akaza-date-field-calendar-trigger` | `data-akaza-state="open\|closed"`, `data-akaza-disabled`, `aria-expanded`, `aria-controls` |
| `calendarContent` | `akaza-date-field-calendar-content` | `data-akaza-state="open"`, `data-akaza-side`, `data-akaza-align`, floating CSS variables, `--akaza-date-field-calendar-duration` |
| `hiddenInput` | `akaza-date-field-hidden-input` | — |

Plain `class` applies to the Date Field root. Use `ui.segment` for generated inputs and data variants for state styling.

### Keyboard

| Key | Behavior |
|-----|----------|
| Number keys | Edit the focused segment; full segments can auto-advance. |
| `ArrowUp` / `ArrowDown` | Increment or decrement the focused segment with wrapping. |
| `PageUp` / `PageDown` | Increment or decrement by 10. |
| `Home` / `End` | Set the focused segment to its minimum or maximum. |
| `ArrowLeft` / `ArrowRight` | Move focus between locale-ordered segments, direction-aware in RTL. |
| `Backspace` | Clears native text; from an empty segment, moves to the previous segment. |
| `Enter` / `Space` on calendar trigger | Opens or closes Calendar. |
| `Escape` in Calendar | Closes popup and restores trigger focus. |

Each editable part uses `role="spinbutton"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and a localized accessible label. Touch users can tap and edit any segment with the numeric keyboard.

Partial segment text remains internal. Date Field updates `v-model` only after day, month, and year are complete and valid.
