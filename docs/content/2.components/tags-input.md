---
title: Tags Input
description: Tokenized text input with keyboard editing, paste handling, validation, and form submission.
navigation:
  icon: i-lucide-tags
  badge:
    label: NEW
    color: success
---

`TagsInput` is an unstyled token editor. It converts text into removable values, supports keyboard navigation and batch paste, validates duplicates and limits, accepts object values, and submits every tag through native forms.

Use it for labels, recipients, keywords, or other short repeated values. Use [Combobox](/components/combobox) when values must come from a suggestion list.

## Anatomy

- **`#tag`**: Replaces an entire tag, with value, label, highlight state, and `remove` action.
- **`#delete`**: Content inside each default remove button.
- **`#input`**: Replaces the text input. Bind `inputProps` to preserve behavior and accessibility.
- **`#clear`**: Content inside the optional clear-all button.

The component generates tag wrappers, remove controls, an editable input, and hidden native form controls. Style those generated parts with the matching `ui` keys.

## Usage

::component-preview
  :::examples-tags-input-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { TagsInput } from "akaza-ui";
import { ref } from "vue";

const tags = ref(["Vue", "TypeScript"]);
</script>

<template>
  <TagsInput v-model="tags" placeholder="Add technology" clearable />
</template>
```
::

## Examples

### Delimiters and blur

Enter always adds the current text. A one-character string `delimiter` also adds on that key. Set `addOnBlur` or `addOnTab` for data-entry workflows that need those commit points.

```vue
<template>
  <TagsInput
    v-model="keywords"
    delimiter=","
    add-on-blur
    add-on-tab
    placeholder="Add keyword"
  />
</template>
```

### Batch paste

Set `addOnPaste` to split clipboard text using `delimiter`. Duplicate, invalid, and over-limit values emit `invalid-value`; accepted values commit in one model update.

```vue
<template>
  <TagsInput
    v-model="recipients"
    add-on-paste
    :delimiter="/[;,]/"
    placeholder="Paste email addresses"
  />
</template>
```

### Validation and limits

`validate` receives the converted value. `max` makes the input read-only after the limit and reports additional values with reason `max`.

```vue
<script setup lang="ts">
const isEmail = (value: unknown) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
</script>

<template>
  <TagsInput
    v-model="recipients"
    :validate="isEmail"
    :max="5"
    @invalid-value="(value, details) => showError(value, details.reason)"
  />
</template>
```

### Number and object values

Use `convertValue` to produce non-string models. Pair object values with `displayValue`, `serializeValue`, and `isEqual` so rendering, forms, and duplicate checks use stable identities.

```vue
<template>
  <TagsInput
    v-model="users"
    name="user"
    :convert-value="name => ({ id: findId(name), name })"
    :display-value="user => user.name"
    :serialize-value="user => String(user.id)"
    :is-equal="(a, b) => a.id === b.id"
  />
</template>
```

### Custom tag and input

Use `#tag` for the complete token or `#delete` for only the remove icon. A custom `#input` must bind `inputProps`.

```vue
<template>
  <TagsInput v-model="tags">
    <template #tag="{ label, remove, isHighlighted }">
      <span :data-active="isHighlighted || undefined">
        {{ label }}
        <button type="button" @click="remove">Remove</button>
      </span>
    </template>
    <template #input="{ inputProps }">
      <input v-bind="inputProps" aria-label="Add another tag">
    </template>
  </TagsInput>
</template>
```

### Field integration

Inside [Field](/components/field), TagsInput inherits `id`, `name`, required/disabled/invalid state, and description/error IDs. A required field is invalid only after interaction or invalid submit.

```vue
<template>
  <Field label="Project labels" name="labels" required>
    <TagsInput v-model="labels" placeholder="Add label" />
  </Field>
</template>
```

### Cancel changes

`add`, `remove`, `value-change`, and `input-change` are cancelable. Cancel the earliest relevant event to stop the operation.

```vue
<template>
  <TagsInput
    v-model="tags"
    @remove="(value, details) => value === 'required' && details.cancel()"
  />
</template>
```

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `TagsInputValue[]` | `[]` | Accepted tag values. |
| `v-model:input` | `string` | `""` | Current uncommitted text. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displayValue` | `(value) => string` | string/JSON | Visible and accessible tag label. |
| `convertValue` | `(text) => value` | identity string | Converts input text before validation/addition. |
| `serializeValue` | `(value) => string` | string/JSON | Serializes native form values and keys. |
| `isEqual` | `(a, b) => boolean` | `Object.is` | Duplicate and equality comparison. |
| `validate` | `(value) => boolean` | accepts all | Validates converted values. |
| `delimiter` | `string \| RegExp` | `","` | Add key and paste splitting rule. |
| `addOnBlur` | `boolean` | `false` | Adds non-empty input on blur. |
| `addOnPaste` | `boolean` | `false` | Adds multiple delimited clipboard values. |
| `addOnTab` | `boolean` | `false` | Adds non-empty input instead of moving focus. |
| `duplicate` | `boolean` | `false` | Allows equal values more than once. |
| `max` | `number` | `0` | Maximum count; zero means unlimited. |
| `trim` | `boolean` | `true` | Trims input and pasted segments. |
| `clearable` | `boolean` | `false` | Renders a clear-all button when values exist. |
| `placeholder` | `string` | - | Editable input placeholder. |
| `maxLength` | `number` | - | Native character limit for uncommitted input text. |
| `autoFocus` | `boolean` | `false` | Focuses the editable input after mount. |
| `id` | `string` | field/generated id | Editable input id. |
| `name` | `string` | field name | Native form field name repeated per tag. |
| `required` | `boolean` | `false` | Requires at least one tag. |
| `disabled` | `boolean` | `false` | Disables editing, controls, and form submission. |
| `readOnly` | `boolean` | `false` | Keeps values focusable but prevents changes. |
| `invalid` | `boolean` | `false` | Forces invalid styling and ARIA state. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Tag direction and Arrow-key behavior. |
| `ariaLabel` | `string` | `"Tags input"` | Accessible group/input label. |
| `ariaLabelledby` | `string` | - | Accessible label element id. |
| `ariaDescribedby` | `string` | field IDs | Accessible description/error ids. |
| `ui` | `TagsInputUi` | - | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(values, details)` | Fires before the values array updates. Cancelable. |
| `input-change` | `(text, details)` | Fires before editable text updates. Cancelable. |
| `add` | `(value, details)` | Fires before an accepted value is added. Cancelable. |
| `remove` | `(value, details)` | Fires before a value is removed. Cancelable. |
| `invalid-value` | `(value, details)` | Reports `empty`, `convert`, `invalid`, `duplicate`, or `max` reasons. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `tag` | `value`, `label`, `index`, `isHighlighted`, `remove` | Complete custom tag. |
| `delete` | `value`, `index` | Default remove button content. |
| `input` | `value`, `inputProps`, `add` | Custom editable input. Bind `inputProps`. |
| `clear` | - | Clear-all button content. |

### Exposed Methods

| Method | Description |
|--------|-------------|
| `add(value?, event?)` | Converts and adds text through all validation/event paths. |
| `clear(event?)` | Removes every tag through `value-change`. |
| `focus()` | Focuses the editable input. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Token editor wrapper. |
| `hiddenInput` | Native form/validity input(s). |
| `item` | Each default tag wrapper. |
| `itemText` | Default tag text. |
| `delete` | Default per-tag remove button. |
| `input` | Editable text input. |
| `clear` | Optional clear-all button. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-tags-input` | `data-akaza-state`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-filled`, `data-akaza-max` |
| `hiddenInput` | `akaza-tags-input-hidden-input` | native validity attrs |
| `item` | `akaza-tags-input-item` | `data-akaza-state="active"`, `data-akaza-highlighted`, `data-akaza-disabled` |
| `itemText` | `akaza-tags-input-item-text` | - |
| `delete` | `akaza-tags-input-delete` | native disabled/ARIA label attrs |
| `input` | `akaza-tags-input-input` | `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid` |
| `clear` | `akaza-tags-input-clear` | native disabled/ARIA label attrs |

Root `data-akaza-state` is `empty` or `filled`. Plain `class` applies to the root editor. Use `ui.item`, `ui.input`, and `ui.delete` for internal parts.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / delimiter key | Add current text. |
| `Tab` | Add when `addOnTab`; otherwise move focus normally. |
| input `Backspace` | Focus last tag when input is empty. |
| input boundary Arrow | Focus last tag from the start edge, respecting `dir`. |
| tag `ArrowLeft` / `ArrowRight` | Move between tags/input, respecting `dir`. |
| tag `Home` / `End` | Focus first/last tag. |
| tag `Backspace` / `Delete` | Remove focused tag and retain logical focus. |
| tag `Escape` | Return focus to the editable input. |
