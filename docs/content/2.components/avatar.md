---
title: Avatar
description: An image element with a fallback for when the image fails to load.
navigation:
  icon: i-lucide-circle-user
---

Displays a user or entity image with graceful fallback to initials or an icon when the image is unavailable or still loading.

## Anatomy

- **`#image`** — the `<img>` element (or replacement)
- **`#fallback`** — shown when the image fails to load or hasn't loaded yet

## Usage

::component-preview
  :::examples-avatar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Avatar } from "akaza-ui";
</script>

<template>
  <Avatar src="/avatar.jpg" alt="Jane Doe" text="JD" />
</template>
```
::

## Examples

### Custom fallback

Use `#fallback` to render initials or an icon with your own styles.

```vue
<template>
  <Avatar src="/avatar.jpg" alt="Jane Doe">
    <template #fallback>
      <span class="avatar-initials">JD</span>
    </template>
  </Avatar>
</template>
```

### Delayed fallback

Prevent a flash of the fallback during fast loads.

```vue
<template>
  <Avatar src="/avatar.jpg" alt="Jane Doe" text="JD" :delay-ms="300" />
</template>
```

### Custom image element

Use `#image` to render a custom element instead of a plain `<img>`.

```vue
<template>
  <Avatar>
    <template #image="{ src, alt }">
      <img :src="src" :alt="alt" class="avatar-img" />
    </template>
    <template #fallback>
      <span class="avatar-icon">👤</span>
    </template>
  </Avatar>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image URL. |
| `alt` | `string` | `""` | Alt text for the image. |
| `text` | `string` | — | Fallback text (e.g. initials) when no `#fallback` slot is provided. |
| `delayMs` | `number` | `0` | Delay in ms before showing the fallback. Prevents flash on fast loads. |
| `as` | `string` | `"span"` | Root element tag. |
| `ui` | `AvatarUi` | — | CSS class overrides. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `image` | `{ src, alt, status }` | The image element. |
| `fallback` | `{ status }` | Shown when image is unavailable or loading. |

`status` is one of: `"idle"` · `"loading"` · `"loaded"` · `"error"`

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The outer container element. |
| `image` | The image element. |
| `fallback` | The fallback element. |
