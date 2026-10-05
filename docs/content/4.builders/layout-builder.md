---
title: Layout Builder
description: Arrange an application shell and generate its Vue structure.
navigation:
  icon: i-lucide-layout-dashboard
---

Configure [App Layout](/components/app-layout) and [Sidebar](/components/sidebar) together. Options and preview use matching region colors. The preview shows structure, not application data; generated code includes your chosen props and slots, not its visual styles.

## Build your layout

Change settings in the options above, then inspect the full-width preview below. Options use a responsive grid and stack on small screens.

Header and footer settings sit together, followed by both sidebars and layout behavior. Hidden regions keep their settings visible but disabled; enabling a region restores your previous choices.

Start with an arrangement button to see a complete layout, then change individual settings.

- Enable or hide header, left sidebar, right sidebar, and footer. Main is always present.
- Match each colored marker to its labelled region in the preview. Header is blue, left sidebar green, main indigo, right sidebar amber, and footer rose.
- Choose which sidebar a bar extends over. Header and footer each support both sides, neither side, only left, or only right. Toggle the preview's sidebar buttons to test their independent collapse behavior, or choose Mobile dialogs in Responsive preview.
- Drag a sidebar edge to resize it. Scrolling and sticky options configure the generated application; the structural preview contains no sample data to scroll through.

Use Show code to copy the result. Reset restores the initial configuration and preview state.

::examples-app-layout-builder
::

## What the settings mean

| Setting | Behavior |
| --- | --- |
| Across both sidebars | The bar spans all columns. Both sidebars stop below the header or above the footer. |
| Between sidebars | The bar fits only main. Both sidebars extend alongside it. |
| Above / Below left sidebar | The bar spans left and main. Right sidebar extends alongside it. |
| Above / Below right sidebar | The bar spans main and right. Left sidebar extends alongside it. |
| Take space beside main | Sidebar reserves space; main gets narrower. |
| Overlay main content | Sidebar covers content without reserving space. Supply its background in your application. |
| Scroll main only | Header, footer, and sidebars stay visible within the shell. Only main scrolls. |
| Scroll whole layout | Regions move with the page. Sticky controls appear independently for each bar and inline sidebar. |
| Sticky | Remains visible at its scroll boundary. This is CSS sticky, not viewport-fixed positioning. Surrounding bar offsets are measured per side. |
| Keep a compact rail | Collapsing that desktop sidebar keeps a narrow rail. Its slots decide which labels to hide. |
| Hide completely | Collapsing that desktop sidebar moves it off-canvas. |
| Do not collapse | The desktop sidebar stays expanded. Its preview toggle is disabled; mobile dialogs can still open and close. |
| Follow browser width | Sidebar responds to your browser window width, not this preview's width. |
| Desktop sidebars | Forces desktop behavior, even in a narrow window. |
| Mobile dialogs | Forces modal sidebar behavior for testing; it does not simulate an entire mobile viewport. |

## Example arrangements

- **Right sidebar beside everything:** select Above left sidebar for Header width and Below left sidebar for Footer width. Right then spans beside header, main, and footer.
- **Left sidebar beside everything:** choose the right-side equivalent for both bars.
- **Opposite corners:** choose Above right sidebar for header and Below left sidebar for footer. Left extends up beside header; right extends down beside footer.

For surrounding regions that remain visible, use Scroll main only. For whole-page scrolling, enable the relevant Sticky controls. Neither option requires Quasar's case-sensitive `view` shorthand. Akaza exports readable `layout` values and explicit props instead.

## Use the result

The generated example has a `24rem` parent height, matching `--akaza-app-layout-viewport-height`, and `:viewport="false"` so it can live inside a page. The height variable gives sticky sidebars the contained frame's height rather than the browser's. For a full-screen application, remove that parent and the `viewport` override; sticky sides then use `100dvh`. Add your own styling through `ui`, classes, and slot content.

`useSidebar` is called once per sidebar ref. Keep those controllers separate if your application has both navigation and an inspector. See [useSidebar](/composables/use-sidebar) for its full API.

## Related

- [App Layout API and examples](/components/app-layout)
- [Sidebar API and examples](/components/sidebar)
- [Styling](/getting-started/styling)
