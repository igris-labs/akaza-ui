---
title: Input
description: Native text input with Field integration and invalid state attributes.
navigation:
  icon: i-lucide-text-cursor-input
---

`Input` is an unstyled native input. Use it alone, or place it inside [Field](/components/field) to inherit `id`, `name`, `required`, `disabled`, invalid state, native validation messages, and `aria-describedby`.

Use it for text-like native input types when you want Akaza state attrs and Field integration without losing normal browser behavior.

## Anatomy

- **`ui.root`**: Native `<input>` element. Direct `class` also applies here.

`Input` intentionally has one structural part. It does not wrap the native element, so all native attributes and browser validation stay direct.

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

## Examples

### Field integration

Inside `Field`, the input inherits `id`, `name`, `required`, `disabled`, invalid state, and `aria-describedby`.

```vue
<template>
  <Field name="email" label="Email" description="Used for account notices." required>
    <Input type="email" placeholder="you@example.com" />
  </Field>
</template>
```

### Native validation

Use native input attributes when browser validation already covers the rule.

```vue
<template>
  <Input
    type="text"
    name="slug"
    required
    pattern="[a-z0-9-]+"
    minlength="3"
    placeholder="project-slug"
  />
</template>
```

### Cancel a value change

Use `details.cancel()` to reject a model update before it lands.

```vue
<script setup lang="ts">
import type { AkazaChangeEventDetails } from "akaza-ui";
import { ref } from "vue";

const value = ref("");

function onlyLowercase(next: string, details: AkazaChangeEventDetails) {
  if (next !== next.toLowerCase()) details.cancel();
}
</script>

<template>
  <Input v-model="value" @value-change="onlyLowercase" />
</template>
```

### Disabled and readonly

Use `disabled` for unavailable fields and `readonly` for values users can copy but not edit.

```vue
<script setup lang="ts">
import { ref } from "vue";

const locked = ref("Locked");
const readOnly = ref("Read only");
</script>

<template>
  <Input v-model="locked" disabled />
  <Input v-model="readOnly" readonly />
</template>
```

### State styling

Use data attributes in `ui.root` for focused, invalid, dirty, and filled states.

```vue
<template>
  <Input
    :ui="{
      root: 'border px-3 py-2 data-[akaza-invalid=true]:border-red-500 data-[akaza-focused=true]:outline',
    }"
  />
</template>
```

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
| `ui` | `InputUi` | — | Classes for the input element. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fired before model updates. `details.cancel()` prevents the update. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The native input element. |

### State Attributes

`Input` sets `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, and `data-disabled`, plus matching `data-akaza-*` attributes.

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-input` | `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-disabled`, and matching `data-akaza-*` attrs |

Plain `class` also applies to the native input root. `ui.root` is the structured equivalent.
