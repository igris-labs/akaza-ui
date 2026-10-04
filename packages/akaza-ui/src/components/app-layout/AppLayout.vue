<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { AppLayoutConfig, AppLayoutProps, AppLayoutSlots } from ".";
import { useElementSize } from "@vueuse/core";
import { computed, useId, useTemplateRef } from "vue";

const props = withDefaults(defineProps<AppLayoutProps>(), {
  as: "div",
  mainAs: "main",
  scroll: "content",
  viewport: true,
  stickyHeader: false,
  stickyFooter: false,
  stickySides: false,
  safeArea: true,
  skipLink: true,
  skipLabel: "Skip to content",
});
const slots = defineSlots<AppLayoutSlots>();
const headerRef = useTemplateRef<HTMLElement>("header");
const footerRef = useTemplateRef<HTMLElement>("footer");
const mainRef = useTemplateRef<HTMLElement>("main");
const autoId = `akaza-app-layout-main-${useId().replace(/:/g, "")}`;
const mainId = computed(() => props.mainId ?? autoId);
const { height: headerHeight } = useElementSize(headerRef, undefined, { box: "border-box" });
const { height: footerHeight } = useElementSize(footerRef, undefined, { box: "border-box" });
const layout = computed<Required<AppLayoutConfig>>(() => ({
  header: props.layout?.header ?? "full",
  footer: props.layout?.footer ?? "full",
  left: props.layout?.left ?? "inline",
  right: props.layout?.right ?? "inline",
}));
const slotProps = computed(() => ({ mainId: mainId.value, layout: layout.value, scroll: props.scroll }));
// Slot availability can change without changing props; resolve grid areas on each render.
function getRootStyle(): CSSProperties {
  const left = slots.left && layout.value.left === "inline" ? "left" : ".";
  const right = slots.right && layout.value.right === "inline" ? "right" : ".";
  const header = slots.header ? "header" : ".";
  const footer = slots.footer ? "footer" : ".";
  const top = layout.value.header === "full" ? `${header} ${header} ${header}` : `${left} ${header} ${right}`;
  const bottom = layout.value.footer === "full" ? `${footer} ${footer} ${footer}` : `${left} ${footer} ${right}`;
  return {
    gridTemplateAreas: `"${top}" "${left} main ${right}" "${bottom}"`,
    "--akaza-app-layout-header-height": `${headerHeight.value}px`,
    "--akaza-app-layout-footer-height": `${footerHeight.value}px`,
    "--akaza-app-layout-side-top": layout.value.header === "full" ? `${headerHeight.value}px` : "0px",
    "--akaza-app-layout-side-bottom": layout.value.footer === "full" ? `${footerHeight.value}px` : "0px",
    "--akaza-app-layout-sticky-top": props.stickyHeader && layout.value.header === "full" ? `${headerHeight.value}px` : "0px",
    "--akaza-app-layout-sticky-bottom": props.stickyFooter && layout.value.footer === "full" ? `${footerHeight.value}px` : "0px",
  } as CSSProperties;
}

function focusMain() {
  mainRef.value?.focus?.({ preventScroll: true });
}

defineExpose({ main: mainRef, focusMain });
</script>

<template>
  <component
    :is="as"
    :class="ui?.root"
    :style="getRootStyle()"
    class="akaza-app-layout"
    :data-akaza-scroll="scroll"
    :data-akaza-viewport="viewport || undefined"
    :data-akaza-safe-area="safeArea || undefined"
    :data-akaza-header="layout.header"
    :data-akaza-footer="layout.footer"
  >
    <a
      v-if="skipLink"
      :href="`#${mainId}`"
      :class="ui?.skipLink"
      class="akaza-app-layout-skip-link"
      @click.prevent="focusMain"
    >{{ skipLabel }}</a>
    <header
      v-if="$slots.header"
      ref="header"
      :class="ui?.header"
      class="akaza-app-layout-header"
      :data-akaza-span="layout.header"
      :data-akaza-sticky="scroll === 'page' && stickyHeader || undefined"
    >
      <slot name="header" v-bind="slotProps" />
    </header>
    <div
      v-if="$slots.left"
      :class="ui?.left"
      class="akaza-app-layout-left"
      data-akaza-side="left"
      :data-akaza-mode="layout.left"
      :data-akaza-sticky="scroll === 'page' && stickySides && layout.left === 'inline' || undefined"
    >
      <slot name="left" v-bind="slotProps" />
    </div>
    <component
      :is="mainAs"
      :id="mainId"
      ref="main"
      :aria-label="mainLabel"
      :role="mainAs !== 'main' && mainLabel ? 'region' : undefined"
      :class="ui?.main"
      class="akaza-app-layout-main"
      :tabindex="scroll === 'content' ? 0 : -1"
    >
      <slot v-bind="slotProps" />
    </component>
    <div
      v-if="$slots.right"
      :class="ui?.right"
      class="akaza-app-layout-right"
      data-akaza-side="right"
      :data-akaza-mode="layout.right"
      :data-akaza-sticky="scroll === 'page' && stickySides && layout.right === 'inline' || undefined"
    >
      <slot name="right" v-bind="slotProps" />
    </div>
    <footer
      v-if="$slots.footer"
      ref="footer"
      :class="ui?.footer"
      class="akaza-app-layout-footer"
      :data-akaza-span="layout.footer"
      :data-akaza-sticky="scroll === 'page' && stickyFooter || undefined"
    >
      <slot name="footer" v-bind="slotProps" />
    </footer>
  </component>
</template>

<style>
@layer akaza-reset {
  .akaza-app-layout {
    box-sizing: border-box;
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, max-content) minmax(0, 1fr) minmax(0, max-content);
    grid-template-rows: auto minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
  }
  .akaza-app-layout[data-akaza-scroll="content"] {
    height: 100%;
    overflow: clip;
  }
  .akaza-app-layout[data-akaza-scroll="content"][data-akaza-viewport] {
    height: 100dvh;
  }
  .akaza-app-layout[data-akaza-scroll="page"][data-akaza-viewport] {
    min-height: 100dvh;
  }
  .akaza-app-layout[data-akaza-safe-area] {
    --akaza-app-layout-safe-top: env(safe-area-inset-top, 0px);
    --akaza-app-layout-safe-bottom: env(safe-area-inset-bottom, 0px);
    --akaza-app-layout-safe-left: env(safe-area-inset-left, 0px);
    --akaza-app-layout-safe-right: env(safe-area-inset-right, 0px);
    padding-top: env(safe-area-inset-top, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
  }
  .akaza-app-layout-header {
    grid-area: header;
    min-width: 0;
  }
  .akaza-app-layout-footer {
    grid-area: footer;
    min-width: 0;
  }
  .akaza-app-layout-main {
    grid-area: main;
    min-width: 0;
    min-height: 0;
  }
  .akaza-app-layout[data-akaza-scroll="content"] > .akaza-app-layout-main {
    overflow: auto;
    overscroll-behavior: contain;
  }
  .akaza-app-layout-left,
  .akaza-app-layout-right {
    display: flex;
    min-width: 0;
    min-height: 0;
  }
  .akaza-app-layout-left { grid-area: left; }
  .akaza-app-layout-right { grid-area: right; }
  .akaza-app-layout-left[data-akaza-mode="overlay"],
  .akaza-app-layout-right[data-akaza-mode="overlay"] {
    position: absolute;
    grid-area: auto;
    top: calc(var(--akaza-app-layout-side-top) + var(--akaza-app-layout-safe-top, 0px));
    bottom: calc(var(--akaza-app-layout-side-bottom) + var(--akaza-app-layout-safe-bottom, 0px));
    max-width: 100%;
    z-index: var(--akaza-app-layout-side-z-index, 1);
  }
  .akaza-app-layout-left[data-akaza-mode="overlay"] { left: var(--akaza-app-layout-safe-left, 0px); }
  .akaza-app-layout-right[data-akaza-mode="overlay"] { right: var(--akaza-app-layout-safe-right, 0px); }
  .akaza-app-layout-header[data-akaza-sticky],
  .akaza-app-layout-footer[data-akaza-sticky] {
    position: sticky;
    z-index: var(--akaza-app-layout-bar-z-index, 2);
  }
  .akaza-app-layout-header[data-akaza-sticky] { top: 0; }
  .akaza-app-layout-footer[data-akaza-sticky] { bottom: 0; }
  .akaza-app-layout-left[data-akaza-sticky],
  .akaza-app-layout-right[data-akaza-sticky] {
    position: sticky;
    align-self: start;
    top: var(--akaza-app-layout-sticky-top);
    height: calc(100dvh - var(--akaza-app-layout-sticky-top) - var(--akaza-app-layout-sticky-bottom));
  }
  .akaza-app-layout-skip-link:not(:focus) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
  .akaza-app-layout-skip-link:focus {
    position: absolute;
    top: 0;
    left: 0;
    z-index: var(--akaza-app-layout-skip-z-index, 3);
  }
}
</style>
