import type { ButtonHTMLAttributes, Component, Ref, VNodeChild } from "vue";
import type { AkazaChangeEventDetails } from "../../types";

export { default as Tree } from "./Tree.vue";

export type TreeKey = string | number;
export type TreeSelection = TreeKey | TreeKey[] | null;
export type TreeSelectionMode = "multiple" | "none" | "single";
export type TreeSelectionBehavior = "replace" | "toggle";
export type TreeSelectionPropagation = "both" | "down" | "none" | "up";
export type TreeSelectionHighlight = "full" | "indented" | "label";
export type TreeOrientation = "horizontal" | "vertical";
export type TreeAccessor<T, TValue> = (keyof T & string) | ((item: T) => TValue);

export interface TreeVirtualOptions {
  itemHeight?: number;
  height?: number;
  overscan?: number;
}

export interface TreeItem {
  id?: TreeKey;
  label?: string;
  children?: TreeItem[];
  disabled?: boolean;
  selectable?: boolean;
  defaultExpanded?: boolean;
  slot?: string;
  [key: string]: unknown;
}

export interface TreeNode<T> {
  readonly item: T;
  readonly key: TreeKey;
  readonly parentKey: TreeKey | null;
  readonly depth: number;
  readonly index: number;
  readonly siblingIndex: number;
  readonly siblingCount: number;
  readonly label: string;
  readonly slot: string | undefined;
  readonly isBranch: boolean;
  readonly isLeaf: boolean;
  readonly isExpanded: boolean;
  readonly isSelected: boolean;
  readonly isIndeterminate: boolean;
  readonly isFocused: boolean;
  readonly isDisabled: boolean;
  readonly isSelectable: boolean;
  readonly isLoading: boolean;
}

export interface TreeNodeActions {
  focus: (event?: Event) => boolean;
  select: (event?: Event) => boolean;
  toggleSelection: (event?: Event) => boolean;
  expand: (event?: Event) => boolean;
  collapse: (event?: Event) => boolean;
  toggleExpanded: (event?: Event) => boolean;
  activate: (event?: Event) => boolean;
}

export interface TreeChangeEventDetails<T> extends AkazaChangeEventDetails {
  key: TreeKey;
  item: T;
}

export interface TreeExpandedChangeEventDetails<T> extends TreeChangeEventDetails<T> {
  expanded: boolean;
}

export interface TreeItemSlotProps<T> {
  item: T;
  node: TreeNode<T>;
  actions: TreeNodeActions;
  toggleProps: ButtonHTMLAttributes;
  tree: TreeController<T>;
}

export interface TreeController<T> {
  readonly visibleNodes: Readonly<Ref<readonly TreeNode<T>[]>>;
  readonly selectedItems: Readonly<Ref<readonly T[]>>;
  readonly selectedKeys: Ref<TreeSelection>;
  readonly expandedKeys: Ref<TreeKey[]>;
  readonly focusedKey: Readonly<Ref<TreeKey | null>>;
  getNode: (key: TreeKey) => TreeNode<T> | undefined;
  getItem: (key: TreeKey) => T | undefined;
  focus: (key?: TreeKey, event?: Event) => boolean;
  select: (key: TreeKey, event?: Event) => boolean;
  toggleSelection: (key: TreeKey, event?: Event) => boolean;
  expand: (key: TreeKey, event?: Event) => boolean;
  collapse: (key: TreeKey, event?: Event) => boolean;
  toggleExpanded: (key: TreeKey, event?: Event) => boolean;
  expandAll: (event?: Event) => boolean;
  collapseAll: (event?: Event) => boolean;
  activate: (key: TreeKey, event?: Event) => boolean;
}

export interface TreeLabels<T> {
  expand?: (item: T) => string;
  collapse?: (item: T) => string;
  loading?: (item: T) => string;
  empty?: string;
}

export interface TreeUi {
  root?: string;
  viewport?: string;
  virtualWrapper?: string;
  item?: string;
  row?: string;
  indent?: string;
  content?: string;
  selection?: string;
  toggle?: string;
  leafSpacer?: string;
  toggleIcon?: string;
  indicator?: string;
  icon?: string;
  text?: string;
  label?: string;
  trailing?: string;
  loading?: string;
  empty?: string;
}

export interface TreeProps<T extends object> {
  items: readonly T[];
  itemKey: TreeAccessor<T, TreeKey>;
  labelKey?: TreeAccessor<T, unknown>;
  childrenKey?: TreeAccessor<T, readonly T[] | undefined>;
  disabledKey?: TreeAccessor<T, unknown>;
  selectableKey?: TreeAccessor<T, unknown>;
  defaultExpandedKey?: TreeAccessor<T, unknown>;
  slotKey?: TreeAccessor<T, unknown>;
  textValue?: (item: T) => string;
  hasChildren?: (item: T) => boolean;
  defaultValue?: TreeSelection;
  defaultExpanded?: TreeKey[];
  loadingKeys?: readonly TreeKey[];
  selectionMode?: TreeSelectionMode;
  selectionBehavior?: TreeSelectionBehavior;
  selectionPropagation?: TreeSelectionPropagation;
  selectionHighlight?: TreeSelectionHighlight;
  selectOnFocus?: boolean;
  expandOnClick?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  typeahead?: boolean;
  transition?: boolean;
  indent?: number;
  orientation?: TreeOrientation;
  dir?: "ltr" | "rtl";
  virtualize?: boolean | TreeVirtualOptions;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  labels?: TreeLabels<T>;
  as?: Component | string;
  ui?: TreeUi;
}

export interface TreeSlots<T> {
  item?: (props: TreeItemSlotProps<T>) => VNodeChild;
  toggle?: (props: TreeItemSlotProps<T>) => VNodeChild;
  indicator?: (props: TreeItemSlotProps<T>) => VNodeChild;
  icon?: (props: TreeItemSlotProps<T>) => VNodeChild;
  label?: (props: TreeItemSlotProps<T>) => VNodeChild;
  trailing?: (props: TreeItemSlotProps<T>) => VNodeChild;
  loading?: (props: TreeItemSlotProps<T>) => VNodeChild;
  empty?: (props: { tree: TreeController<T> }) => VNodeChild;
  [name: `item-${string}`]: ((props: TreeItemSlotProps<T>) => VNodeChild) | undefined;
}
