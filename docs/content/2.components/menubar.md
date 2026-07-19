---
title: Menubar
description: Horizontal menu strip with arrow-key navigation across menus.
navigation:
  icon: i-lucide-panel-top
---

`Menubar` renders a horizontal `role="menubar"` command strip. Top-level triggers move with left/right arrows and each trigger can open a collision-aware vertical menu panel using the same `MenuItem` shape as [Menu](/components/menu).

## Anatomy

- **`#trigger`**: Custom top-level trigger content.
- **`#[item.slot]`**: Per-item render override for a top-level trigger or panel item.
- **`#checkbox-item`**: Shared checkbox item renderer.
- **`#radio-item`**: Shared radio item renderer.
- **`#label`**: Shared label row renderer.

## Usage

::component-preview
  :::examples-menubar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Menubar } from "akaza-ui";

const items = [
  { label: "File", children: [{ label: "New file" }, { label: "Open" }] },
  { label: "View", children: [{ label: "Preview" }, { label: "Source" }] },
];
</script>

<template>
  <Menubar :items="items" aria-label="Editor menu" />
</template>
```
::

## Examples

### Radio groups

Pass `radioValues` for radio menu items. The event contract matches `Menu`.

```vue
<template>
  <Menubar
    v-model:radio-values="radioValues"
    :items="[
      { label: 'View', children: [
        { type: 'radio', label: 'Preview', value: 'preview', radioGroup: 'view' },
        { type: 'radio', label: 'Source', value: 'source', radioGroup: 'view' },
      ] },
    ]"
  />
</template>
```

### Custom trigger

Use `#trigger` when top-level menu buttons need icons or badges.

```vue
<template>
  <Menubar :items="items">
    <template #trigger="{ item, isOpen }">
      <span>{{ item.label }}</span>
      <span aria-hidden="true">{{ isOpen ? "▲" : "▼" }}</span>
    </template>
  </Menubar>
</template>
```

### Controlled menu and top-level actions

Plain items without `children` are commands. Bind default `v-model` to control the open top-level menu.

```vue
<Menubar
  v-model="openMenu"
  :items="[
    { value: 'file', label: 'File', children: fileItems },
    { value: 'save', label: 'Save', onSelect: save },
  ]"
/>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenubarItem[]` | required | Top-level menu items. Items with `children` open panels. |
| `loop` | `boolean` | `true` | Left/right focus wraps. |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Reverses horizontal arrow behavior for RTL. |
| `disabled` | `boolean` | `false` | Disables the menubar. |
| `closeOnSelect` | `boolean` | `true` | Closes after normal item selection. |
| `radioValues` | `Record<string, string>` | — | State for radio groups inside panels. |
| `ariaLabel` | `string` | — | Accessible label. |
| `ariaLabelledby` | `string` | — | Accessible label id. |
| `ui` | `MenubarUi` | — | Classes for root, triggers, content, and menu parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `(value: string \| null, details)` | Fired before active menu changes. |
| `select` | `(item, details)` | Fired when an item is selected. |
| `check-change` | `(item, checked, details)` | Fired when checkbox item changes. |
| `radio-change` | `(group, value, details)` | Fired when radio item changes. |
| `update:radioValues` | `(values)` | v-model event for radio state. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `item`, `isOpen` | Top-level trigger content. |
| `[item.slot]` | Depends on item type | Per-item panel renderer. |
| `checkbox-item` | `item`, `checked` | Shared checkbox item renderer. |
| `radio-item` | `item`, `checked` | Shared radio item renderer. |
| `label` | `item` | Shared label renderer. |

### UI Options

| Key | Description |
|-----|-------------|
| `root` | `role="menubar"` root. |
| `trigger` | Top-level menu trigger button. |
| `content` | Open menu panel wrapper. |
| `panel`, `group`, `item`, `checkboxItem`, `radioItem`, `separator`, `label`, `submenu`, `submenuTrigger`, `submenuContent` | Same as Menu. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-menubar` | `data-akaza-state`, `data-akaza-disabled` |
| `trigger` | `akaza-menubar-trigger` | `data-akaza-state`, `data-akaza-disabled` |
| `content` | `akaza-menubar-content`, `akaza-menu-content` | `data-akaza-state`, `data-akaza-side`, `data-akaza-align`, `--akaza-menubar-anchor-width`, `--akaza-menubar-anchor-height`, `--akaza-menubar-available-width`, `--akaza-menubar-available-height`, `--akaza-menubar-transform-origin`, `--akaza-menubar-duration` |
| menu parts | `akaza-menu-*` | Same as Menu. |

Popup entry and exit use a subtle side-aware structural transition. Override `--akaza-menubar-duration` to change its `120ms` duration. Reduced-motion preference shortens it automatically.

### Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Move between top-level triggers. |
| `ArrowDown` | Open active menu and focus first panel item. |
| `ArrowUp` | Open active menu and focus last panel item. |
| `Enter` / `Space` | Open a menu or activate a top-level command without children. |
| `ArrowUp` / `ArrowDown` | Move within an open panel. |
| `Home` / `End` | Focus first/last enabled top-level item. |
| Character keys | Typeahead across top-level items. |
| `Escape` | Close the open panel and return focus to its trigger. |
