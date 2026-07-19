import type { MenuItem, MenuUi } from "../menu";

export { default as ContextMenu } from "./ContextMenu.vue";

export interface ContextMenuUi extends MenuUi {
  root?: string;
  content?: string;
}

export interface ContextMenuProps {
  /** Menu items - flat array or grouped array. */
  items?: MenuItem[] | MenuItem[][];
  /** Disable context-menu opening. */
  disabled?: boolean;
  /** Close the menu when an action item is selected. @default true */
  closeOnSelect?: boolean;
  /** Radio group state - keyed by radioGroup name. */
  radioValues?: Record<string, string>;
  /** Gap between pointer and menu in px. @default 4 */
  sideOffset?: number;
  /** Open after a touch/pen press. Set `0` to disable. @default 700 */
  longPressDelay?: number;
  /** Restore focus to the invoking element after keyboard close or selection. @default true */
  restoreFocus?: boolean;
  /** Teleport target. Set false to render inline. @default 'body' */
  teleport?: string | false;
  /** UI class overrides. */
  ui?: ContextMenuUi;
}
