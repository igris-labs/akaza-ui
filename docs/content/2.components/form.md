---
title: Form
description: Submit wrapper that exposes FormData and native validity state.
navigation:
  icon: i-lucide-clipboard-check
---

`Form` wraps a native form and emits typed submit details: the original submit event, `FormData`, submitted values, and validity state. Pass `errors` to show server-side errors through matching [Field](/components/field) names.

## Usage

::component-preview
  :::examples-form-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { FormSubmitDetails, FormValues } from "akaza-ui";
import { Form } from "akaza-ui";

function onSubmit(details: FormSubmitDetails) {
  console.log(details.formData);
}

function onFormSubmit(values: FormValues) {
  console.log(values);
}
</script>

<template>
  <Form @submit="onSubmit" @form-submit="onFormSubmit">
    <!-- fields -->
  </Form>
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Form id. |
| `action` | `string` | — | Native form action. |
| `method` | `"get" \| "post" \| "dialog"` | `"post"` | Native form method. |
| `autocomplete` | `"on" \| "off"` | — | Native autocomplete setting. |
| `novalidate` | `boolean` | `false` | Disables native browser validation. |
| `preventDefault` | `boolean` | `true` | Prevent native navigation on submit. |
| `errors` | `FormErrors` | — | Server-side errors read by child fields using matching names. |
| `ui.root` | `string` | — | Class for the form element. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `FormSubmitDetails` | Fired on native submit. Includes `formData`, `valid`, and `cancel()`. |
| `form-submit` | `(values, details)` | Fired with a values object converted from `FormData`, plus submit details. |
