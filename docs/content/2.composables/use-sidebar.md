---
title: useSidebar
description: Control one Sidebar instance or share responsive sidebar state.
navigation:
  icon: i-lucide-panel-left
---

`useSidebar` connects external controls to a [Sidebar](/components/sidebar). Pass its component ref to control that specific instance. Pass an options object when your application owns the state.

Import the composable and its types from `akaza-ui`; the Nuxt module registers components, not composable auto-imports.

## Usage

`useSidebar` has two overloads. Pass a `Sidebar` component ref to control one rendered instance, or pass an options object when the application owns the state.

```ts
function useSidebar(target: SidebarTarget): UseSidebarTargetReturn;
function useSidebar(options?: UseSidebarOptions): UseSidebarReturn;
```

### Component ref mode

Use this mode for external controls, multiple sidebars, or access to the rendered sidebar's responsive and size state.

```vue
<script setup lang="ts">
import type { SidebarController } from "akaza-ui";
import { Sidebar, useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";

const primaryRef = useTemplateRef<SidebarController>("primary");
const inspectorRef = useTemplateRef<SidebarController>("inspector");

const primary = useSidebar(primaryRef);
const inspector = useSidebar(inspectorRef);
</script>

<template>
  <button type="button" @click="primary.toggle">Toggle navigation</button>
  <button type="button" @click="inspector.toggle">Toggle inspector</button>

  <Sidebar ref="primary" collapsible="icon">...</Sidebar>
  <Sidebar ref="inspector" side="right" collapsible="offcanvas">...</Sidebar>
</template>
```

Each controller delegates only to its referenced instance. Calls made before that instance mounts are ignored.

### Controlled state mode

Use this mode when state must exist before the component mounts or must be shared with storage, routing, or other application logic. Pass the same refs to `Sidebar` models.

```vue
<script setup lang="ts">
import { Sidebar, useSidebar } from "akaza-ui";
import { ref } from "vue";

const open = ref(false);
const collapsed = ref(false);
const { isMobile, state, toggle } = useSidebar({
  open,
  collapsed,
  breakpoint: "(max-width: 767px)",
});
</script>

<template>
  <button type="button" @click="toggle">Toggle sidebar</button>
  <output>{{ state }}</output>

  <Sidebar
    v-model:open="open"
    v-model:collapsed="collapsed"
    :mobile="isMobile"
    collapsible="icon"
  >
    ...
  </Sidebar>
</template>
```

This mode updates the supplied refs directly. The composable does not emit component events; the connected `Sidebar` models receive the resulting values.

## API Reference

### Options

These options apply to controlled state mode.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `open` | `Ref<boolean>` | Internal `false` ref | Mobile dialog visibility. |
| `collapsed` | `Ref<boolean>` | Internal `false` ref | Desktop collapse state. |
| `breakpoint` | `MaybeRefOrGetter<string>` | `"(max-width: 767px)"` | Media query used to calculate `isMobile`. |
| `mobile` | `MaybeRefOrGetter<boolean \| undefined>` | Media query result | Overrides responsive detection. Useful for container layouts, SSR-owned state, and tests. |

### Return value

| Property | Type | Available | Description |
|----------|------|-----------|-------------|
| `open` | `Ref<boolean>` | Both modes | Writable mobile visibility. In component ref mode, writes use the component's cancelable change path. |
| `collapsed` | `Ref<boolean>` | Both modes | Writable desktop collapse state. In component ref mode, writes use the component's cancelable change path. |
| `isMobile` | `ComputedRef<boolean>` | Both modes | Current responsive mode. |
| `state` | `ComputedRef<"open" \| "closed" \| "expanded" \| "collapsed">` | Both modes | Normalized responsive state. |
| `size` | `ComputedRef<number>` | Component ref | Current expanded width in pixels. Read-only; use `v-model:size` for arbitrary size changes. |
| `openMobile()` | `() => void` | Both modes | Open mobile dialog state. |
| `closeMobile()` | `() => void` | Both modes | Close mobile dialog state. |
| `toggleMobile()` | `() => void` | Both modes | Toggle mobile dialog state regardless of responsive mode. |
| `expand()` | `() => void` | Both modes | Expand desktop state. |
| `collapse()` | `() => void` | Both modes | Collapse desktop state. The component ignores this when `collapsible` is `false`. |
| `toggleCollapsed()` | `() => void` | Both modes | Toggle desktop collapse state regardless of responsive mode. |
| `toggle()` | `() => void` | Both modes | Toggle mobile visibility when mobile; otherwise toggle desktop collapse. |
| `resetSize()` | `() => void` | Component ref | Restore the component's `defaultSize`. |

When no `mobile` override is supplied, controlled mode uses `matchMedia` through VueUse. During SSR it starts in desktop mode and updates after hydration. Supply an SSR-safe `mobile` value when initial responsive markup must be deterministic.

Component ref mode delegates through `Sidebar` events. `open-change`, `collapsed-change`, and `size-change` listeners can still cancel changes. Actions accept `(reasonOrEvent?: string | Event, event?: Event)` in addition to no arguments. Bind directly, for example `@click="sidebar.toggle"`, to retain the original event and the mobile dialog's return-focus target. Calling `sidebar.toggle()` is a programmatic action without a triggering event. Standalone state mode does not emit component events.

### Exported types

| Type | Description |
|------|-------------|
| `SidebarController` | Public `Sidebar` instance contract used with `useTemplateRef`. |
| `SidebarControllerAction` | Event-safe action signature, accepting an optional reason or native event. |
| `SidebarTarget` | Read-only ref containing a `SidebarController`, `null`, or `undefined`. |
| `UseSidebarOptions` | Controlled state mode options. |
| `UseSidebarReturn` | Shared state and actions returned by controlled state mode. |
| `UseSidebarTargetReturn` | Component ref return type, including `size` and `resetSize`. |


## Rendering and ownership

The composable does not render a sidebar, trap focus, or lock scrolling by itself. [Sidebar](/components/sidebar) supplies those behaviors and styling hooks. State mode needs a connected Sidebar, as shown above.

Keep storage, route watching, and keyboard shortcuts in your application or configure the component's existing props. There is no global sidebar singleton.

## Related

- [Sidebar component](/components/sidebar)
- [App Layout](/components/app-layout)
- [Layout Builder](/builders/layout-builder)
