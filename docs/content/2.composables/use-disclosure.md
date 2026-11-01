---
title: useDisclosure
description: Share boolean open state between controls.
navigation:
  icon: i-lucide-panel-top-open
  badge:
    label: NEW
    color: success
---

`useDisclosure` provides open, close, and toggle actions for a boolean ref. It does not render anything or manage focus, dismissal, or accessibility.

## Usage

Pass an existing ref to share state with an Akaza component. Without a ref, each call starts closed and owns independent state.

```vue
<script setup lang="ts">
import { Collapsible, useDisclosure } from "akaza-ui";
import { ref } from "vue";

const expanded = ref(false);
const { isOpen, toggle } = useDisclosure(expanded);
</script>

<template>
  <button
    type="button"
    @click="toggle"
  >
    {{ isOpen ? "Hide" : "Show" }} notes
  </button>
  <Collapsible v-model="expanded">
    <template #trigger>Notes</template>
    <template #content>Project notes</template>
  </Collapsible>
</template>
```

Actions can be passed directly to native event handlers. They write the ref directly; they do not emit or cancel component change events. Use component slot actions when a change must pass through that component's event policy.

## API Reference

```ts
function useDisclosure(model?: Ref<boolean>): UseDisclosureReturn;
```

| Argument | Description                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| `model`  | Optional writable ref, including a writable computed ref. Default: a new `ref(false)`. |

| Return   | Type           | Description                                     |
| -------- | -------------- | ----------------------------------------------- |
| `isOpen` | `Ref<boolean>` | The supplied ref or the internally created ref. |
| `open`   | `() => void`   | Set state to `true`.                            |
| `close`  | `() => void`   | Set state to `false`.                           |
| `toggle` | `() => void`   | Invert current state.                           |

## SSR and Scope

No DOM access, timers, providers, or shared module state. The composable can run during SSR or inside an effect scope. Modal focus and keyboard behavior remain the rendered component's responsibility.
