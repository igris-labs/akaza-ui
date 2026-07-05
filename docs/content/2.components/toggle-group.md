---
title: Toggle Group
description: Single or multiple pressed values with roving keyboard focus.
navigation:
  icon: i-lucide-list-checks
---

`ToggleGroup` manages a set of pressed buttons. It supports single or multiple selection, roving focus, form hidden values, item slots, and cancelable changes.

## Usage

::component-preview
  :::examples-toggle-group-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { ToggleGroupModel } from "akaza-ui";
import { ToggleGroup } from "akaza-ui";
import { ref } from "vue";

const value = ref<ToggleGroupModel>("center");
const options = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
</script>

<template>
  <ToggleGroup v-model="value" :options="options" :allow-empty="false" />
</template>
```
::

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ToggleGroupOption[]` | required | Toggle items. |
| `type` | `"single" \| "multiple"` | `"single"` | Selection mode. |
| `valueKey` | `string` | — | Object key used as item value. Falls back to `value`, then `label`. |
| `labelKey` | `string` | `"label"` | Object key used as item label. |
| `descriptionKey` | `string` | `"description"` | Object key used as item description. |
| `disabledKey` | `string` | `"disabled"` | Object key used as item disabled state. |
| `disabled` | `boolean` | `false` | Disabled state for the whole group. |
| `required` | `boolean` | `false` | Prevents clearing the last selected value. |
| `name` | `string` | — | Hidden form input name. Multiple mode renders one hidden input per selected value. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Roving focus direction. |
| `loop` | `boolean` | `true` | Arrow navigation wraps. |
| `rovingFocus` | `boolean` | `true` | Enables arrow-key roving focus. |
| `allowEmpty` | `boolean` | `true` | Allows single mode to clear selected item. |
| `ariaLabel` | `string` | — | Accessible group label. |
| `ariaLabelledby` | `string` | — | Accessible group label id. |
| `ui` | `ToggleGroupUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `value-change` | `(value, details)` | Fired before model updates. `details.cancel()` prevents the update. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` | `option`, `value`, `label`, `description`, `isPressed`, `isDisabled`, `select` | Custom item content. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Root group. |
| `input` | Hidden form inputs. |
| `item` | Toggle button. |
| `label` | Default item label. |
| `description` | Default item description. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-toggle-group` | `data-akaza-orientation`, `data-akaza-type`, `data-akaza-disabled` |
| `input` | `akaza-toggle-group-input` | — |
| `item` | `akaza-toggle-group-item` | `data-akaza-state`, `data-akaza-disabled` |
| `label` | `akaza-toggle-group-label` | — |
| `description` | `akaza-toggle-group-description` | — |

Plain `class` applies to the root group.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Toggle focused item. |
| Arrow keys | Move focus by orientation. |
| `Home` / `End` | Move focus to first/last enabled item. |
