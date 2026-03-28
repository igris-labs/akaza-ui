---
title: Radio Group
description: A group of radio buttons where only one can be selected at a time.
navigation:
  icon: i-lucide-circle-dot
---

A set of mutually exclusive options. Keyboard navigation follows the roving tabindex pattern — arrow keys move between options and selection follows focus.

## Anatomy

- **`#legend`** — accessible group label rendered above the options
- **`#item`** — content rendered inside each radio button element

The radio button element itself is rendered by the component. Use the `ui.item` prop to add classes to it.

## Usage

::component-preview
  :::examples-radio-group-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { RadioGroup } from "akaza-ui";

const selected = ref("email");
const options = ["email", "sms", "push"];
</script>

<template>
  <RadioGroup v-model="selected" :options="options" />
</template>
```
::

## Examples

### Object options with labels

```vue
<script setup lang="ts">
const options = [
  { value: "free", label: "Free", description: "Up to 3 projects." },
  { value: "pro", label: "Pro", description: "Unlimited projects." },
  { value: "team", label: "Team", description: "Everything in Pro, plus SSO." },
];
</script>

<template>
  <RadioGroup v-model="plan" :options="options" legend="Choose a plan" />
</template>
```

### Custom item rendering

The `#item` slot is rendered inside each radio button — provide the visual content only. The button itself handles click and keyboard selection.

```vue
<template>
  <RadioGroup
    v-model="selected"
    :options="options"
    :ui="{ item: 'plan-card' }"
  >
    <template #item="{ option, label, description, isChecked }">
      <span class="plan-card__dot" :data-checked="isChecked" />
      <span>
        <strong>{{ label }}</strong>
        <p>{{ description }}</p>
      </span>
    </template>
  </RadioGroup>
</template>
```

### Horizontal layout

```vue
<template>
  <RadioGroup v-model="size" :options="['S', 'M', 'L', 'XL']" orientation="horizontal" />
</template>
```

### Disabled options

Use `getItemDisabled` to disable individual options programmatically.

```vue
<template>
  <RadioGroup
    v-model="plan"
    :options="options"
    :get-item-disabled="(opt) => opt.value === 'enterprise'"
  />
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `any[]` | — | **Required.** Array of option values or objects. |
| `valueKey` | `string` | — | Property to use as the value when options are objects. |
| `labelKey` | `string` | `"label"` | Property to use as the display label. |
| `descriptionKey` | `string` | `"description"` | Property to use as the description text. |
| `disabled` | `boolean` | `false` | Disable all options. |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction. |
| `legend` | `string` | — | Visible group label. Slot `#legend` takes priority. |
| `loop` | `boolean` | `true` | Wrap arrow key navigation at the ends. |
| `name` | `string` | — | HTML name for form submission. |
| `required` | `boolean` | `false` | Marks the group as required. |
| `ariaLabel` | `string` | — | `aria-label` on the group element. |
| `ariaLabelledby` | `string` | — | `aria-labelledby` on the group element. |
| `getItemDisabled` | `(option: any) => boolean` | — | Function to disable individual options. |
| `as` | `string` | `"div"` | Root element tag. |
| `ui` | `RadioGroupUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `legend` | `{ legend }` | Group label. Defaults to the `legend` prop. |
| `item` | `{ option, value, label, description, isChecked, isDisabled, select }` | Each radio option. |

### UI Options

| Key | Description |
|-----|-------------|
| `item` | Each option item element. |
| `legend` | The legend element. |
