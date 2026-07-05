---
title: Field
description: Label, description, and error wiring for form controls.
navigation:
  icon: i-lucide-text-cursor-input
---

`Field` links a label, description, error message, and a control. Akaza inputs inside it inherit accessibility props and report focused, filled, dirty, touched, valid, and invalid state attributes.

Use it around one form control when you want labels, help text, errors, and native validity to stay wired without manual ids.

## Anatomy

- **`#default`**: Control slot. Receives state and `controlProps` for custom/native controls.
- **`#label`**: Custom label content.
- **`#description`**: Custom help text included in `aria-describedby`.
- **`#error`**: Custom validation or server error content included in `aria-describedby`.

Akaza form controls consume `Field` context automatically. For native or custom controls, use the default slot's `controlProps`.

## Usage

::component-preview
  :::examples-field-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Field, Input } from "akaza-ui";
</script>

<template>
  <Field label="Email" description="Used for notifications.">
    <Input type="email" />
  </Field>
</template>
```
::

## Examples

### Required field

Use `required` on `Field` so the child Akaza input inherits native required state.

```vue
<template>
  <Field
    name="username"
    label="Username"
    description="Used in your public profile."
    required
  >
    <Input />
  </Field>
</template>
```

### Error message

Pass `error` when you want the field to show a controlled validation message.

```vue
<template>
  <Field
    name="email"
    label="Email"
    error="Enter a valid email address."
  >
    <Input type="email" invalid />
  </Field>
</template>
```

### Native validation errors

Use `error-match` to show the browser validation message only for a matching validity state.

```vue
<template>
  <Field
    name="email"
    label="Email"
    error-match="typeMismatch"
  >
    <Input type="email" required />
  </Field>
</template>
```

### Custom control

Pass `controlProps` to native controls so ids, names, required state, disabled state, invalid state, and descriptions stay linked.

```vue
<template>
  <Field v-slot="{ controlProps }" name="bio" label="Bio">
    <textarea v-bind="controlProps" />
  </Field>
</template>
```

### Scoped state

Use scoped state to render custom status text or styling beside the control.

```vue
<template>
  <Field v-slot="{ invalid, focused }" label="Project" name="project">
    <Input />
    <span>{{ focused ? "Editing" : invalid ? "Needs attention" : "Ready" }}</span>
  </Field>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string` | `"div"` | Root element tag. |
| `id` | `string` | generated | Control id. |
| `name` | `string` | — | Field name provided to child inputs. |
| `label` | `string` | — | Visible label. |
| `description` | `string` | — | Help text. |
| `error` | `string` | — | Error text. Also marks field invalid. |
| `errorMatch` | `boolean \| FieldErrorMatch` | — | Controls when native validation errors are shown. |
| `required` | `boolean` | `false` | Required state provided to child inputs. |
| `disabled` | `boolean` | `false` | Disabled state provided to child inputs. |
| `invalid` | `boolean` | `false` | Invalid state. |
| `dirty` | `boolean` | input state | Overrides dirty state. |
| `touched` | `boolean` | input state | Overrides touched state. |
| `filled` | `boolean` | input state | Overrides filled state. |
| `focused` | `boolean` | input state | Overrides focused state. |
| `ui` | `FieldUi` | — | Classes for root, label, control, description, error. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `default` | `id`, `fieldName`, `required`, `disabled`, `invalid`, `valid`, `dirty`, `touched`, `filled`, `focused`, `describedBy`, `controlProps` | Control slot. |
| `label` | — | Custom label content. |
| `description` | — | Custom description content. |
| `error` | — | Custom error content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The field wrapper. |
| `label` | The label element. |
| `required` | The required marker inside the label. |
| `control` | The control wrapper around the default slot. |
| `description` | The description element. |
| `error` | The error element. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-field` | granular field attrs |
| `label` | `akaza-field-label` | granular field attrs |
| `required` | `akaza-field-required` | — |
| `control` | `akaza-field-control` | granular field attrs |
| `description` | `akaza-field-description` | granular field attrs |
| `error` | `akaza-field-error` | granular field attrs |

Granular field attrs are `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-disabled`, plus matching `data-akaza-*` attributes.
