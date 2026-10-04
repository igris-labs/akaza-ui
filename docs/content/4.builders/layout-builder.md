---
title: Layout Builder
description: Arrange an application shell and generate its Vue structure.
navigation:
  icon: i-lucide-layout-dashboard
---

Configure [App Layout](/components/app-layout) and [Sidebar](/components/sidebar) together. The preview uses the docs theme; generated code includes your chosen props and slots, not its visual styles.

## Build your layout

1. Choose which regions to render: header, left sidebar, right sidebar, and footer. Main content is always present.
2. Arrange the bars and sidebars. Each side has independent placement and width. Choose main-only or whole-layout scrolling.
3. Try the preview. Navigation and Inspector toggle their respective sidebars. Drag an edge to resize it, or choose Mobile dialog to test responsive behavior.

Use Show code to copy the result. Reset restores the initial configuration and preview state.

::component-preview
  :::examples-app-layout-builder
  :::
::

## What the settings mean

| Setting | Behavior |
| --- | --- |
| Full layout | Header or footer spans all columns. |
| Main column only | Header or footer fits between the sidebars. |
| Beside main | Sidebar reserves space; main gets narrower. |
| Over main | Sidebar covers content without reserving space. Supply its background in your application. |
| Main-only scrolling | Main scrolls while the surrounding regions stay in place. |
| Whole-layout scrolling | The preview scrolls as a whole. In an application, the document scrolls. Sticky bar controls become available. |
| Keep an icon rail | Collapsing a desktop sidebar keeps its compact content. Your slots decide which labels to hide. |
| Hide the sidebar | Collapsing moves the desktop sidebar off-canvas. |
| Browser breakpoint | Sidebar responds to your browser window width, not this preview's width. |
| Mobile dialog | Forces modal sidebar behavior for testing; it does not simulate an entire mobile viewport. |

## Use the result

The generated example has a `24rem` parent height and `:viewport="false"` so it can live inside a page. For a full-screen application, remove that parent and the `viewport` override. Add your own styling through `ui`, classes, and slot content.

`useSidebar` is called once per sidebar ref. Keep those controllers separate if your application has both navigation and an inspector. See [useSidebar](/composables/use-sidebar) for its full API.

## Related

- [App Layout API and examples](/components/app-layout)
- [Sidebar API and examples](/components/sidebar)
- [Styling](/getting-started/styling)
