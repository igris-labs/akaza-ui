---
title: useSelection
description: Manage single, multiple, or range selection for custom controls.
navigation:
  icon: i-lucide-list-checks
  badge:
    label: NEW
    color: success
---

`useSelection` tracks selected keys without rendering controls. Use it when your app owns the markup. Use [Checkbox Group](/components/checkbox-group) or [Listbox](/components/listbox) if you want a ready-made control.

## Usage

Toggle days one at a time, or select a range. The range skips Tuesday because it is disabled.

::component-preview
  :::examples-selection-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { useSelection } from "akaza-ui";

const days = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday", disabled: true },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
];
const { selectedKeys, isSelected, toggle, selectRange, clear } = useSelection({
  items: days,
  multiple: true,
});
</script>

<template>
  <fieldset>
    <legend>Pickup days</legend>
    <label v-for="day in days" :key="day.key">
      <input
        type="checkbox"
        :checked="isSelected(day.key)"
        :disabled="day.disabled"
        @change="toggle(day.key, $event)"
      >
      {{ day.label }}{{ day.disabled ? " (unavailable)" : "" }}
    </label>
  </fieldset>
  <button type="button" @click="selectRange('mon', 'thu', $event)">
    Select Monday to Thursday
  </button>
  <button type="button" @click="clear($event)">Clear</button>
  <output>{{ selectedKeys.length }} selected</output>
</template>
```
::

## Single selection and shared state

Leave `multiple` off for single selection. Pass a writable ref when the selection needs to be shared with other code. Both modes use an array of keys.

```ts
import { useSelection } from "akaza-ui";
import { ref } from "vue";

const model = ref(["pickup"]);
const { select } = useSelection({
  items: [{ key: "pickup" }, { key: "delivery" }],
  model,
  onChange(keys, details) {
    if (!keys.length) details.cancel();
  },
});

select("delivery"); // model.value is ["delivery"].
```

## API Reference

Call `useSelection(options)` in setup. Import it from `akaza-ui`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MaybeRefOrGetter<readonly SelectionItem[]>` | Required | Items in range order. Each needs a unique string `key`. Set `disabled: true` to skip an item. |
| `model` | `Ref<string[]>` | Internal empty array | Shared writable selection. |
| `multiple` | `MaybeRefOrGetter<boolean>` | `false` | Allow more than one selected key and enable ranges. |
| `onChange` | `(keys, details) => void` | None | Runs before an action changes the model. Call `details.cancel()` to keep the existing selection. |

| Return | Description |
| --- | --- |
| `selectedKeys` | Read-only computed ref of the selected keys. |
| `isSelected(key)` | Check whether a key is in the model. |
| `select(key, event?)` | Replace the selection with one key. |
| `toggle(key, event?)` | Add or remove a key. In single mode, adding a key replaces the selection. |
| `selectRange(from, to, event?)` | In multiple mode, replace selection with enabled items between the two keys. Both endpoints are included and must be enabled. |
| `clear(event?)` | Clear all selected keys. |

Actions ignore unknown or disabled keys. Range order comes from `items`, not the DOM. To support Shift selection, keep an anchor key in your component and call `selectRange(anchor, key, event)`.

Actions report `details.reason` as `"select"`, `"toggle"`, `"range"`, or `"clear"`. Pass the original event to expose it as `details.event`. Assignments to the model and changes to the items do not call `onChange` or prune the selection. Remove stale keys yourself when needed, for example after deleting items.

You own labels, disabled and selected attributes, and keyboard or pointer bindings. Pair with [useRovingFocus](/composables/use-roving-focus) if your controls also need one Tab stop and arrow navigation.
