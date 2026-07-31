---
title: Listbox
description: Standalone selectable list with single, multiple, filtered, and virtualized modes.
navigation:
  icon: i-lucide-list-checks
  badge:
    label: NEW
    color: success
---

`Listbox` is an unstyled, always-visible selection primitive. It supports single or multiple values, disabled and grouped rows, typeahead, range selection, filtering, object values, native form submission, and optional virtualization.

Use it when the list itself should remain visible. Use [Select](/components/select) when selection belongs in a popup, or [Combobox](/components/combobox) when users type into the selecting control.

## Anatomy

- **`#option`**: Custom content for every selectable row.
- **`#group-label`**: Custom content for rows with `type: "label"`.
- **`#empty`**: Content shown when filtering leaves no selectable options.

The component owns `role="listbox"`, option roles, selection/highlight state, hidden form inputs, and keyboard behavior. Style those generated parts with the matching `ui` keys.

## Usage

::component-preview
  :::examples-listbox-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Listbox } from "akaza-ui";
import { ref } from "vue";

const framework = ref("vue");
const options = [
  { value: "vue", label: "Vue" },
  { value: "nuxt", label: "Nuxt" },
  { value: "vite", label: "Vite", disabled: true },
];
</script>

<template>
  <Listbox v-model="framework" :options="options" aria-label="Framework" />
</template>
```
::

## Examples

### Multiple selection

Set `multiple` and bind an array. `Ctrl+A` or `Cmd+A` selects every enabled visible option; `Shift+Arrow` extends a keyboard range.

```vue
<template>
  <Listbox
    v-model="permissions"
    multiple
    :options="[
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'deploy', label: 'Deploy' },
    ]"
    aria-label="Permissions"
  />
</template>
```

### Group labels and separators

Rows with `type: "label"` or `type: "separator"` remain non-selectable and are skipped by keyboard navigation.

```vue
<template>
  <Listbox
    v-model="tool"
    :options="[
      { type: 'label', label: 'Frameworks' },
      { value: 'vue', label: 'Vue' },
      { value: 'nuxt', label: 'Nuxt' },
      { type: 'separator' },
      { type: 'label', label: 'Tooling' },
      { value: 'vite', label: 'Vite' },
    ]"
    aria-label="Tool"
  />
</template>
```

### Filtering

Set `filterable` to render a search input above the list. Bind `v-model:search` for external state or use `filter` for custom matching.

```vue
<script setup lang="ts">
import { ref } from "vue";

const search = ref("");
</script>

<template>
  <Listbox
    v-model="framework"
    v-model:search="search"
    filterable
    :options="options"
    filter-placeholder="Filter frameworks"
    aria-label="Framework"
  />
</template>
```

### Large data sets

Set `virtualize` to render a bounded window with VueUse. Provide a stable row height; group and separator rows should use the same height in virtual mode.

```vue
<template>
  <Listbox
    v-model="result"
    virtualize
    :virtual-height="240"
    :virtual-item-height="40"
    :overscan="6"
    :options="results"
    aria-label="Search results"
  />
</template>
```

### Object values

Use `by` to compare objects and `serializeValue` to control submitted form values. The model keeps the original object.

```vue
<template>
  <Listbox
    v-model="assignee"
    name="assignee"
    by="id"
    :serialize-value="user => String(user.id)"
    :options="users.map(user => ({ value: user, label: user.name }))"
    aria-label="Assignee"
  />
</template>
```

### Field integration

Inside [Field](/components/field), Listbox inherits `id`, `name`, required/disabled/invalid state, and description/error IDs. Required invalid state appears after blur or an invalid submit, not on initial render.

```vue
<template>
  <Field label="Environment" name="environment" required>
    <Listbox v-model="environment" :options="environments" />
  </Field>
</template>
```

### Cancel a change

Change events fire before state updates. Call `details.cancel()` to keep the current value, search, or highlight.

```vue
<template>
  <Listbox
    v-model="role"
    :options="roles"
    @value-change="(value, details) => value === 'owner' && details.cancel()"
  />
</template>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `ListboxValue \| ListboxValue[]` | `""` | Selected value or values. |
| `v-model:search` | `string` | `""` | Filter input value. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ListboxOption[]` | required | Rows rendered by the listbox. |
| `valueKey` | `string` | - | Object key used as value. |
| `labelKey` | `string` | `"label"` | Object key used as label. |
| `descriptionKey` | `string` | `"description"` | Object key used as description. |
| `disabledKey` | `string` | `"disabled"` | Object key used as disabled state. |
| `multiple` | `boolean` | `false` | Enables multiple selection. |
| `nullableValue` | `string` | `""` | Empty value used by single selection and `clear()`. |
| `by` | `string \| (a, b) => boolean` | `Object.is` | Value comparator, including object identity by key. |
| `serializeValue` | `(value) => string` | JSON/string conversion | Serializes native form values and keys. |
| `id` | `string` | field/generated id | Hidden control id. |
| `name` | `string` | field name | Native form field name. |
| `required` | `boolean` | `false` | Requires at least one selected option. |
| `disabled` | `boolean` | `false` | Disables focus and selection. |
| `readOnly` | `boolean` | `false` | Allows navigation without value changes. |
| `invalid` | `boolean` | `false` | Forces invalid styling and ARIA state. |
| `autoFocus` | `boolean` | `false` | Focuses the filter when present, otherwise the listbox, after mount. |
| `loop` | `boolean` | `true` | Wraps keyboard navigation. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | ARIA orientation and arrow-key axis. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Horizontal keyboard direction. |
| `selectionBehavior` | `"toggle" \| "replace"` | `"toggle"` | Multiple-selection behavior without modifier keys. |
| `filterable` | `boolean` | `false` | Renders the filter input. |
| `filter` | `(option, search) => boolean` | label contains search | Custom option filter. |
| `filterPlaceholder` | `string` | `"Filter options"` | Filter input placeholder. |
| `emptyLabel` | `string` | `"No options found."` | Default empty content. |
| `highlightOnHover` | `boolean` | `true` | Pointer hover changes the active option. |
| `virtualize` | `boolean` | `false` | Enables virtual rendering. |
| `virtualItemHeight` | `number` | `40` | Virtual row height in px. |
| `virtualHeight` | `number` | `240` | Virtual viewport height in px. |
| `overscan` | `number` | `5` | Extra virtual rows rendered outside the viewport. |
| `ariaLabel` | `string` | - | Accessible label when no visible label exists. |
| `ariaLabelledby` | `string` | - | Accessible label element id. |
| `ariaDescribedby` | `string` | field IDs | Accessible description/error ids. |
| `ui` | `ListboxUi` | - | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fires before selection changes. Cancelable. |
| `search-change` | `(search, details)` | Fires before filter text changes. Cancelable. |
| `highlight-change` | `(option, details)` | Fires before the active option changes. Cancelable. |
| `entry-focus` | `(option, details)` | Fires when focus enters the listbox and before initial highlight. Cancelable. |
| `leave` | `(option, details)` | Fires when the pointer leaves the listbox. Cancelable. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `option` or option `slot` | `option`, `value`, `label`, `description`, `isSelected`, `isHighlighted`, `isDisabled`, `select` | Selectable row content. |
| `group-label` | `option`, `label` | Group label content. |
| `empty` | - | Empty filtered state. |

### Exposed Methods

| Method | Description |
|--------|-------------|
| `focus()` | Focuses the listbox. |
| `clear(event?)` | Clears selection through the cancelable value-change path. |

### Option Shape

| Key | Type | Description |
|-----|------|-------------|
| `type` | `"item" \| "label" \| "separator"` | Row type. Omit for selectable items. |
| `value` | `string \| number \| object` | Selected model value. |
| `label` | `string` | Visible label and default filter/typeahead text. |
| `description` | `string` | Optional supporting text. |
| `disabled` | `boolean` | Disables the row. |
| `slot` | `string` | Named slot used instead of `#option`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root wrapper. |
| `hiddenInput` | Native form input(s). |
| `filter` | Optional search input. |
| `content` | Focusable listbox. |
| `virtualWrapper` | Virtual rows wrapper. |
| `empty` | Empty state. |
| `groupLabel` | Group label row. |
| `separator` | Separator row. |
| `option` | Selectable option row. |
| `indicator` | Default selected indicator. |
| `optionText` | Label/description wrapper. |
| `optionLabel` | Option label. |
| `optionDescription` | Option description. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-listbox` | `data-akaza-state`, `data-akaza-orientation`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-filled` |
| `hiddenInput` | `akaza-listbox-hidden-input` | native validity attrs |
| `filter` | `akaza-listbox-filter` | native disabled/read-only attrs |
| `content` | `akaza-listbox-content` | listbox ARIA attrs, virtual height style |
| `virtualWrapper` | `akaza-listbox-virtual-wrapper` | virtual transform/height style |
| `empty` | `akaza-listbox-empty` | - |
| `groupLabel` | `akaza-listbox-group-label` | `role="presentation"` |
| `separator` | `akaza-listbox-separator` | `role="separator"` |
| `option` | `akaza-listbox-option` | `data-akaza-state`, `data-akaza-highlighted`, `data-akaza-disabled`, `aria-selected`, `aria-disabled` |
| `indicator` | `akaza-listbox-indicator` | - |
| `optionText` | `akaza-listbox-option-text` | - |
| `optionLabel` | `akaza-listbox-option-label` | - |
| `optionDescription` | `akaza-listbox-option-description` | - |

Plain `class` applies to the root wrapper. Use `ui.content` and `ui.option` for the list and rows.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowDown` / `ArrowUp` | Move through a vertical list. |
| `ArrowRight` / `ArrowLeft` | Move through a horizontal list, respecting `dir`. |
| `Home` / `End` | Move to first/last enabled option. |
| `Enter` / `Space` | Select or toggle the active option. |
| `Shift` + Arrow | Extend a multiple-selection range. |
| `Ctrl+A` / `Cmd+A` | Select all enabled visible options in multiple mode. |
| printable characters | Typeahead to a matching label. |
| filter `Escape` | Clear non-empty filter text. |
