---
title: Sidebar
description: Responsive application sidebar with desktop collapse, resizing, and mobile dialog behavior.
navigation:
  icon: i-lucide-panel-left
  badge:
    label: NEW
    color: success
---

`Sidebar` renders persistent navigation on desktop and reuses modal `Drawer` behavior on small screens. Content stays consumer-owned while Akaza UI manages responsive state, collapse geometry, resizing, focus, dismissal, and accessibility.

## Anatomy

- **`#header`**: Fixed region for branding, workspace controls, or an internal collapse action.
- **`#default`**: Scrollable navigation or application content.
- **`#footer`**: Fixed region for account controls or secondary actions.
- **`#resize-handle`**: Optional content inside the generated accessible resize separator.

Every slot receives responsive state, size, and safe action functions. Toggle controls outside the sidebar should use `v-model` or `useSidebar`; Akaza does not require a separate trigger sub-component.

## Usage

::component-preview
  :::examples-sidebar-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { SidebarController } from "akaza-ui";
import { NavigationMenu, Sidebar, useSidebar } from "akaza-ui";
import { ref, useTemplateRef } from "vue";

const sidebarRef = useTemplateRef<SidebarController>("sidebar");
const selected = ref("dashboard");
const { collapsed, isMobile, open, toggle } = useSidebar(sidebarRef);
const items = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Projects", value: "projects" },
];
</script>

<template>
  <button
    type="button"
    :aria-expanded="isMobile ? open : !collapsed"
    @click="toggle"
  >
    Navigation
  </button>

  <Sidebar
    ref="sidebar"
    collapsible="icon"
    aria-label="Workspace navigation"
  >
    <template #header="{ collapsed: isCollapsed }">
      <Logo />
      <span v-if="!isCollapsed">Workspace</span>
    </template>

    <template #default="{ collapsed: isCollapsed }">
      <NavigationMenu
        v-model="selected"
        orientation="vertical"
        :collapsed="isCollapsed"
        :tooltip="isCollapsed"
        :items="items"
        aria-label="Workspace"
      />
    </template>

    <template #footer>Account</template>
  </Sidebar>
</template>
```
::

## Examples

### Nested navigation

Compose `Sidebar` with a vertical `NavigationMenu` for groups, nested items, active state, badges, collapsed tooltips, and side flyouts. The sidebar owns responsive layout; the navigation menu owns navigation state.

::component-preview
  :::examples-sidebar-navigation-demo
  :::
::

::component-code
```vue
<script setup lang="ts">
import { NavigationMenu, Sidebar } from "akaza-ui";
import { ref } from "vue";

const collapsed = ref(false);
const selected = ref("akaza-ui");
const expanded = ref(["projects"]);
const items = [
  { label: "Overview", value: "overview" },
  {
    label: "Projects",
    value: "projects",
    children: [
      { label: "Akaza UI", value: "akaza-ui" },
      { label: "Website", value: "website" },
    ],
  },
  { label: "Settings", value: "settings" },
];
</script>

<template>
  <Sidebar
    v-model:collapsed="collapsed"
    :mobile="false"
    collapsible="icon"
  >
    <template #header="{ toggleCollapsed }">
      <button type="button" @click="toggleCollapsed">Toggle</button>
    </template>

    <template #default="{ collapsed: isCollapsed }">
      <NavigationMenu
        v-model="selected"
        v-model:expanded="expanded"
        orientation="vertical"
        :collapsed="isCollapsed"
        :tooltip="isCollapsed"
        :items="items"
      />
    </template>
  </Sidebar>
</template>
```
::

### Collapse modes

Use `icon` when compact controls remain usable. Use `offcanvas` when the complete desktop panel should leave the layout.

```vue
<Sidebar v-model:collapsed="collapsed" collapsible="icon" />
<Sidebar v-model:collapsed="hidden" collapsible="offcanvas" />
<Sidebar :collapsible="false" />
```

In icon mode, slot content remains mounted and interactive. Use the slot's `collapsed` value to hide labels or replace content. Off-canvas content becomes `inert` and `aria-hidden` when collapsed.

### Mobile dialog

`breakpoint` controls when the persistent sidebar becomes a modal drawer. `mobile` can override media-query detection for container-based layouts or tests.

```vue
<script setup lang="ts">
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <button :aria-expanded="open" @click="open = true">Open navigation</button>

  <Sidebar
    v-model:open="open"
    breakpoint="(max-width: 64rem)"
    side="left"
    aria-label="Main navigation"
  >
    <nav>...</nav>
  </Sidebar>
</template>
```

Mobile mode traps focus, locks body scrolling, makes the outside tree inert, closes on Escape or backdrop interaction, restores focus, and supports directional swipe dismissal. Activating an unmodified same-window link closes the sidebar by default.

### Resizing

Enable the generated separator with `resizable`. Size uses pixels and supports controlled or uncontrolled state.

```vue
<Sidebar
  v-model:size="size"
  resizable
  :default-size="256"
  :min-size="192"
  :max-size="480"
  :resize-step="8"
>
  <template #resize-handle>
    <span aria-hidden="true" />
  </template>
</Sidebar>
```

The resize handle supports pointer, pen, touch, and keyboard input. Double-click resets to `defaultSize`.

### Right sidebar

Placement also changes pointer and keyboard resize direction.

```vue
<Sidebar side="right" collapsible="icon" resizable aria-label="Inspector">
  <template #header>Inspector</template>
  Properties
</Sidebar>
```

### Keyboard shortcut

Global shortcuts are opt-in to avoid application conflicts. `keyboardShortcut="b"` uses Command+B on macOS and Ctrl+B elsewhere.

```vue
<Sidebar keyboard-shortcut="b" collapsible="icon" />
```

Shortcuts are ignored while focus is inside an input, textarea, select, or editable element.

### Custom behavior with `useSidebar`

Pass a component ref when controls live outside a sidebar. Each composable instance controls only the referenced sidebar, so an application can manage multiple sidebars independently.

```vue
<script setup lang="ts">
import type { SidebarController } from "akaza-ui";
import { Sidebar, useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";

const sidebarRef = useTemplateRef<SidebarController>("sidebar");
const sidebar = useSidebar(sidebarRef);
</script>

<template>
  <button type="button" @click="sidebar.toggle()">Toggle navigation</button>
  <Sidebar ref="sidebar" collapsible="icon">...</Sidebar>
</template>
```

For state owned outside the component, `useSidebar({ open, collapsed, breakpoint })` remains available. Persistence and route watching remain application concerns.

## `useSidebar`

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
  <button type="button" @click="primary.toggle()">Toggle navigation</button>
  <button type="button" @click="inspector.toggle()">Toggle inspector</button>

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

Component ref mode delegates through `Sidebar` events. `open-change`, `collapsed-change`, and `size-change` listeners can still cancel changes.

### Exported types

| Type | Description |
|------|-------------|
| `SidebarController` | Public `Sidebar` instance contract used with `useTemplateRef`. |
| `SidebarTarget` | Read-only ref containing a `SidebarController`, `null`, or `undefined`. |
| `UseSidebarOptions` | Controlled state mode options. |
| `UseSidebarReturn` | Shared state and actions returned by controlled state mode. |
| `UseSidebarTargetReturn` | Component ref return type, including `size` and `resetSize`. |

## API Reference

### Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `v-model:open` | `boolean` | `defaultOpen` | Mobile dialog visibility. |
| `v-model:collapsed` | `boolean` | `defaultCollapsed` | Desktop collapse state. Ignored when `collapsible` is `false`. |
| `v-model:size` | `number` | `defaultSize` | Expanded desktop width in pixels. |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `Component \| string` | `"aside"` | Desktop panel element. |
| `side` | `"left" \| "right"` | `"left"` | Sidebar edge. |
| `collapsible` | `false \| "icon" \| "offcanvas"` | `false` | Desktop collapse behavior. |
| `defaultOpen` | `boolean` | `false` | Initial uncontrolled mobile visibility. |
| `defaultCollapsed` | `boolean` | `false` | Initial uncontrolled desktop collapse state. |
| `defaultSize` | `number` | `256` | Initial expanded width in pixels. |
| `minSize` | `number` | `192` | Minimum resized width. |
| `maxSize` | `number` | `480` | Maximum resized width. |
| `collapsedSize` | `number` | `48` | Width in icon collapse mode. |
| `mobileSize` | `number` | `288` | Mobile drawer width. |
| `resizeStep` | `number` | `8` | Keyboard resize amount in pixels. Shift multiplies it by ten. |
| `resizable` | `boolean` | `false` | Render the accessible resize separator. |
| `transition` | `boolean` | `true` | Enable desktop width and off-canvas transitions. |
| `mobile` | `boolean` | media query | Force mobile or desktop rendering. |
| `breakpoint` | `string` | `"(max-width: 767px)"` | Media query used when `mobile` is omitted. |
| `closeOnBackdropClick` | `boolean` | `true` | Close the mobile dialog on backdrop interaction. |
| `closeOnNavigate` | `boolean` | `true` | Close mobile mode after activating a same-window link. |
| `swipeToClose` | `boolean` | `true` | Enable directional mobile swipe dismissal. |
| `teleport` | `string \| false` | `"body"` | Mobile drawer Teleport target. |
| `keyboardShortcut` | `string \| false` | `false` | Command/Ctrl shortcut key for responsive toggle. |
| `ariaLabel` | `string` | `"Sidebar"` | Desktop landmark and mobile dialog accessible name. |
| `resizeAriaLabel` | `string` | `"Resize sidebar"` | Resize separator accessible name. |
| `ui` | `SidebarUi` | — | Classes for named structural parts. |

### Slots

| Slot | Scoped props | Description |
|------|-------------|-------------|
| `header` | `SidebarSlotProps` | Fixed header region. |
| `default` | `SidebarSlotProps` | Scrollable body region. |
| `footer` | `SidebarSlotProps` | Fixed footer region. |
| `resize-handle` | `SidebarSlotProps` | Content inside the generated separator handle. |

`SidebarSlotProps` exposes `open`, `collapsed`, `isMobile`, `state`, `size`, `openMobile`, `closeMobile`, `toggleMobile`, `expand`, `collapse`, `toggleCollapsed`, `toggle`, and `resetSize`. On mobile, `collapsed` is always `false`.

### Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `open-change` | `[open, details]` | Cancelable mobile visibility change. |
| `collapsed-change` | `[collapsed, details]` | Cancelable desktop collapse change. |
| `size-change` | `[size, details]` | Cancelable pointer, keyboard, or reset size change. Details include `previousSize`. |

### Exposed methods

| Method | Description |
|--------|-------------|
| `open` / `openMobile` | Open mobile visibility. `open` is a concise alias. |
| `close` / `closeMobile` | Close mobile visibility. `close` is a concise alias. |
| `toggleMobile` | Toggle mobile visibility regardless of responsive state. |
| `toggle` | Toggle mobile visibility or desktop collapse based on responsive state. |
| `expand` / `collapse` | Change desktop collapse state. |
| `toggleCollapsed` | Toggle desktop collapse state. |
| `resetSize` | Restore `defaultSize`. |

### Exposed values

| Value | Type | Description |
|-------|------|-------------|
| `openValue` | `boolean` | Current mobile visibility. |
| `collapsedValue` | `boolean` | Current desktop collapse value. |
| `sizeValue` | `number` | Current expanded width in pixels. |
| `isMobile` | `boolean` | Current responsive mode. |
| `state` | `SidebarState` | Current `open`, `closed`, `expanded`, or `collapsed` state. |

Prefer `useSidebar(sidebarRef)` when consuming these values outside the component.

### UI Options

| Key | Description |
|-----|-------------|
| `root` | Responsive root and desktop width container. |
| `panel` | Desktop panel or inner mobile panel. |
| `header` | Fixed header region. |
| `body` | Scrollable body region. |
| `footer` | Fixed footer region. |
| `resizeHandle` | Accessible resize separator. |
| `mobileOverlay` | Mobile modal backdrop. |
| `mobileContent` | Mobile Drawer dialog panel. |
| `mobileWrapper` | Structural wrapper inside the mobile Drawer. |

### Styling Hooks

| UI key | CSS class | Data attrs |
|--------|-----------|------------|
| `root` | `akaza-sidebar-root` | `data-akaza-state`, `data-akaza-side`, `data-akaza-mobile`, `data-akaza-collapsible`, `data-akaza-collapsed`, `data-akaza-resizing`, `data-akaza-transition` |
| `panel` | `akaza-sidebar-panel` | `data-akaza-state`, `data-akaza-side`, `data-akaza-mobile` |
| `header` | `akaza-sidebar-header` | — |
| `body` | `akaza-sidebar-body` | — |
| `footer` | `akaza-sidebar-footer` | — |
| `resizeHandle` | `akaza-sidebar-resize-handle` | `data-akaza-side`, `data-akaza-resizing` |
| `mobileOverlay` | `akaza-sidebar-mobile-overlay` | Drawer `data-akaza-state` is also available on the same element. |
| `mobileContent` | `akaza-sidebar-mobile-content` | Drawer `data-akaza-state` and `data-akaza-side` are also available on the same element. |
| `mobileWrapper` | `akaza-sidebar-mobile-wrapper` | — |

Width and motion can also be configured through `--akaza-sidebar-size`, `--akaza-sidebar-collapsed-size`, `--akaza-sidebar-mobile-size`, `--akaza-sidebar-transition-duration`, and `--akaza-sidebar-transition-easing`.

Plain `class` applies to the single root. Use `ui` for the panel, regions, resize handle, and teleported mobile parts.

### Keyboard

| Key | Behavior |
|-----|----------|
| `Arrow Left` / `Arrow Right` | Resize by `resizeStep`; direction follows sidebar placement. |
| `Shift + Arrow Left` / `Shift + Arrow Right` | Resize by ten times `resizeStep`. |
| `Home` / `End` | Resize to minimum or maximum width. |
| `Escape` | Close mobile mode and restore focus. |
| `Tab` / `Shift + Tab` | Remain inside the open mobile dialog. |
| `Command/Ctrl + configured key` | Toggle current responsive state when `keyboardShortcut` is enabled. |

Pointer, pen, and touch input can resize the desktop separator. Mobile mode supports backdrop and swipe dismissal. Desktop mode remains non-modal and never traps focus.
