---
title: useToast
description: Manage notification queues, actions, timers, and promise results.
navigation:
  icon: i-lucide-bell
---

`useToast()` returns a notification manager. [Toast](/components/toast) renders its queue and handles announcements, focus, swipe dismissal, and transitions. Mount a viewport for each manager you want to display.

## Usage

Capture the manager in setup. Add notifications from handlers, not while rendering the template.

```vue
<script setup lang="ts">
import { Toast, useToast } from "akaza-ui";

const toast = useToast();

function notify() {
  toast.add({ title: "Changes saved", type: "success" });
}
</script>

<template>
  <button type="button" @click="notify">Save</button>
  <Toast />
</template>
```

The example omits visual styles. Use the Toast component's `ui` prop and slots to style the viewport and notifications.

## Examples

### Update instead of duplicating

Reuse an ID for one notification that changes over time. Calls without an ID create separate messages, even when their text is identical.

```ts
toast.add({ id: "upload", title: "Uploading", duration: 0 });
toast.update({ id: "upload", title: "Upload complete", type: "success", duration: 5000 });
```

Updating restarts the timer and reopens a closing item. Updating an unknown or removed ID does nothing. Use `add` if the item might not exist.

### Type and announcement priority

Visual type does not dictate a color or icon. It is metadata exposed by Toast for your classes and slots. Priority determines screen-reader urgency.

```ts
toast.add({ title: "Connection lost", type: "error" });
toast.add({ title: "Review your settings", type: "warning", priority: "low" });
```

`alert` and `error` default to high priority. Other types default to low. Override priority when a message's urgency differs from its visual type.

### Persistent message with an action

Use `duration: 0` when automatic dismissal would be inappropriate. Toast executes the action; the manager stores its metadata.

```ts
toast.add({
  title: "Project archived",
  duration: 0,
  action: {
    label: "Undo",
    altText: "Restore the archived project",
    closeOnSelect: true,
    onSelect: () => restoreProject(),
  },
});
```

`restoreProject` is application code. The [Toast action lifecycle](/components/toast#action-button) covers async actions and custom slots.

### Promise results

`promise` updates one notification when an existing promise settles. It returns the resolved value and rethrows a rejection, so handle failures in the calling workflow.

```ts
try {
  const project = await toast.promise(saveProject(), {
    loading: { title: "Saving", duration: 0 },
    success: value => ({ title: `Saved ${value.name}`, duration: 5000 }),
    error: { title: "Could not save", duration: 0 },
  });
  openProject(project);
} catch {
  // Keep the editor open so the user can retry.
}
```

`saveProject` and `openProject` belong to your application. The helper accepts a promise, not a request factory, and defaults settled notifications to `success` or `error` unless their options override the type.

## Scoped managers

The following helpers are also public exports. Create a manager in setup to keep queues separate or establish an explicit SSR boundary.

```vue
<script setup lang="ts">
import { createToastManager, provideToastManager, Toast } from "akaza-ui";

const manager = provideToastManager(createToastManager({ duration: 6000 }));

function notify() {
  manager.add({ title: "Workspace saved", type: "success" });
}
</script>

<template>
  <button type="button" @click="notify">Save workspace</button>
  <Toast :manager="manager" />
</template>
```

Descendant setup calls to `useToast()` receive the provided manager. In the providing component itself, use the returned `manager` or `useToast(manager)`. To bypass injection and choose a specific queue, pass its manager explicitly to both `useToast(manager)` and `<Toast :manager="manager" />`.

### createToastManager

```ts
createToastManager(options?: ToastManagerOptions): ToastManager;
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` | `5000` | Default auto-dismiss delay in milliseconds. `0` keeps a notification open. |
| `removeDelay` | `number` | `200` | Delay between entering `closing` and removing the item. Match it to a custom exit animation if needed. |

An independently created manager does not automatically become the default. Connect it through a provider or explicit `manager` prop.

### provideToastManager

```ts
provideToastManager(manager?: ToastManager): ToastManager;
```

Call it in ancestor component setup. Omitting the argument creates a manager with defaults. It returns the manager it provides. Providers belong to a subtree; they are not a process-wide notification store.

## API Reference

### Signature

```ts
useToast(manager?: ToastManager): ToastManager;
```

Resolution order is explicit manager, injected manager, then the default app manager during SSR or shared default in the browser.

### Manager

| Member | Signature | Description |
| --- | --- | --- |
| `toasts` | `ComputedRef<ToastItem[]>` | Open and closing items. Treat the queue as read-only; change it through manager methods. |
| `add` | `<T>(options: ToastAddOptions<T>) => string` | Add a message or update the existing ID; returns its ID. |
| `update` | `<T>(options: ToastUpdateOptions<T>) => void` | Update an existing ID, reopen it, and restart its timer. |
| `close` | `(id, reason?) => void` | Start the closing lifecycle. Default reason: `programmatic`. |
| `remove` | `(id) => void` | Remove immediately, skipping the close lifecycle. |
| `clear` | `(reason?) => void` | Close every current item. |
| `pause` | `() => void` | Pause active timers with their remaining durations. |
| `resume` | `() => void` | Resume timers. |
| `promise` | `<T>(source: Promise<T>, options: ToastPromiseOptions<T>) => Promise<T>` | Add loading state and update on settlement; returns or rethrows the source result. |

Toast's hover and focus behavior already pauses its manager. Use `pause` and `resume` only when an application-owned interaction needs the same behavior.

### ToastAddOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | Generated | Stable identifier; a repeated ID updates rather than duplicates. |
| `title` | `string` | - | Title text. |
| `description` | `string` | - | Supporting message text. |
| `type` | `ToastType` | `status` | `status`, `alert`, `success`, `info`, `warning`, or `error`. |
| `priority` | `ToastPriority` | Derived from type | `low` for polite announcements, `high` for assertive announcements. |
| `duration` | `number` | Manager duration | Auto-dismiss milliseconds. `0` is persistent. |
| `action` | `ToastAction` | - | Action metadata consumed by Toast. |
| `data` | `T` | - | Application data exposed through Toast slots. |
| `onClose` | `(reason: ToastCloseReason) => void` | - | Runs when closing starts. |
| `onRemove` | `() => void` | - | Runs after removal. |

### Action, updates, and lifecycle

`ToastAction` requires `label` and `onSelect(event?)`. Optional `altText` explains the action to assistive technology. `closeOnSelect` defaults to closing after a successful action; set it to `false` to leave the notification open.

`ToastUpdateOptions<T>` requires `id` and accepts partial item fields except `state` and `updateKey`, which the manager owns. `ToastPromiseOptions<T>` requires `loading`, `success`, and `error`; success and error can be option objects or callbacks.

`ToastItem<T>` contains the add fields plus required `id`, `type`, `priority`, `duration`, `state`, and `updateKey`. State is `open` or `closing`. Close reasons are `action`, `close-button`, `escape`, `swipe`, `timeout`, and `programmatic`.

## SSR and ownership

Call the default `useToast()` in setup and capture it for later handlers. A server call outside setup needs an explicit manager. Create that manager per request or component, never as a module-level SSR singleton. Manager timers run only in the browser.

The composable supplies state, not accessible DOM. Use [Toast](/components/toast) for announcements and dismissal. A custom renderer must implement those behaviors itself.

## Related

- [Toast component, slots, and styling](/components/toast)
- [useOverlay](/composables/use-overlay)
