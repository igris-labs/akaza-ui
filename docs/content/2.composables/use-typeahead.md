---
title: useTypeahead
description: Buffer typed text for keyboard navigation.
navigation:
  icon: i-lucide-keyboard
  badge:
    label: NEW
    color: success
---

`useTypeahead` collects text and clears it after a pause. Use it for custom menus or lists. It does not attach keyboard listeners, choose matches, or move focus.

## Usage

Normalize text before calling `push`. Ignore modifier keys and editing targets in your own keyboard handler.

```vue
<script setup lang="ts">
import { useTypeahead } from "akaza-ui";

const { query, push, reset } = useTypeahead({ timeout: 500 });

function onKeydown(event: KeyboardEvent) {
  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
  push(event.key.toLocaleLowerCase());
}
</script>

<template>
  <button
    type="button"
    @keydown="onKeydown"
    @blur="reset"
  >
    Type to build a query
  </button>
  <output>{{ query }}</output>
</template>
```

Match the returned query against your items, then apply your control's focus or selection rules. Existing Akaza components already handle their own typeahead; consumers do not need to wire this helper into them.

### Repeated Characters

Set `resetOnRepeatedCharacter: true` to keep repeated letters as a single-character query. For example, consecutive `a` presses return `a`, not `aa`. Your matching code must search after the current item to cycle through matches. The default keeps repeated characters.

## API Reference

```ts
function useTypeahead(options?: UseTypeaheadOptions): UseTypeaheadReturn;
```

| Option                     | Type                       | Default | Description                                                                                            |
| -------------------------- | -------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `timeout`                  | `MaybeRefOrGetter<number>` | `500`   | Milliseconds before clearing. Read on each nonempty `push`; changes do not reschedule a pending timer. |
| `resetOnRepeatedCharacter` | `boolean`                  | `false` | Restart a query containing only repetitions of the new character. Set when creating the composable.    |

| Return  | Type                       | Description                                                                                                       |
| ------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `query` | `Readonly<Ref<string>>`    | Current buffered text.                                                                                            |
| `push`  | `(text: string) => string` | Append normalized text, restart the timer, and return the query. Empty text leaves the query and timer unchanged. |
| `reset` | `() => void`               | Clear text and cancel the timer.                                                                                  |

## SSR and Scope

Call in component setup or an active Vue effect scope. Timers are canceled when that scope stops. Creating the composable does not access the DOM or schedule a timer, so it is safe during SSR. Call `push` from client interaction handlers.
