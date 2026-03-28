---
title: Tabs
description: A set of layered sections of content, one visible at a time.
navigation:
  icon: i-lucide-layout-panel-top
---

A tab list with associated panels. Follows the WAI-ARIA Tabs pattern with roving tabindex, keyboard arrow navigation, and an animated sliding indicator.

## Anatomy

- **`#tab`** — content rendered inside each tab button (defaults to the item's label)
- **`#panel-{value}`** — the content panel for each tab (named by the item's `value`)

The tab button itself is rendered by the component; use the `ui.tab` prop to add classes to it. The tab list also renders an `akaza-tab-indicator` span that you can style for a sliding underline or pill effect.

## Usage

::component-preview
  :::examples-tabs-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "akaza-ui";

const tabs = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "notifications", label: "Notifications" },
];
const active = ref("account");
</script>

<template>
  <Tabs :items="tabs" v-model="active">
    <template #panel-account>Account settings.</template>
    <template #panel-security>Security settings.</template>
    <template #panel-notifications>Notification preferences.</template>
  </Tabs>
</template>
```
::

## Examples

### Custom tab button

Use `#tab` to style each tab button and react to the active state.

```vue
<template>
  <Tabs :items="tabs" v-model="active">
    <template #tab="{ item, isActive }">
      <span :class="['tab', { 'tab--active': isActive }]">
        {{ item.label }}
      </span>
    </template>

    <template #panel-account>Account content.</template>
    <template #panel-security>Security content.</template>
  </Tabs>
</template>
```

### Pill-style tabs

Apply background styles to the tab list and use the indicator for a sliding pill.

```vue
<template>
  <Tabs
    :items="tabs"
    v-model="active"
    :ui="{ list: 'tabs-pill-list', indicator: 'tabs-pill-indicator' }"
  >
    <template #panel-account>Account content.</template>
    <template #panel-security>Security content.</template>
  </Tabs>
</template>
```

### Manual activation mode

Arrow keys only move focus; the user must press Space or Enter to activate a tab.

```vue
<template>
  <Tabs :items="tabs" v-model="active" activation-mode="manual">
    <template #panel-account>Account content.</template>
  </Tabs>
</template>
```

### Vertical orientation

```vue
<template>
  <Tabs :items="tabs" v-model="active" orientation="vertical">
    <template #panel-account>Account content.</template>
  </Tabs>
</template>
```

### Unmount inactive panels

Remove inactive panels from the DOM instead of hiding them.

```vue
<template>
  <Tabs :items="tabs" v-model="active" :unmount-on-hide="true">
    <template #panel-account>Account content.</template>
  </Tabs>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabsItem[]` | — | **Required.** List of tab items. |
| `modelValue` | `string` | `""` | Currently active tab value. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Tab list direction. |
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` | `automatic`: arrow keys activate. `manual`: arrow keys move focus only. |
| `unmountOnHide` | `boolean` | `false` | Use `v-if` instead of `v-show` for inactive panels. |
| `ariaLabel` | `string` | — | `aria-label` for the tab list. |
| `labelKey` | `string` | `"label"` | Property to use as label when items are objects. |
| `ui` | `TabsUi` | — | CSS class overrides. |

### TabsItem

| Key | Type | Description |
|-----|------|-------------|
| `value` | `string` | **Required.** Unique identifier and panel slot suffix. |
| `label` | `string` | Display label (used by the default `#tab` slot). |
| `disabled` | `boolean` | Disables this tab. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `tab` | `{ item, isActive, select }` | Each tab button. Defaults to rendering the item's label. |
| `panel-{value}` | `{ item, isActive }` | Content panel for the tab with the matching `value`. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | The outer wrapper element. |
| `list` | The tab list element. |
| `tab` | Each tab button element. |
| `indicator` | The sliding indicator span. |
| `panels` | The panels wrapper element. |
| `panel` | Each panel element. |
