---
title: Separator
description: A visual or semantic divider between content sections.
navigation:
  icon: i-lucide-minus
---

A horizontal or vertical dividing line. When `decorative` is false (default), it renders as `role="separator"` with an appropriate `aria-orientation` attribute.

## Usage

::component-preview
  :::examples-separator-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Separator } from "akaza-ui";
</script>

<template>
  <p>Above</p>
  <Separator />
  <p>Below</p>
</template>
```
::

## Examples

### Vertical separator

```vue
<template>
  <div class="flex items-center gap-4">
    <span>Home</span>
    <Separator orientation="vertical" class="h-4" />
    <span>About</span>
  </div>
</template>
```

### Decorative

Use `decorative` when the separator is purely visual and carries no semantic meaning.

```vue
<template>
  <Separator :decorative="true" class="my-divider" />
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the separator line. |
| `decorative` | `boolean` | `false` | When true, renders as `role="none"` (purely visual). |
| `as` | `string` | `"div"` | Root element tag. |
