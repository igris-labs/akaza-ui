---
title: Input
description: Native text input with Field integration and invalid state attributes.
navigation:
  icon: i-lucide-text-cursor-input
---

`Input` is an unstyled native input. Use it alone, or place it inside [Field](/components/field) to inherit `id`, `name`, `required`, `disabled`, invalid state, native validation messages, and `aria-describedby`.

## Usage

::component-preview
  :::examples-input-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Input } from "akaza-ui";
</script>

<template>
  <Input placeholder="Project name" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Input id. Inherited from `Field` when omitted. |
| `name` | `string` | — | Form field name. Inherited from `Field` when omitted. |
| `type` | `InputType` | `"text"` | Native input type for text-like inputs. |
| `placeholder` | `string` | — | Placeholder text. |
| `autocomplete` | `string` | — | Native autocomplete setting. |
| `inputmode` | `InputProps["inputmode"]` | — | Native input mode hint. |
| `minlength` | `number` | — | Native minimum text length. |
| `maxlength` | `number` | — | Native maximum text length. |
| `pattern` | `string` | — | Native validation pattern. |
| `required` | `boolean` | `false` | Required state. |
| `disabled` | `boolean` | `false` | Disabled state. |
| `readonly` | `boolean` | `false` | Read-only state. |
| `invalid` | `boolean` | `false` | Sets `aria-invalid` and `data-akaza-invalid`. |
| `ariaLabel` | `string` | — | Accessible label when no visible label exists. |
| `ariaDescribedby` | `string` | field description/error | Accessible description ids. |
| `ui.root` | `string` | — | Class for the input element. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fired before model updates. `details.cancel()` prevents the update. |

### State Attributes

`Input` sets `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, and `data-disabled`, plus matching `data-akaza-*` attributes.
