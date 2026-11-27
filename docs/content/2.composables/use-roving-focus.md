---
title: useRovingFocus
description: Add arrow-key focus to a custom group of controls.
navigation:
  icon: i-lucide-arrow-left-right
  badge:
    label: NEW
    color: success
---

`useRovingFocus` makes a group of controls a single Tab stop. Use it when you need your own markup, for example an editor toolbar with custom buttons. Use [Toolbar](/components/toolbar) if you want Akaza to render the controls.

## Usage

Tab into the toolbar, then move with Left and Right. Enter or Space still activates the focused button. Focus and formatting are separate: arrow keys do not change which buttons are pressed.

::component-preview
  :::examples-roving-focus-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { useRovingFocus } from "akaza-ui";
import { reactive } from "vue";

const items = [
  { key: "bold", label: "Bold" },
  { key: "italic", label: "Italic" },
  { key: "underline", label: "Underline" },
] as const;
const pressed = reactive({ bold: false, italic: false, underline: false });
const { itemProps } = useRovingFocus({ items });
</script>

<template>
  <div role="toolbar" aria-label="Text formatting">
    <button
      v-for="item in items"
      :key="item.key"
      v-bind="itemProps(item.key)"
      type="button"
      :aria-pressed="pressed[item.key]"
      @click="pressed[item.key] = !pressed[item.key]"
    >
      {{ item.label }}
    </button>
  </div>
  <p :class="{ 'font-bold': pressed.bold, italic: pressed.italic, underline: pressed.underline }">
    Sample text
  </p>
</template>
```
::

## API Reference

Call `useRovingFocus(options)` in setup. Import it from `akaza-ui`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MaybeRefOrGetter<readonly RovingFocusItem[]>` | Required | Items in template order. Each needs a stable, unique string `key`. Optional `disabled: true` skips the item. |
| `orientation` | `MaybeRefOrGetter<"horizontal" \| "vertical" \| "both">` | `"horizontal"` | Choose which arrow keys move focus. |
| `loop` | `MaybeRefOrGetter<boolean>` | `true` | Wrap at either end of the group. |

| Return | Description |
| --- | --- |
| `itemProps(key)` | Returns `ref`, `tabindex`, and `onKeydown`. Bind them to the native focus target in the template. |
| `tabStop` | Read-only computed ref with the key Tab enters, or `undefined` if no item can take focus. |

Pass a ref or getter for options that change. Render items in the same order you supply them. Only include items that are rendered; when items are hidden or removed, update the list too. The initial Tab stop is the first enabled item, including in server-rendered HTML. Bindings are cleaned up on unmount.

## Keyboard

| Key | Behavior |
| --- | --- |
| Tab / Shift+Tab | Enter or leave the group. On return, focus lands on the last enabled item that received focus. |
| Left / Right | Move in horizontal or both orientation. Direction follows the document or nearest `dir` ancestor. |
| Up / Down | Move in vertical or both orientation. |
| Home / End | Move to the first or last enabled item. |

## Markup and state

The composable does not add roles, labels, or disabled attributes. For a toolbar, add `role="toolbar"` and a label. For a vertical toolbar, add `aria-orientation="vertical"`. Set the same disabled state on the native button and its item. If a disabled action should still be discoverable through arrow keys, keep the item in the focus order, set `aria-disabled`, and block activation yourself.

Do not combine these bindings with a second focus manager or a native `focusgroup` on the same controls. Keep selection and activation in your own state and handlers.
