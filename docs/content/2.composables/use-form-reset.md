---
title: useFormReset
description: Reset custom control state when its native form resets.
navigation:
  icon: i-lucide-rotate-ccw
  badge:
    label: NEW
    color: success
---

`useFormReset` connects application state to a native form's reset event. It respects canceled resets and checks the control's current form, including its `form` attribute.

## Usage

Call in component setup. Pass a getter for the native control and a callback that restores your initial state.

```vue
<script setup lang="ts">
import { useFormReset } from "akaza-ui";
import { ref, useTemplateRef } from "vue";

const input = useTemplateRef<HTMLInputElement>("input");
const initialValue = "Weekly";
const value = ref(initialValue);

useFormReset(
  () => input.value,
  () => {
    value.value = initialValue;
  },
);
</script>

<template>
  <form>
    <label>
      Schedule
      <input
        ref="input"
        v-model="value"
        name="schedule"
      />
    </label>
    <button type="reset">Reset</button>
  </form>
</template>
```

Akaza form components already reset their own models. Use this helper for custom controls or additional application state, not to reset an Akaza component twice.

## API Reference

```ts
function useFormReset(control: () => HTMLElement | null, reset: () => void): void;
```

| Argument  | Description                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| `control` | Getter for a native form-associated element or an element inside a form. It must resolve when the component mounts. |
| `reset`   | Restores application state. Runs after Vue's next tick only if the matching native reset was not canceled.          |

The helper does not capture initial values, trigger a reset, or clear validation state for you. Those decisions belong to the callback. Native `form` ownership takes priority over the nearest ancestor form.

## SSR and Scope

Listeners attach to the control's owner document on mount and are removed before unmount. Resets queued before unmount are ignored. No DOM access occurs during SSR. Moving a control between forms in the same document is supported; moving it into another document requires remounting.
