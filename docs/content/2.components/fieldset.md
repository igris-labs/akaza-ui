---
title: Fieldset
description: Native fieldset and legend wrapper for related controls.
navigation:
  icon: i-lucide-group
---

`Fieldset` groups related controls with native `<fieldset>` and `<legend>` semantics while keeping styling fully controlled by you.

## Usage

::component-preview
  :::examples-fieldset-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Fieldset } from "akaza-ui";
</script>

<template>
  <Fieldset legend="Billing details">
    <!-- fields -->
  </Fieldset>
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | Fieldset legend. |
| `description` | `string` | — | Help text linked with `aria-describedby`. |
| `disabled` | `boolean` | `false` | Disables grouped controls via native fieldset behavior. |
| `invalid` | `boolean` | `false` | Sets invalid state attributes. |
| `ui` | `FieldsetUi` | — | Classes for root, legend, description, content. |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Grouped controls. |
| `legend` | Custom legend content. |
| `description` | Custom description content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The native fieldset element. |
| `legend` | The legend element. |
| `description` | The description element. |
| `content` | The content wrapper around grouped controls. |

### State Attributes

`Fieldset` sets `data-disabled`, `data-invalid`, and matching `data-akaza-*` attributes.
