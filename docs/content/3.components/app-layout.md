---
title: App Layout
description: Header, content, sidebars, and footer in one application shell.
navigation:
  icon: i-lucide-panels-top-left
  badge:
    label: NEW
    color: success
---

`AppLayout` arranges a header, main content, sidebars, and footer. Add only the slots you need. Use `Sidebar` in either side slot for collapse, resizing, and mobile dialogs.

## Anatomy

- **`#header`**: Optional header above the workspace or just the content column.
- **`#left`**: Optional left region. A `Sidebar` supplies its own width and responsive behavior.
- **`#default`**: Main content. This region scrolls independently by default.
- **`#right`**: Optional right region, with independent sidebar state.
- **`#footer`**: Optional footer below the workspace or just the content column.

Every slot receives `{ mainId, layout, scroll }`. No layout sub-components are required. The generated main element and keyboard skip link share a unique ID.

## Usage

In the default mode, main content scrolls while the header, sidebars, and footer stay in place. Try the Navigation button to collapse the sidebar. On a narrow browser window, it opens a mobile dialog instead.

::component-preview
  :::examples-app-layout-demo
  :::
::

The preview is styled for this documentation. Code examples show the component structure and behavior without the demo's visual classes. See [Styling](/getting-started/styling) for `ui` and CSS hooks.

::component-code
```vue
<script setup lang="ts">
import type { SidebarController } from "akaza-ui";
import { AppLayout, Sidebar, useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";

const sidebar = useSidebar(useTemplateRef<SidebarController>("navigation"));
</script>

<template>
  <AppLayout>
    <template #header>
      <button type="button" @click="sidebar.toggle">Navigation</button>
      <span>Workspace</span>
    </template>

    <template #left>
      <Sidebar
        ref="navigation"
        collapsible="icon"
        aria-label="Workspace navigation"
      >
        <template #default="{ collapsed, isMobile, closeMobile }">
          <button v-if="isMobile" type="button" @click="closeMobile">Close navigation</button>
          <nav aria-label="Workspace">
            <a href="/projects">{{ collapsed ? 'P' : 'Projects' }}</a>
          </nav>
        </template>
      </Sidebar>
    </template>

    <h1>Projects</h1>
    <p>Application content goes here.</p>

    <template #footer>Ready</template>
  </AppLayout>
</template>
```
::

## How regions fit together

The default arrangement is a full-width header, a middle row containing left / main / right, and a full-width footer. Empty slots do not leave empty columns or bars.

| Setting | What changes |
| --- | --- |
| `header: 'full'` / `footer: 'full'` | The bar spans the layout, including the sidebars. |
| `header: 'content'` / `footer: 'content'` | The bar spans only main. Sidebars extend alongside it. |
| `header: 'left'` / `footer: 'left'` | The bar spans left and main. The right sidebar extends alongside it. |
| `header: 'right'` / `footer: 'right'` | The bar spans main and right. The left sidebar extends alongside it. |
| `left: 'inline'` / `right: 'inline'` | The sidebar takes space beside main. |
| `left: 'overlay'` / `right: 'overlay'` | The sidebar covers main without narrowing it. |
| `scroll="content"` | Main scrolls independently inside the shell. |
| `scroll="page"` | The layout follows document flow. Bars can be sticky. |

Widths come from the contents of each side slot. Header and footer heights are measured automatically. Each Sidebar has its own controller; collapsing one does not collapse the other.

## Layout Builder

Open the [Layout Builder](/builders/layout-builder) to choose regions, arrange both sidebars, test mobile dialogs, and generate Vue code without the preview's styling. For external sidebar controls, see [useSidebar](/composables/use-sidebar).

## Examples

### Header and footer between sidebars

Use `content` when sidebars should extend alongside the bars. `full` spans all three columns. Left and right widths follow the elements placed in those slots, including Sidebar resize and collapse transitions.

::component-preview
  :::examples-app-layout-example{variant="between"}
  :::
::

::component-code
```vue
<AppLayout :layout="{ header: 'content', footer: 'content' }">
  <template #header>Workspace toolbar</template>
  <template #left><Sidebar aria-label="Navigation">Navigation</Sidebar></template>
  <h1>Workspace</h1>
  <template #right><Sidebar side="right" aria-label="Inspector">Inspector</Sidebar></template>
  <template #footer>Workspace status</template>
</AppLayout>
```
::

### Independent header and footer corners

Choose `left` or `right` to span main plus only that side. Header and footer are independent, so either sidebar can extend alongside one bar, both bars, or neither. These values refer to the named left and right slots.

::component-preview
  :::examples-app-layout-example{variant="asymmetric"}
  :::
::

::component-code
```vue
<AppLayout :layout="{ header: 'left', footer: 'right' }">
  <template #header>Header above navigation and main</template>
  <template #left><Sidebar aria-label="Navigation">Navigation</Sidebar></template>
  <h1>Workspace</h1>
  <template #right><Sidebar side="right" aria-label="Inspector">Inspector</Sidebar></template>
  <template #footer>Footer below main and inspector</template>
</AppLayout>
```
::

For a right sidebar beside header, main, and footer, set both bars to `left`. For a left sidebar beside all three, set both to `right`.

### Page scrolling with sticky regions

Set `scroll="page"` for document scrolling. Enable stickiness independently for header, footer, and side regions. `stickyLeft` and `stickyRight` override `stickySides` for each inline side. Sticky side offsets track only the bars that cover that side, including changes to their heights. As with native CSS sticky positioning, the nearest scrolling ancestor determines where regions stick. Footer remains at its natural place at the end of the page until it reaches its sticky boundary.

The contained preview scrolls as a whole; its header stays visible. In a full-screen application, the document scrolls instead.

::component-preview
  :::examples-app-layout-example{variant="page"}
  :::
::

::component-code
```vue
<AppLayout scroll="page" sticky-header sticky-sides>
  <template #header>Page toolbar</template>
  <template #left><Sidebar aria-label="Navigation">Navigation</Sidebar></template>
  <article>Long page content</article>
  <template #footer>Page footer</template>
</AppLayout>
```
::

### Contained workspace

Disable `viewport` when embedding a shell inside another page. Content-scrolling mode then uses the parent's height. Supply a definite height on that parent, or override the root height through `class` / `ui.root`. Nested previews should use `main-as="div"` to avoid a second main landmark.

::component-preview
  :::examples-app-layout-example{variant="contained"}
  :::
::

::component-code
```vue
<div style="height: 24rem">
  <AppLayout :viewport="false" main-as="div" main-label="Workspace preview">
    <template #header>Preview toolbar</template>
    <p>Scrollable preview content</p>
  </AppLayout>
</div>
```
::

### Overlay sides

An overlay side does not reserve a grid column. It sits over main content, beneath full-width bars. Use Sidebar's off-canvas collapse and external controls to show or hide it. Desktop overlay placement is non-modal; mobile Sidebar behavior remains modal with focus trapping and dismissal. Supply a background on the sidebar panel so underlying content does not show through.

Try Navigation to collapse the overlay, then reopen it. Main keeps the same width. This preview starts expanded so you can see the overlay placement.

::component-preview
  :::examples-app-layout-example{variant="overlay"}
  :::
::

::component-code
```vue
<script setup lang="ts">
import type { SidebarController } from "akaza-ui";
import { AppLayout, Sidebar, useSidebar } from "akaza-ui";
import { useTemplateRef } from "vue";

const sidebar = useSidebar(useTemplateRef<SidebarController>("navigation"));
</script>

<template>
  <AppLayout :layout="{ left: 'overlay' }">
    <template #header>
      <button type="button" @click="sidebar.toggle">Navigation</button>
    </template>
    <template #left>
      <Sidebar ref="navigation" collapsible="offcanvas" aria-label="Navigation">
        <template #default="{ isMobile, closeMobile }">
          <button v-if="isMobile" type="button" @click="closeMobile">Close navigation</button>
          Navigation
        </template>
      </Sidebar>
    </template>
    <h1>Workspace</h1>
  </AppLayout>
</template>
```
::

Route handling, navigation selection, and persistence remain application-owned. For controller methods and mobile dismissal, see [Sidebar](/components/sidebar).

## Accessibility and Keyboard

The default shell renders one `header`, `main`, and `footer`. Side wrappers are plain `div` elements so a Sidebar's `aside` or a consumer-owned `nav` does not receive duplicate landmark wrappers. Give each navigation or inspector its own accessible name.

| Key / action | Behavior |
| --- | --- |
| Tab | Reaches the skip link, then application controls in DOM order: header, left, main, right, footer. Main is a tab stop in content-scrolling mode so keyboard users can scroll it. |
| Enter on skip link | Moves focus to main without changing the URL or resetting the workspace scroll position. |
| Page Up / Down, Space, arrows | Native scrolling when focus is inside the scrollable content. Controls retain their own keyboard behavior. |

`main-as="div"` is intended for nested previews or a shell inside an existing main landmark. `focusMain()` is exposed for applications that move focus after a route change. AppLayout itself does not observe routes.

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `string \| Component` | `"div"` | Outer root element. |
| `mainAs` | `string \| Component` | `"main"` | Content element; use a native tag for the exposed focus helper. |
| `layout` | `AppLayoutConfig` | See below | Region span and side placement. Partial objects keep defaults for omitted keys. |
| `scroll` | `"content" \| "page"` | `"content"` | Independent main scrolling or document flow. |
| `viewport` | `boolean` | `true` | Dynamic viewport height in content mode; minimum viewport height in page mode. |
| `stickyHeader` | `boolean` | `false` | Sticky header in page mode. |
| `stickyFooter` | `boolean` | `false` | Sticky footer in page mode. |
| `stickySides` | `boolean` | `false` | Sticky inline sides in page mode. |
| `stickyLeft` | `boolean` | `stickySides` | Override stickiness for the inline left side in page mode. Explicit `false` disables it. |
| `stickyRight` | `boolean` | `stickySides` | Override stickiness for the inline right side in page mode. Explicit `false` disables it. |
| `safeArea` | `boolean` | `true` | Outer device safe-area padding. Consumer padding utilities can override it. |
| `mainId` | `string` | Generated | Main ID and skip-link target. Keep explicit IDs unique. |
| `mainLabel` | `string` | - | Accessible name on content element. |
| `skipLink` | `boolean` | `true` | Render the keyboard skip link. |
| `skipLabel` | `string` | `"Skip to content"` | Skip-link text, including localization. |
| `ui` | `AppLayoutUi` | - | Classes for generated parts. |

### Layout Options

| Key | Values | Default | Description |
| --- | --- | --- | --- |
| `header` | `"full" \| "content" \| "left" \| "right"` | `"full"` | All columns, main only, main plus left, or main plus right. |
| `footer` | `"full" \| "content" \| "left" \| "right"` | `"full"` | All columns, main only, main plus left, or main plus right. |
| `left` | `"inline" \| "overlay"` | `"inline"` | Reserve left width or cover main content. |
| `right` | `"inline" \| "overlay"` | `"inline"` | Reserve right width or cover main content. |

### Slots

All five slots receive `mainId: string`, resolved `layout: Required<AppLayoutConfig>`, and `scroll: AppLayoutScroll`. Slots supply content inside generated region wrappers. Omitted region slots produce no wrappers. Slot-owned controls retain their own event handlers and accessibility.

### Exposed Methods

| Member | Type | Description |
| --- | --- | --- |
| `main` | `HTMLElement \| null` | Main element after mounting. |
| `focusMain()` | `() => void` | Focus main while preserving scroll position. |

AppLayout has no value model or change emits. It derives geometry from props, slots, and region measurements; Sidebar models remain on Sidebar.

### UI Options

| Key | Element |
| --- | --- |
| `root` | Outer CSS grid. |
| `skipLink` | Keyboard skip link. |
| `header` | Header wrapper. |
| `left` | Left region wrapper. |
| `main` | Scrollable main content. |
| `right` | Right region wrapper. |
| `footer` | Footer wrapper. |

Direct `class` and `ui.root` both style the single outer root. AppLayout supplies only positioning, scrolling, visibility, and safe-area mechanics. Supply backgrounds, padding, borders, typography, and visible focus styles through `ui`.

### Styling Hooks

| UI key | CSS class | Data attributes |
| --- | --- | --- |
| `root` | `akaza-app-layout` | `data-akaza-scroll="content\|page"`, `data-akaza-viewport`, `data-akaza-safe-area`, `data-akaza-header="full\|content\|left\|right"`, `data-akaza-footer="full\|content\|left\|right"` |
| `skipLink` | `akaza-app-layout-skip-link` | Native `:focus` / `:focus-visible`. |
| `header` | `akaza-app-layout-header` | `data-akaza-span="full\|content\|left\|right"`, `data-akaza-sticky` |
| `left` | `akaza-app-layout-left` | `data-akaza-side="left"`, `data-akaza-mode="inline\|overlay"`, `data-akaza-sticky` |
| `main` | `akaza-app-layout-main` | Native `:focus` / `:focus-visible`. |
| `right` | `akaza-app-layout-right` | `data-akaza-side="right"`, `data-akaza-mode="inline\|overlay"`, `data-akaza-sticky` |
| `footer` | `akaza-app-layout-footer` | `data-akaza-span="full\|content\|left\|right"`, `data-akaza-sticky` |

No exclusive interaction state exists on AppLayout, so there is no artificial `data-akaza-state`.

### CSS Variables

| Variable | Value / default |
| --- | --- |
| `--akaza-app-layout-header-height` | Measured header border-box height. |
| `--akaza-app-layout-footer-height` | Measured footer border-box height. |
| `--akaza-app-layout-viewport-height` | `100dvh`. Height basis for sticky sides; set it to the parent's height for contained layouts. |
| `--akaza-app-layout-left-top`, `--akaza-app-layout-right-top` | Header offset for each side; zero if header does not cover it. |
| `--akaza-app-layout-left-bottom`, `--akaza-app-layout-right-bottom` | Footer offset for each side; zero if footer does not cover it. |
| `--akaza-app-layout-left-sticky-top`, `--akaza-app-layout-right-sticky-top` | Header offset for each sticky side when that bar is sticky and covers the side. |
| `--akaza-app-layout-left-sticky-bottom`, `--akaza-app-layout-right-sticky-bottom` | Footer offset for each sticky side when that bar is sticky and covers the side. |
| `--akaza-app-layout-side-top`, `--akaza-app-layout-side-bottom` | On each side wrapper, aliases of its own overlay offsets. |
| `--akaza-app-layout-sticky-top`, `--akaza-app-layout-sticky-bottom` | On each side wrapper, aliases of its own sticky offsets. |
| `--akaza-app-layout-side-z-index` | `1` |
| `--akaza-app-layout-bar-z-index` | `2` |
| `--akaza-app-layout-skip-z-index` | `3` |

Overlay side regions use local stacking inside the isolated shell. Sidebar mobile dialogs and NavigationMenu flyouts keep their existing Teleport behavior outside the shell. Use `scroll="page"` if non-teleported popups need to escape the shell's clipped boundary.
