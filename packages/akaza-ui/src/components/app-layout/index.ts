import type { Component, VNodeChild } from "vue";

export { default as AppLayout } from "./AppLayout.vue";

export type AppLayoutSpan = "full" | "content";
export type AppLayoutSideMode = "inline" | "overlay";
export type AppLayoutScroll = "content" | "page";

/** Region geometry. Sidebar owns its width, collapse state, and mobile behavior. */
export interface AppLayoutConfig {
  header?: AppLayoutSpan;
  footer?: AppLayoutSpan;
  left?: AppLayoutSideMode;
  right?: AppLayoutSideMode;
}

export interface AppLayoutUi {
  root?: string;
  skipLink?: string;
  header?: string;
  left?: string;
  main?: string;
  right?: string;
  footer?: string;
}

export interface AppLayoutProps {
  as?: Component | string;
  mainAs?: Component | string;
  /** Defaults to full-width header/footer and inline side regions. */
  layout?: AppLayoutConfig;
  /** Content scrolling pins surrounding regions; page scrolling uses document flow. */
  scroll?: AppLayoutScroll;
  /** Fill the dynamic viewport. Disable when the parent supplies a height. */
  viewport?: boolean;
  /** Sticky positioning applies only to page scrolling. */
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  stickySides?: boolean;
  /** Apply device safe-area insets to the outer shell. */
  safeArea?: boolean;
  mainId?: string;
  mainLabel?: string;
  /** Built-in keyboard skip link. False removes it. */
  skipLink?: boolean;
  skipLabel?: string;
  ui?: AppLayoutUi;
}

export interface AppLayoutSlotProps {
  mainId: string;
  layout: Required<AppLayoutConfig>;
  scroll: AppLayoutScroll;
}

export interface AppLayoutSlots {
  default?: (props: AppLayoutSlotProps) => VNodeChild;
  header?: (props: AppLayoutSlotProps) => VNodeChild;
  left?: (props: AppLayoutSlotProps) => VNodeChild;
  right?: (props: AppLayoutSlotProps) => VNodeChild;
  footer?: (props: AppLayoutSlotProps) => VNodeChild;
}
