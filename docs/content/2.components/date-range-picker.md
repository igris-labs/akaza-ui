---
title: Date Range Picker
description: Segmented date-range entry and an accessible range Calendar in one collision-aware popup.
navigation:
  icon: i-lucide-calendar-search
  badge:
    label: NEW
    color: success
---

`DateRangePicker` composes Date Range Field and Calendar into one flat Vue component. Users can type either endpoint or select a range visually while constraints, form state, cancelable events, popup dismissal, and styling hooks stay synchronized.

Use it for booking, reporting, scheduling, and other workflows where both exact entry and calendar selection matter. Use [Date Range Field](/components/date-range-field) when a popup is unnecessary.

::callout{icon="i-lucide-package"}
Date values come from `@internationalized/date`. Install it beside Akaza UI when application code creates or transforms dates: `pnpm add akaza-ui @internationalized/date`.
::

## Anatomy

- **root**: Generated picker root containing field and trigger.
- **field**: Generated Date Range Field with all endpoint behavior.
- **`#start-literal`**: Replaces start endpoint locale separators.
- **`#separator`**: Replaces endpoint separator.
- **`#end-literal`**: Replaces end endpoint locale separators.
- **`#trigger`**: Calendar trigger content with open, close, and toggle actions.
- **content**: Teleported, positioned `role="dialog"` popup.
- **`#calendar`**: Replaces built-in Calendar while retaining popup infrastructure.
- **`#previous`**, **`#heading`**, **`#next`**, **`#weekday`**, **`#day`**, **`#footer`**: Customize built-in Calendar content.
- **`#close`**: Optional close-button content, rendered when slot or `closeLabel` exists.

Date Range Picker remains one public component. It does not require Root, Trigger, Content, Positioner, Field, and Calendar sub-components to assemble a standard picker.

## Usage

::component-preview
  :::examples-date-range-picker-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { CalendarDateRange } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "akaza-ui";
import { shallowRef } from "vue";

const range = shallowRef<CalendarDateRange>({});
</script>

<template>
  <DateRangePicker
    v-model="range"
    :placeholder="new CalendarDate(2026, 8, 1)"
  />
</template>
```
::

## Examples

### Multiple months

Render adjacent months and navigate by the visible page. Add `fixedWeeks` when the popup should keep a stable six-week grid height between months.

```vue
<DateRangePicker
  v-model="range"
  :number-of-months="2"
  paged-navigation
  fixed-weeks
/>
```

### Close behavior

Picker stays open after a complete selection by default so users can inspect or adjust both boundaries. Add `closeOnSelect` when a finished range should close immediately, or provide `closeLabel` for an explicit generated close button.

```vue
<DateRangePicker v-model="range" close-on-select />
<DateRangePicker v-model="range" close-label="Done" />
```

### Constraints and unavailable dates

Date Range Field and Calendar receive the same boundaries, unavailable-date rule, non-contiguous setting, maximum length, disabled state, and read-only state.

```vue
<DateRangePicker
  v-model="range"
  :min-value="new CalendarDate(2026, 8, 1)"
  :max-value="new CalendarDate(2026, 10, 31)"
  :maximum-days="14"
  :is-date-unavailable="(date) => closedDates.has(date.toString())"
/>
```

Use `isDateDisabled` for Calendar-only selection rules. Use `isDateUnavailable` when typed endpoint and full-range validity must enforce the same rule.

### Fixed endpoint

Fix the start or end while the other boundary remains editable through both segments and Calendar.

```vue
<DateRangePicker v-model="range" fixed-date="start" />
```

### Controlled popup

Use `v-model:open` and the cancelable `open-change` event when application state owns dismissal.

```vue
<DateRangePicker
  v-model="range"
  v-model:open="open"
  @open-change="(next, details) => {
    if (!next && hasUnsavedDraft) details.cancel()
  }"
/>
```

### Custom trigger and calendar parts

Slots change visuals without replacing ARIA, focus, positioning, collision handling, or selection behavior.

```vue
<DateRangePicker v-model="range">
  <template #trigger="{ isOpen }">
    <CalendarIcon :data-open="isOpen" />
  </template>
  <template #day="{ label, unavailable }">
    <span :class="{ 'line-through': unavailable }">{{ label }}</span>
  </template>
</DateRangePicker>
```

Use `#calendar` only when replacing the entire calendar is necessary. That slot receives current `value` and `close` while the picker retains popup behavior.

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `CalendarDateRange` | `{}` | Shared typed and calendar-selected range. |
| `v-model:open` | `boolean` | `false` | Popup open state. |
| `v-model:placeholder` | `CalendarDateValue` | selected endpoint or today | First visible calendar month. |

### Props

Date Range Picker accepts Date Range Field props `id`, `name`, `startName`, `endName`, `locale`, `dir`, `minValue`, `maxValue`, `isDateUnavailable`, `allowNonContiguousRanges`, `maximumDays`, `fixedDate`, `required`, `disabled`, `readOnly`, `invalid`, `selectOnFocus`, `autoAdvance`, endpoint labels, and ARIA relationships.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDateDisabled` | `(date) => boolean` | - | Calendar-only disabled-date rule. |
| `calendarLabel` | `string` | `"Choose date range"` | Trigger and popup accessible label. |
| `closeLabel` | `string` | - | Renders an explicit close button with this label. |
| `closeOnSelect` | `boolean` | `false` | Closes after both endpoints are selected. |
| `weekStartsOn` | `"sun" \| "mon" \| ...` | locale default | Explicit first weekday. |
| `weekdayFormat` | `"narrow" \| "short" \| "long"` | `"narrow"` | Visible weekday format. |
| `fixedWeeks` | `boolean` | `false` | Renders six weeks per month for stable popup height. |
| `numberOfMonths` | `number` | `1` | Adjacent month grids. |
| `pagedNavigation` | `boolean` | `false` | Moves by `numberOfMonths`. |
| `disableDaysOutsideCurrentView` | `boolean` | `false` | Blocks selecting outside days. |
| `nextPage` | `(placeholder) => CalendarDateValue` | add month(s) | Custom next page calculation. |
| `prevPage` | `(placeholder) => CalendarDateValue` | subtract month(s) | Custom previous page calculation. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred popup side with collision flipping. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Popup alignment. |
| `sideOffset` | `number` | `6` | Trigger-to-popup gap in pixels. |
| `teleport` | `string \| false` | `"body"` | Teleport target; `false` keeps popup beside root. |
| `ui` | `DateRangePickerUi` | - | Classes and nested field/calendar UI maps. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `CalendarDateRange` | Fires after accepted typed or calendar changes. |
| `value-change` | `(range, details)` | Fires before value changes. `details.cancel()` prevents update. |
| `value-commit` | `(range, details)` | Fires after accepted field or calendar commits. |
| `update:open` | `boolean` | Fires after accepted popup state changes. |
| `open-change` | `(open, details)` | Fires before popup changes. Cancelable. |
| `update:placeholder` | `CalendarDateValue` | Fires after accepted visible-month changes. |
| `placeholder-change` | `(date, details)` | Fires before visible-month changes. Cancelable. |

Open reasons include `trigger`, `select`, `escape`, `outside-click`, and `programmatic`. Value reasons match Date Range Field plus `calendar`.

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `start-literal` | `value` | Start endpoint locale separator. |
| `separator` | - | Endpoint separator. |
| `end-literal` | `value` | End endpoint locale separator. |
| `trigger` | `isOpen`, `open`, `close`, `toggle` | Calendar trigger content. Actions are native event-handler safe. |
| `calendar` | `value`, `close` | Replaces built-in Calendar. |
| `previous` | `disabled` | Built-in Calendar previous control content. |
| `heading` | `label`, `months` | Built-in Calendar heading. |
| `next` | `disabled` | Built-in Calendar next control content. |
| `weekday` | `date`, `label` | Built-in weekday content. |
| `day` | Complete `CalendarDay` state | Built-in day button content. |
| `footer` | `value`, `placeholder` | Optional built-in Calendar footer. |
| `close` | `close` | Explicit close-button content. |

### Methods

| Method | Description |
|--------|-------------|
| `open(reasonOrEvent?, event?)` | Opens through cancelable lifecycle. |
| `close(reasonOrEvent?, event?)` | Closes and restores trigger focus when appropriate. |
| `toggle(reasonOrEvent?, event?)` | Toggles popup. |
| `focusStart()` | Focuses first start segment. |
| `focusEnd()` | Focuses first end segment. |
| `clear(event?)` | Clears range through cancelable value flow. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Picker root. |
| `field` | Nested `DateRangeFieldUi`. |
| `trigger` | Calendar popup trigger. |
| `content` | Positioned popup dialog. |
| `calendar` | Nested `CalendarUi`. |
| `close` | Optional close button. |

### Styling Hooks

| UI key | CSS class | Data attrs / variables |
|--------|-----------|------------------------|
| `root` | `akaza-date-range-picker` | `data-akaza-state="open\|closed"`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `trigger` | `akaza-date-range-picker-trigger` | `data-akaza-state="open\|closed"`, `data-akaza-disabled`, `aria-expanded`, `aria-controls` |
| `content` | `akaza-date-range-picker-content` | `data-akaza-state="open"`, `data-akaza-side`, `data-akaza-align`, floating size/origin variables, `--akaza-date-range-picker-duration` |
| `close` | `akaza-date-range-picker-close` | - |

Nested field and calendar parts retain their own exact semantic classes and data attributes. Plain `class` applies to picker root. Use `ui.content` for teleported popup styling.

### Keyboard and focus

Field segments follow Date Field's spinbutton keyboard pattern. Calendar uses roving day focus, arrow keys, week boundaries, month/year paging, and `Enter`/`Space` selection. `Escape` closes only the top dismissable layer and restores trigger focus. Outside pointer interaction closes the popup; touch activation uses native button behavior.
