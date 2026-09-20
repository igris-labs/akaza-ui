import type { Component, VNodeChild } from "vue";
import type { SidebarState } from "../../composables/sidebar";
import type { AkazaChangeEventDetails } from "../../types";

export { default as Sidebar } from "./Sidebar.vue";

export type SidebarSide = "left" | "right";
export type SidebarCollapsible = false | "icon" | "offcanvas";

export interface SidebarUi {
  root?: string;
  panel?: string;
  header?: string;
  body?: string;
  footer?: string;
  resizeHandle?: string;
  mobileOverlay?: string;
  mobileContent?: string;
  mobileWrapper?: string;
}

export interface SidebarProps {
  as?: Component | string;
  side?: SidebarSide;
  collapsible?: SidebarCollapsible;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsedSize?: number;
  mobileSize?: number;
  resizeStep?: number;
  resizable?: boolean;
  transition?: boolean;
  /** Force mobile or desktop rendering. When omitted, `breakpoint` is observed. */
  mobile?: boolean;
  breakpoint?: string;
  closeOnBackdropClick?: boolean;
  closeOnNavigate?: boolean;
  swipeToClose?: boolean;
  teleport?: string | false;
  /** Ctrl/Command shortcut key. Disabled by default to avoid application conflicts. */
  keyboardShortcut?: string | false;
  ariaLabel?: string;
  resizeAriaLabel?: string;
  ui?: SidebarUi;
}

export interface SidebarSizeChangeEventDetails extends AkazaChangeEventDetails {
  previousSize: number;
}

export type SidebarAction = (reasonOrEvent?: string | Event, event?: Event) => void;

export interface SidebarSlotProps {
  open: boolean;
  collapsed: boolean;
  isMobile: boolean;
  state: SidebarState;
  size: number;
  openMobile: SidebarAction;
  closeMobile: SidebarAction;
  toggleMobile: SidebarAction;
  expand: SidebarAction;
  collapse: SidebarAction;
  toggleCollapsed: SidebarAction;
  toggle: SidebarAction;
  resetSize: SidebarAction;
}

export interface SidebarSlots {
  default?: (props: SidebarSlotProps) => VNodeChild;
  header?: (props: SidebarSlotProps) => VNodeChild;
  footer?: (props: SidebarSlotProps) => VNodeChild;
  /** Content of the generated separator resize handle. */
  "resize-handle"?: (props: SidebarSlotProps) => VNodeChild;
}
