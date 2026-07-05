---
title: Select
description: Listbox select with keyboard navigation, typeahead, and form submission.
navigation:
  icon: i-lucide-list-filter
---

`Select` renders a trigger and a `role="listbox"` popup. It is unstyled, items-based, keyboard accessible, and can integrate with [Field](/components/field) for label, description, required, disabled, invalid, and form metadata.

## Usage

::component-preview
  :::examples-select-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Select } from "akaza-ui";
import { ref } from "vue";

const plan = ref("pro");
const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team", disabled: true },
];
</script>

<template>
  <Select v-model="plan" :options="options" placeholder="Choose plan" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | required | Options rendered in the listbox. |
| `valueKey` | `string` | — | Object key used as option value. Falls back to `value`, then `label`. |
| `labelKey` | `string` | `"label"` | Object key used as option label. |
| `descriptionKey` | `string` | `"description"` | Object key used as option description. |
| `disabledKey` | `string` | `"disabled"` | Object key used as option disabled state. |
| `placeholder` | `string` | `"Select option"` | Text shown when no value is selected. |
| `id` | `string` | field id | Trigger id. |
| `name` | `string` | field name | Form field name. Renders a hidden native select. |
| `required` | `boolean` | `false` | Required state. |
| `disabled` | `boolean` | `false` | Disables trigger and options. |
| `invalid` | `boolean` | `false` | Sets invalid attrs. |
| `loop` | `boolean` | `true` | Arrow navigation wraps. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Popup side. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Popup alignment. |
| `sideOffset` | `number` | `6` | Popup offset in px. |
| `ariaLabel` | `string` | — | Accessible label when no visible label exists. |
| `ariaLabelledby` | `string` | — | Accessible label id. |
| `ariaDescribedby` | `string` | field description/error | Accessible description ids. |
| `ui` | `SelectUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `(open, details)` | Fired before popup opens/closes. `details.cancel()` prevents the change. |
| `value-change` | `(value, details)` | Fired before selected value updates. `details.cancel()` prevents the update. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `isOpen`, `selectedOption`, `selectedValue`, `selectedLabel`, `placeholder`, `triggerProps`, `open`, `close`, `toggle` | Custom trigger content. |
| `value` | `option`, `value`, `label` | Custom selected value. |
| `option` | `option`, `value`, `label`, `description`, `isSelected`, `isHighlighted`, `isDisabled`, `select` | Custom option row. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root wrapper. |
| `nativeSelect` | Hidden native select used for form submission. |
| `trigger` | Trigger button. |
| `value` | Selected value wrapper. |
| `placeholder` | Placeholder text. |
| `icon` | Default chevron icon. |
| `content` | Listbox popup. |
| `option` | Option row. |
| `indicator` | Selected indicator inside an option. |
| `optionText` | Option text wrapper. |
| `optionLabel` | Option label. |
| `optionDescription` | Option description. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-select` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align`, `data-akaza-disabled`, `data-akaza-invalid`, `data-akaza-filled`, `data-akaza-focused` |
| `nativeSelect` | `akaza-select-native` | — |
| `trigger` | `akaza-select-trigger` | ARIA combobox attrs via trigger props |
| `value` | `akaza-select-value` | — |
| `placeholder` | `akaza-select-placeholder` | — |
| `icon` | `akaza-select-icon` | — |
| `content` | `akaza-select-content` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align` |
| `option` | `akaza-select-option` | `data-akaza-state`, `data-akaza-highlighted`, `data-akaza-disabled` |
| `indicator` | `akaza-select-indicator` | — |
| `optionText` | `akaza-select-option-text` | — |
| `optionLabel` | `akaza-select-option-label` | — |
| `optionDescription` | `akaza-select-option-description` | — |

Plain `class` applies to the root wrapper. Use `ui.trigger`, `ui.content`, and `ui.option` for internal parts.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Open select, or select highlighted option. |
| `ArrowDown` / `ArrowUp` | Open select and move highlight. |
| `Home` / `End` | Move highlight to first/last enabled option. |
| `Escape` | Close popup. |
| printable character | Typeahead to matching option label. |
