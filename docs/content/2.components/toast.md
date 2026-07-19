---
title: Toast
description: Queued status and alert notifications with stacking, actions, updates, promise state, and swipe dismissal.
navigation:
  icon: i-lucide-message-square
---

`Toast` renders an accessible notification viewport for messages created through `useToast()`. Visual type and announcement urgency are independent, duplicate messages are allowed, stable ids update in place, and timers pause while users inspect the queue.

## Anatomy

- **`#toast`**: Replaces all content inside the library-owned accessible toast root.
- **`#title`**: Replaces title content.
- **`#description`**: Replaces description content.
- **`#close`**: Replaces close-button content.

The viewport and each toast root remain library-owned so live-region, queue, swipe, limit, and lifecycle behavior cannot be removed accidentally.

## Usage

::component-preview
  :::examples-toast-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { Toast, useToast } from "akaza-ui";

const toast = useToast();
</script>

<template>
  <button @click="toast.add({ title: 'Saved', description: 'Settings updated.' })">
    Show toast
  </button>
  <Toast />
</template>
```
::

## Examples

### Visual type and urgency

Use `type` for styling and `priority` for announcement urgency. `error` and `alert` default to high priority; all other types default to low priority.

```ts
toast.add({
  title: "Storage nearly full",
  description: "Less than 10% remains.",
  type: "warning",
  priority: "high",
});
```

### Duplicates and stable updates

Calls without `id` create independent notifications, even when content is identical. Reusing an `id` updates that toast, increments `updateKey`, and restarts its timer.

```ts
toast.add({ title: "Comment received" });
toast.add({ title: "Comment received" }); // Separate toast

toast.add({ id: "sync", title: "Syncing", duration: 0 });
toast.update({ id: "sync", title: "Synced", type: "success", duration: 5000 });
```

### Action button

Actions close after successful completion by default. Set `closeOnSelect: false` to keep the toast open. Rejected actions emit `action-error` and remain visible.

```ts
toast.add({
  title: "Connection lost",
  duration: 0,
  action: {
    label: "Retry",
    altText: "Retry connection",
    onSelect: reconnect,
  },
});
```

### Promise updates

`toast.promise()` preserves one id while the source promise moves from loading to success or error.

```ts
await toast.promise(api.publish(), {
  loading: { title: "Publishing", duration: 0 },
  success: { title: "Published", type: "success" },
  error: { title: "Failed", type: "error" },
});
```

### Custom content

`#toast` owns all inner markup. Root role, live-region attrs, swipe handlers, type/state attrs, and queue metadata remain intact. Notification metadata and the guarded default action lifecycle are exposed directly to custom content.

```vue
<Toast>
  <template #toast="{ toast, type, priority, action, performAction, close }">
    <article :data-type="type" :data-priority="priority">
      <strong>{{ toast.title }}</strong>
      <p>{{ toast.description }}</p>
      <button v-if="action" @click="performAction($event)">{{ action.label }}</button>
      <button @click="close()">Dismiss</button>
    </article>
  </template>
</Toast>
```

### Scoped manager for SSR

Default manager is a convenient client-side singleton. Create and provide a scoped manager for SSR or independent notification regions.

```vue
<script setup lang="ts">
import { createToastManager, provideToastManager, Toast } from "akaza-ui";

const manager = provideToastManager(createToastManager({ duration: 6000 }));
</script>

<template>
  <RouterView />
  <Toast :manager="manager" />
</template>
```

## API Reference

### Toast Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `ToastPosition` | `"bottom-right"` | Fixed viewport position. |
| `limit` | `number` | `3` | Maximum interactive toasts; older items remain mounted but inert. |
| `stack` | `boolean` | `true` | Collapses queue until viewport is hovered or focused. |
| `gap` | `number` | `12` | Expanded distance between adjacent toasts in pixels. |
| `peek` | `number` | `12` | Visible edge between collapsed toasts in pixels. |
| `scaleStep` | `number` | `0.1` | Scale reduction for each toast behind the frontmost toast. |
| `hotkey` | `string[]` | `["F8"]` | Key combination that focuses viewport. |
| `hotkeyLabel` | `string` | `"Notifications"` | Accessible viewport label. |
| `closeLabel` | `string` | `"Dismiss notification"` | Accessible close-button label. |
| `swipeDirection` | `"up" \| "right" \| "down" \| "left"` | inferred from position | Dismiss direction. |
| `swipeThreshold` | `number` | `50` | Required swipe distance in pixels. |
| `pauseOnHover` | `boolean` | `true` | Pauses timers while hovered. |
| `pauseOnFocus` | `boolean` | `true` | Pauses timers while focus is inside viewport. |
| `pauseOnWindowBlur` | `boolean` | `true` | Pauses timers while window/document is inactive. |
| `teleport` | `string \| false` | `"body"` | Teleport target or inline rendering. |
| `manager` | `ToastManager` | injected/default manager | Explicit manager for scoped queues. |
| `ui` | `ToastUi` | — | Classes for generated parts. |

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `action-error` | `(error, toast)` | Action rejected or threw; toast remains open. |
| `swipe-start` | `(toast, event)` | Swipe interaction started. |
| `swipe-move` | `(toast, event)` | Pointer moved during swipe. |
| `swipe-cancel` | `(toast, event)` | Swipe ended below threshold or was canceled. |
| `swipe-end` | `(toast, event)` | Swipe crossed threshold and closed toast. |

### useToast

| Method | Signature | Description |
|--------|-----------|-------------|
| `toasts` | `ComputedRef<ToastItem[]>` | Current open/closing queue. |
| `add` | `(options) => string` | Adds a toast or updates same `id`. |
| `update` | `(options) => void` | Updates an existing toast and restarts timer. |
| `close` | `(id, reason?) => void` | Starts close lifecycle and exit animation. |
| `remove` | `(id) => void` | Removes immediately. |
| `clear` | `(reason?) => void` | Closes all toasts. |
| `pause` | `() => void` | Pauses all active timers with remaining duration. |
| `resume` | `() => void` | Resumes paused timers. |
| `promise` | `(promise, options) => Promise<T>` | Adds loading toast and updates on settle. |

### ToastAddOptions

| Key | Type | Description |
|-----|------|-------------|
| `id` | `string` | Stable id. Same id updates existing toast. |
| `title` | `string` | Toast title. |
| `description` | `string` | Toast body. |
| `type` | `ToastType` | Visual variant exposed as `data-akaza-type`. |
| `priority` | `"low" \| "high"` | Polite or assertive announcement. |
| `duration` | `number` | Auto-dismiss milliseconds; `0` is persistent. |
| `action` | `ToastAction` | Optional action with label, alt text, callback, and close behavior. |
| `data` | `unknown` | Custom data available to slots. |
| `onClose` | `(reason) => void` | Called when close lifecycle begins. |
| `onRemove` | `() => void` | Called after item leaves manager. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `toast` | `toast`, `type`, `priority`, `action`, `attrs`, `close`, `performAction` | Complete inner content override with direct metadata and built-in action lifecycle. |
| `title` | `toast` | Title content. |
| `description` | `toast` | Description content. |
| `close` | `toast` | Close-button content. |

### UI Options

| Key | Description |
|-----|-------------|
| `viewport` | Fixed toast viewport. |
| `toast` | Accessible toast root. |
| `title` | Title element. |
| `description` | Description element. |
| `close` | Close button. |
| `action` | Action button. |

### Styling Hooks

| UI key | CSS class | Data attrs / CSS vars |
|--------|-----------|------------------------|
| `viewport` | `akaza-toast-viewport` | `data-akaza-side`, `data-akaza-align`, `data-akaza-expanded`, `data-akaza-stacked` |
| `toast` | `akaza-toast` | `data-akaza-state`, `data-akaza-type`, `data-akaza-priority`, `data-akaza-expanded`, `data-akaza-behind`, `data-akaza-limited`, `data-akaza-index`, `data-akaza-swipe`, `data-akaza-swipe-direction`, `--akaza-toast-index`, `--akaza-toast-count`, `--akaza-toast-height`, `--akaza-toast-frontmost-height`, `--akaza-toast-offset-y`, `--akaza-toast-stack-y`, `--akaza-toast-scale`, `--akaza-toast-gap`, `--akaza-toast-peek`, `--akaza-toast-swipe-move-x`, `--akaza-toast-swipe-move-y`, `--akaza-toast-duration`, `--akaza-toast-height-duration`, `--akaza-toast-content-duration` |
| `title` | `akaza-toast-title` | — |
| `description` | `akaza-toast-description` | — |
| `close` | `akaza-toast-close` | — |
| `action` | `akaza-toast-action` | — |

Toast geometry follows its viewport edge. Bottom positions enter from below and expand upward; top positions enter from above and expand downward. A new toast slides in while existing toasts move and scale behind it in the same transition. Collapsed toasts expose only a scaled edge while content behind the frontmost toast fades out. The stack uses a `500ms` eased transform, with separate `150ms` height and `250ms` content transitions. Override the duration variables as needed. Active swipe tracking remains immediate, and reduced-motion preference shortens all transitions automatically.

### Keyboard

| Key | Behavior |
|-----|----------|
| `F8` | Focuses and expands viewport by default. |
| `Tab` | Moves through toast actions and close buttons. |
| `Escape` | Closes latest toast while focus is inside viewport. |
