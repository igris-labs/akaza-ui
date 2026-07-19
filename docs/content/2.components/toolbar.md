---
title: Toolbar
description: Command strip with roving focus across buttons, links, inputs, groups, and separators.
navigation:
  icon: i-lucide-wrench
---

`Toolbar` renders a `role="toolbar"` wrapper and an optional item array for common editor-style command strips. Generated commands use roving focus; text inputs keep native editing keys and a normal tab stop.

## Anatomy

- **`#default`**: Additional custom content inside the toolbar.
- **`#[item.slot]`**: Per-item render override when an item has a `slot` key.

Toolbar root, groups, buttons, links, inputs, labels, and separators are generated from `items`.

## Usage

::component-preview
  :::examples-toolbar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { Toolbar } from "akaza-ui";

const bold = ref(false);
const items = computed(() => [
  { label: "Bold", pressed: bold.value, onSelect: () => (bold.value = !bold.value) },
  { type: "separator" },
  { type: "link", label: "Help", href: "/help" },
]);
</script>

<template>
  <Toolbar :items="items" aria-label="Editor toolbar" />
</template>
```
::

## Examples

### Grouped commands

Use `type: "group"` for related commands inside the toolbar.

```vue
<template>
  <Toolbar
    :items="[
      { type: 'group', label: 'Alignment', children: [
        { label: 'Left', pressed: align === 'left', onSelect: () => (align = 'left') },
        { label: 'Center', pressed: align === 'center', onSelect: () => (align = 'center') },
      ] },
    ]"
  />
</template>
```

### Custom item slot

Use `slot` on an item and render it with the matching named slot.

```vue
<template>
  <Toolbar :items="[{ label: 'Bold', slot: 'bold' }]">
    <template #bold="{ item }">
      <strong>{{ item.label }}</strong>
    </template>
  </Toolbar>
</template>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ToolbarItem[]` | `[]` | Generated toolbar items. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Toolbar orientation. |
| `loop` | `boolean` | `true` | Arrow focus wraps. |
| `disabled` | `boolean` | `false` | Disables generated items. |
| `ariaLabel` | `string` | — | Accessible label. |
| `ariaLabelledby` | `string` | — | Accessible label id. |
| `ui` | `ToolbarUi` | — | Classes for structural parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `(item, details)` | Fired before an item runs `onSelect`. |
| `input-change` | `(item, value, details)` | Fired before a generated input runs `onUpdateValue`. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | — | Extra toolbar content after generated items. |
| `[item.slot]` | `item`, `isDisabled` | Custom generated item content. |

### Item Shape

| Key | Type | Description |
|-----|------|-------------|
| `type` | `"button" \| "link" \| "separator" \| "group" \| "input"` | Item type. Omit for button. |
| `label` | `string` | Visible label / accessible input label. |
| `href` | `string` | Link target. |
| `inputValue` | `string \| number` | Controlled value for `type: "input"`. |
| `inputType` | `string` | Native input type. Defaults to `text`. |
| `name` | `string` | Native input name. |
| `placeholder` | `string` | Native input placeholder. |
| `min`, `max`, `step` | `number \| string` | Native numeric constraints. |
| `disabled` | `boolean` | Disables item. |
| `pressed` | `boolean` | Sets `aria-pressed` and on/off state. |
| `focusableWhenDisabled` | `boolean` | Keeps disabled item focusable. |
| `children` | `ToolbarItem[]` | Group children. |
| `slot` | `string` | Named slot override. |
| `onSelect` | `() => void` | Runs after uncanceled select event. |
| `onUpdateValue` | `(value: string) => void` | Runs after uncanceled input change. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Toolbar root. |
| `group` | Group wrapper. |
| `button` | Generated button. |
| `link` | Generated link. |
| `input` | Generated input. |
| `separator` | Separator. |
| `label` | Default label span. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-toolbar` | `data-akaza-orientation`, `data-akaza-disabled` |
| `group` | `akaza-toolbar-group` | — |
| `button` | `akaza-toolbar-button` | `data-akaza-state`, `data-akaza-disabled`, `data-akaza-toolbar-item` |
| `link` | `akaza-toolbar-link` | `data-akaza-disabled`, `data-akaza-toolbar-item` |
| `input` | `akaza-toolbar-input` | `data-akaza-disabled`, `data-akaza-toolbar-item` |
| `separator` | `akaza-toolbar-separator` | `data-akaza-orientation` |
| `label` | `akaza-toolbar-label` | — |

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Move focus in horizontal toolbar. |
| `ArrowDown` / `ArrowUp` | Move focus in vertical toolbar. |
| `Home` / `End` | Move to first/last focusable item. |

Generated buttons and links use one roving tab stop. Text inputs remain native tab stops and keep Arrow/Home/End cursor behavior; toolbar navigation never hijacks their editing keys.
