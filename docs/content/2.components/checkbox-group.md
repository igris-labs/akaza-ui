---
title: Checkbox Group
description: Items-based multi-select built on Checkbox.
navigation:
  icon: i-lucide-list-checks
---

`CheckboxGroup` manages an array model for multiple checkbox options. It keeps Akaza's items-based API while using [Checkbox](/components/checkbox) for each item, including optional parent checkbox behavior.

## Usage

::component-preview
  :::examples-checkbox-group-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { CheckboxGroup } from "akaza-ui";

const value = ref(["email"]);
const options = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];
</script>

<template>
  <CheckboxGroup v-model="value" :options="options" parent />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `CheckboxGroupOption[]` | — | Options to render. |
| `valueKey` | `string` | — | Property used as option value. |
| `labelKey` | `string` | `"label"` | Property used as label. |
| `descriptionKey` | `string` | `"description"` | Property used as description. |
| `disabledKey` | `string` | `"disabled"` | Property used as disabled state. |
| `allValues` | `CheckboxGroupValue[]` | option values | Values controlled by the parent checkbox. |
| `parent` | `boolean` | `false` | Renders a select-all parent checkbox with indeterminate state. |
| `parentLabel` | `string` | `"Select all"` | Parent checkbox label. |
| `parentDescription` | `string` | — | Parent checkbox description. |
| `disabled` | `boolean` | `false` | Disables every item. |
| `required` | `boolean` | `false` | Requires at least one checked item for form submission. |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Layout orientation data attribute. |
| `legend` | `string` | — | Group label used as accessible name fallback. |
| `name` | `string` | — | Name used by child checkbox form inputs. |
| `ui` | `CheckboxGroupUi` | — | Classes for root, legend, item, and nested checkbox parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fired before model updates. `details.cancel()` prevents the update. |

### Slots

| Slot | Scoped props | Description |
|------|--------------|-------------|
| `item` | `option`, `value`, `checked`, `disabled` | Custom item rendering. |
| `indicator` | `option`, `checked` | Child checkbox indicator. |
| `parent-indicator` | `checked` | Parent checkbox indicator. |
