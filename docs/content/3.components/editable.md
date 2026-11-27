---
title: Editable
description: Inline text editing with preview, draft, submit, cancel, and native form behavior.
navigation:
  icon: i-lucide-square-pen
---

`Editable` switches between a preview and a text input. It keeps draft and committed values separate and supports native forms.

Use Editable for in-place text editing. Use [Input](/components/input) for a control that stays editable.

## Anatomy

- **`#preview`**: Replaces preview content. Receives the committed value, empty state, and `edit` action.
- **`#edit`**: Content inside the generated edit button.
- **`#submit`**: Content inside the generated submit button.
- **`#cancel`**: Content inside the generated cancel button.
- **`#state`**: Optional renderless state output with committed value, draft, edit state, and actions.

The component generates preview/input and action controls so their keyboard and form behavior stays connected. Style them with the matching `ui` keys.

## Usage

::component-preview
  :::examples-editable-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Editable } from "akaza-ui";
import { ref } from "vue";

const title = ref("Quarterly planning notes");
</script>

<template>
  <Editable
    v-model="title"
    activation-mode="click"
    submit-mode="none"
    select-on-focus
  />
</template>
```
::

## Examples

### Activation mode

Choose when the preview enters edit mode. `focus` is keyboard-friendly and is the default. `dblclick` avoids accidental pointer edits, while `none` leaves activation to the generated edit button or exposed `edit()` method.

```vue
<template>
  <Editable
    v-model="title"
    activation-mode="dblclick"
  />
</template>
```

### Submit and cancel

`submitMode` controls automatic submission. Escape always cancels. In multiline mode, `Ctrl+Enter` or `Cmd+Enter` submits when Enter submission is enabled.

Unchanged values still emit cancelable `value-change` and `submit` events. Canceling either event keeps the draft open. Keys used by an IME, including legacy key code 229, do not submit or cancel the draft. Tab follows native focus order; moving to an action inside the editor does not count as leaving the editor.

`draft-change` is synchronous and cancelable: rejection restores the last accepted draft in the input. Canceling `cancel` keeps that draft and the editing session open. Event details preserve the original native event and Akaza reason, including a custom reason passed to `submit(event, reason)`.

Sessions use the SDK inline-edit behavior internally. Akaza retains its flat Vue API, submission-event policy, native focus/selection, and committed-value form control; no SDK parts or provider are required.

```vue
<template>
  <Editable
    v-model="summary"
    multiline
    submit-mode="both"
  />
</template>
```

### Explicit submission

Set `submitMode="none"` when only the generated submit button or exposed method should commit the draft.

```vue
<template>
  <Editable
    v-model="slug"
    activation-mode="none"
    submit-mode="none"
  />
</template>
```

### Controlled updates

`v-model` is the only committed value. If a parent refuses `update:modelValue`, an accepted submit still closes editing, but the preview and native form value stay at the parent's value. The next edit starts from that value, not the refused draft. An external model update during editing does not overwrite the active draft; cancel restores the latest parent value.

This differs from `details.cancel()` on `value-change` or `submit`, which rejects submission and keeps editing open.

### Field and form integration

Inside [Field](/components/field), `Editable` inherits id, name, required, disabled, and description metadata. Its hidden native control submits only the committed value.

An empty required draft cannot finish editing. Disabling or making an open editor read-only blocks submission without discarding its draft.

```vue
<template>
  <Field
    label="Release title"
    name="title"
    required
  >
    <Editable v-model="title" />
  </Field>
</template>
```

### Custom preview

The preview slot exposes an explicit action. Keep interaction on the generated preview button; only replace its content.

```vue
<template>
  <Editable v-model="title">
    <template #preview="{ value, isEmpty }">
      <strong>{{ isEmpty ? "Add a title" : value }}</strong>
    </template>
  </Editable>
</template>
```

### Native Form Reset

A native form reset restores the initial model and clears interaction state. Calling `preventDefault()` on the reset event preserves the current value. Reset updates `v-model` without emitting `value-change`.

## API Reference

### Model

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model` | `string \| null` | `""` | Committed value. Draft input does not update it until submission. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | field/generated id | Visible control id. |
| `name` | `string` | field name | Native form field name. |
| `placeholder` | `string \| { preview?: string; edit?: string }` | `"Enter text..."` | Shared or mode-specific placeholder. |
| `activationMode` | `"focus" \| "click" \| "dblclick" \| "none"` | `"focus"` | Preview event that starts editing. |
| `submitMode` | `"blur" \| "enter" \| "both" \| "none"` | `"blur"` | Events that submit the draft. |
| `startWithEditMode` | `boolean` | `false` | Starts with the input visible and focused. |
| `selectOnFocus` | `boolean` | `false` | Selects input text when editing starts. |
| `autoResize` | `boolean` | `false` | Uses native `field-sizing: content`. |
| `multiline` | `boolean` | `false` | Renders a textarea instead of an input. |
| `rows` | `number` | `2` | Initial textarea rows. |
| `maxLength` | `number` | — | Native maximum draft length. |
| `required` | `boolean` | `false` | Requires a committed non-empty value. |
| `disabled` | `boolean` | `false` | Disables all controls and form submission. |
| `readOnly` | `boolean` | `false` | Keeps preview focusable but blocks editing. |
| `invalid` | `boolean` | `false` | Controlled invalid state. |
| `dir` | `"ltr" \| "rtl"` | inherited | Text direction. |
| `ariaLabel` | `string` | — | Accessible label when no Field label exists. |
| `ariaDescribedby` | `string` | field ids | Accessible description ids. |
| `ui` | `EditableUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value` | Fired after a draft is accepted. |
| `value-change` | `(value, details)` | Fired before commit. `details.cancel()` prevents it. |
| `draft-change` | `(value, details)` | Fired before draft input updates. Cancelable. |
| `state-change` | `(state, details)` | Fired for `edit`, `submit`, and `cancel`. |
| `submit` | `(value, details)` | Fired before submission completes. Cancelable. |
| `cancel` | `(committedValue, details)` | Fired before draft cancellation. Cancelable. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `preview` | `value`, `isEmpty`, `edit` | Preview button content. |
| `edit` | — | Edit button content. |
| `submit` | — | Submit button content. |
| `cancel` | — | Cancel button content. |
| `state` | `value`, `draft`, `isEditing`, `isEmpty`, `edit`, `submit`, `cancel` | Optional state-driven custom UI. |

### Methods

| Method | Description |
|--------|-------------|
| `edit(event?)` | Enters edit mode and focuses the input. |
| `submit(event?, reason?)` | Validates and commits the draft. |
| `cancel(event?)` | Restores the committed value and exits edit mode. |
| `focus()` | Focuses the visible edit input. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root wrapper. |
| `hiddenInput` | Native form/validity input. |
| `area` | Preview/input area. |
| `preview` | Generated preview button. |
| `input` | Generated input or textarea. |
| `actions` | Action wrapper. |
| `edit` | Edit button. |
| `submit` | Submit button. |
| `cancel` | Cancel button. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-editable` | `data-akaza-state="preview|editing"`, `data-akaza-disabled`, `data-akaza-readonly`, `data-akaza-invalid`, `data-akaza-focused`, `data-akaza-filled` |
| `hiddenInput` | `akaza-editable-hidden-input` | native validity attrs |
| `area` | `akaza-editable-area` | `data-akaza-state` |
| `preview` | `akaza-editable-preview` | `data-akaza-state="preview"`, `data-akaza-empty` |
| `input` | `akaza-editable-input` | `data-akaza-state="editing"` |
| `actions` | `akaza-editable-actions` | `data-akaza-state` |
| `edit` | `akaza-editable-edit` | native disabled attr |
| `submit` | `akaza-editable-submit` | native disabled attr |
| `cancel` | `akaza-editable-cancel` | native disabled attr |

Plain `class` applies to the root wrapper. Use `ui.input` for the editable control.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` | Submits when `submitMode` includes Enter. |
| `Ctrl+Enter` / `Cmd+Enter` | Submits a multiline value. |
| `Escape` | Cancels the draft and returns to preview mode. |
| `Tab` | Uses native focus order; blur may submit depending on `submitMode`. |
