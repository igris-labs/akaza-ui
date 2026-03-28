---
title: Progress
description: Displays a value indicating completion of a task.
navigation:
  icon: i-lucide-loader
---

An accessible progress bar with ARIA role `progressbar`. Supports determinate values, indeterminate state (when value is `null`), and both horizontal and vertical orientations.

## Anatomy

- **`#indicator`** — the filled portion of the track

## Usage

::component-preview
  :::examples-progress-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Progress } from "akaza-ui";

const value = ref(40);
</script>

<template>
  <Progress v-model="value" />
</template>
```
::

## Examples

### Custom indicator

Use `#indicator` to render your own fill element using the exposed `percentage`.

```vue
<template>
  <Progress v-model="value" class="progress-track">
    <template #indicator="{ percentage }">
      <div class="progress-fill" :style="{ width: `${percentage}%` }" />
    </template>
  </Progress>
</template>
```

### Indeterminate state

Set the model value to `null` to indicate an unknown duration.

```vue
<script setup lang="ts">
const value = ref<number | null>(null);
</script>

<template>
  <Progress v-model="value" aria-label="Loading…" class="progress-track" />
</template>
```

### Custom range

```vue
<template>
  <Progress v-model="score" :min="0" :max="10" />
</template>
```

### Custom value label

```vue
<template>
  <Progress
    v-model="value"
    :get-value-label="(v, max) => `${v} of ${max} items processed`"
  />
</template>
```

### Vertical orientation

```vue
<template>
  <Progress v-model="value" orientation="vertical" class="progress-track-vertical" />
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | `null` | Current progress value. `null` = indeterminate. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation of the progress bar. |
| `ariaLabel` | `string` | — | Accessible label when no visible label is present. |
| `getValueLabel` | `(value: number \| null, max: number) => string` | — | Custom function to generate the `aria-valuetext`. |
| `ui` | `ProgressUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `indicator` | `{ value, percentage, max, min, state }` | The filled indicator element. `state` is `"indeterminate"` when value is `null`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The outer track element. |
| `indicator` | The fill indicator element. |
