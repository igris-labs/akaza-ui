---
title: Switch
description: A toggle control for binary or custom on/off values.
navigation:
  icon: i-lucide-toggle-left
---

An accessible on/off toggle. Renders as a `role="switch"` button and supports custom `v-model` values, labels, descriptions, and fully custom track/thumb rendering via slots.

## Anatomy

- **`#thumb`** — the sliding indicator inside the track
- **`#label`** — the label beside the switch
- **`#description`** — supplementary text below the label

## Usage

::component-preview
  :::examples-switch-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "akaza-ui";

const enabled = ref(false);
</script>

<template>
  <Switch v-model="enabled" label="Enable notifications" />
</template>
```
::

## Examples

### Custom thumb

```vue
<template>
  <Switch v-model="enabled" class="my-switch">
    <template #thumb="{ checked }">
      <span :class="['thumb', { 'thumb--on': checked }]" />
    </template>
  </Switch>
</template>
```

### With description

```vue
<template>
  <Switch
    v-model="enabled"
    label="Dark mode"
    description="Applies a dark theme across the interface."
  />
</template>
```

### Custom true/false values

```vue
<script setup lang="ts">
const theme = ref<"dark" | "light">("light");
</script>

<template>
  <Switch
    v-model="theme"
    true-value="dark"
    false-value="light"
    label="Dark mode"
  />
</template>
```

### Icon-only switch

Use `aria-label` when there's no visible label text.

```vue
<template>
  <Switch v-model="muted" aria-label="Mute audio" class="my-switch" />
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disables the switch. |
| `id` | `string` | auto | HTML id for the button element. |
| `name` | `string` | — | HTML name for form submission. |
| `required` | `boolean` | `false` | Marks the field as required. |
| `trueValue` | `boolean \| string \| number` | `true` | Model value when switched on. |
| `falseValue` | `boolean \| string \| number` | `false` | Model value when switched off. |
| `label` | `string` | — | Label text. Slot `#label` takes priority. |
| `description` | `string` | — | Description text. Slot `#description` takes priority. |
| `ariaLabel` | `string` | — | `aria-label` for icon-only switches with no visible label. |
| `ui` | `SwitchUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `thumb` | `{ checked }` | The sliding thumb indicator. |
| `label` | — | Label text. Defaults to the `label` prop. |
| `description` | — | Description text. Defaults to the `description` prop. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `[value: SwitchValue, details]` | Fired when the switch state changes. |

### UI Options

| Key | Description |
|-----|-------------|
| `wrapper` | The outer wrapper element. |
| `root` | The interactive button (the switch track). |
| `thumb` | The thumb indicator element. |
| `label` | The label element. |
| `description` | The description element. |
