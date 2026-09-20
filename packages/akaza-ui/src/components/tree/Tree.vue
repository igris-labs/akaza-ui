<script setup lang="ts" generic="T extends object">
import type { ButtonHTMLAttributes, ComponentPublicInstance, CSSProperties, StyleValue } from "vue";
import type {
  TreeAccessor,
  TreeChangeEventDetails,
  TreeController,
  TreeExpandedChangeEventDetails,
  TreeItemSlotProps,
  TreeKey,
  TreeNode,
  TreeNodeActions,
  TreeProps,
  TreeSelection,
  TreeSlots,
  TreeVirtualOptions,
} from ".";
import { useVirtualList } from "@vueuse/core";
import { computed, nextTick, onBeforeUnmount, onUpdated, ref, useId } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TreeProps<T>>(), {
  labelKey: "label" as keyof T & string,
  childrenKey: "children" as keyof T & string,
  disabledKey: "disabled" as keyof T & string,
  selectableKey: "selectable" as keyof T & string,
  defaultExpandedKey: "defaultExpanded" as keyof T & string,
  slotKey: "slot" as keyof T & string,
  selectionMode: "single",
  selectionBehavior: "toggle",
  selectionPropagation: "none",
  selectionHighlight: "indented",
  selectOnFocus: false,
  expandOnClick: true,
  disabled: false,
  readOnly: false,
  typeahead: true,
  transition: true,
  indent: 16,
  orientation: "vertical",
  dir: "ltr",
  virtualize: false,
  ariaLabel: "Tree",
  as: "div",
});

const emit = defineEmits<{
  "selection-change": [value: TreeSelection, details: TreeChangeEventDetails<T>];
  "expanded-change": [value: TreeKey[], details: TreeExpandedChangeEventDetails<T>];
  "focus-change": [value: TreeKey, details: TreeChangeEventDetails<T>];
  activate: [item: T, details: TreeChangeEventDetails<T>];
}>();

defineSlots<TreeSlots<T>>();

interface InternalNode {
  item: T;
  key: TreeKey;
  parentKey: TreeKey | null;
  depth: number;
  sourceIndex: number;
  siblingIndex: number;
  siblingCount: number;
  label: string;
  slot: string | undefined;
  isBranch: boolean;
  isDisabled: boolean;
  isSelectable: boolean;
}

const model = defineModel<TreeSelection>();
const expandedModel = defineModel<TreeKey[]>("expanded");
const instanceId = `akaza-tree-${useId().replace(/:/g, "")}`;
const itemRefs = new Map<TreeKey, HTMLElement>();
const focusedKey = ref<TreeKey | null>(null);
const selectionAnchor = ref<TreeKey | null>(null);
let typeaheadQuery = "";
let typeaheadTimer: number | undefined;

function readAccessor<TValue>(item: T, accessor: TreeAccessor<T, TValue> | undefined): TValue | undefined {
  if (!accessor) return undefined;
  return typeof accessor === "function"
    ? (accessor as (value: T) => TValue)(item)
    : item[accessor] as TValue | undefined;
}

function resolveKey(item: T): TreeKey {
  const key = readAccessor<TreeKey>(item, props.itemKey);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new TypeError("[akaza-ui] Tree itemKey must resolve to a string or number.");
  }
  return key;
}

function resolveLabel(item: T): string {
  const label = readAccessor<unknown>(item, props.labelKey);
  return label === undefined || label === null ? "" : String(label);
}

function resolveChildren(item: T): readonly T[] {
  const children = readAccessor<readonly T[] | undefined>(item, props.childrenKey);
  return Array.isArray(children) ? children : [];
}

function resolveBoolean(item: T, accessor: TreeAccessor<T, unknown> | undefined, fallback: boolean): boolean {
  const value = readAccessor<unknown>(item, accessor);
  return value === undefined ? fallback : Boolean(value);
}

function resolveSlot(item: T): string | undefined {
  const slot = readAccessor<unknown>(item, props.slotKey);
  return typeof slot === "string" && slot ? slot : undefined;
}

const treeData = computed(() => {
  const nodes: InternalNode[] = [];
  const nodeMap = new Map<TreeKey, InternalNode>();
  const childrenByParent = new Map<TreeKey | null, TreeKey[]>();
  const stack = [...props.items].reverse().map((item, index) => ({
    item,
    parentKey: null as TreeKey | null,
    depth: 1,
    siblingIndex: props.items.length - index - 1,
    siblingCount: props.items.length,
  }));

  while (stack.length) {
    const entry = stack.pop()!;
    const key = resolveKey(entry.item);
    if (nodeMap.has(key)) throw new TypeError(`[akaza-ui] Tree item keys must be unique. Duplicate key: ${String(key)}`);
    const children = resolveChildren(entry.item);
    const node: InternalNode = {
      ...entry,
      key,
      sourceIndex: nodes.length,
      label: resolveLabel(entry.item),
      slot: resolveSlot(entry.item),
      isBranch: children.length > 0 || Boolean(props.hasChildren?.(entry.item)),
      isDisabled: resolveBoolean(entry.item, props.disabledKey, false),
      isSelectable: resolveBoolean(entry.item, props.selectableKey, true),
    };
    nodes.push(node);
    nodeMap.set(key, node);
    const siblings = childrenByParent.get(entry.parentKey) ?? [];
    siblings.push(key);
    childrenByParent.set(entry.parentKey, siblings);

    for (let index = children.length - 1; index >= 0; index--) {
      stack.push({
        item: children[index]!,
        parentKey: key,
        depth: entry.depth + 1,
        siblingIndex: index,
        siblingCount: children.length,
      });
    }
  }

  return { nodes, nodeMap, childrenByParent };
});

const initialExpanded = props.defaultExpanded ?? treeData.value.nodes
  .filter(node => resolveBoolean(node.item, props.defaultExpandedKey, false))
  .map(node => node.key);
const internalSelection = ref<TreeSelection>(props.defaultValue ?? null);
const internalExpanded = ref<TreeKey[]>([...initialExpanded]);
const selectedKeys = computed<TreeSelection>({
  get: () => model.value === undefined ? internalSelection.value : model.value,
  set: (value) => {
    internalSelection.value = value;
    model.value = value;
  },
});
const expandedKeys = computed<TreeKey[]>({
  get: () => expandedModel.value === undefined ? internalExpanded.value : expandedModel.value,
  set: (value) => {
    internalExpanded.value = value;
    expandedModel.value = value;
  },
});
const selectedKeySet = computed(() => {
  const value = selectedKeys.value;
  return new Set<TreeKey>(Array.isArray(value) ? value : value === null || value === undefined ? [] : [value]);
});
const expandedKeySet = computed(() => new Set(expandedKeys.value));
const loadingKeySet = computed(() => new Set(props.loadingKeys ?? []));
const virtualOptions = computed<Required<TreeVirtualOptions>>(() => ({
  itemHeight: typeof props.virtualize === "object" ? props.virtualize.itemHeight ?? 36 : 36,
  height: typeof props.virtualize === "object" ? props.virtualize.height ?? 240 : 240,
  overscan: typeof props.virtualize === "object" ? props.virtualize.overscan ?? 5 : 5,
}));

function childrenOf(key: TreeKey): TreeKey[] {
  return treeData.value.childrenByParent.get(key) ?? [];
}

function descendantKeys(key: TreeKey): TreeKey[] {
  const result: TreeKey[] = [];
  const stack = [...childrenOf(key)].reverse();
  while (stack.length) {
    const childKey = stack.pop()!;
    result.push(childKey);
    stack.push(...childrenOf(childKey).reverse());
  }
  return result;
}

function ancestorKeys(key: TreeKey): TreeKey[] {
  const result: TreeKey[] = [];
  let parentKey = treeData.value.nodeMap.get(key)?.parentKey ?? null;
  while (parentKey !== null) {
    result.push(parentKey);
    parentKey = treeData.value.nodeMap.get(parentKey)?.parentKey ?? null;
  }
  return result;
}

function selectableDescendantKeys(key: TreeKey): TreeKey[] {
  return descendantKeys(key).filter((descendantKey) => {
    const node = treeData.value.nodeMap.get(descendantKey);
    return node && !node.isDisabled && node.isSelectable;
  });
}

const selectionAggregate = computed(() => {
  const result = new Map<TreeKey, { selected: number; total: number }>();
  for (const node of [...treeData.value.nodes].reverse()) {
    let selected = !node.isDisabled && node.isSelectable && selectedKeySet.value.has(node.key) ? 1 : 0;
    let total = !node.isDisabled && node.isSelectable ? 1 : 0;
    for (const childKey of childrenOf(node.key)) {
      const child = result.get(childKey);
      if (!child) continue;
      selected += child.selected;
      total += child.total;
    }
    result.set(node.key, { selected, total });
  }
  return result;
});

function isIndeterminate(key: TreeKey): boolean {
  if (props.selectionMode !== "multiple" || (props.selectionPropagation !== "up" && props.selectionPropagation !== "both")) return false;
  let selected = 0;
  let total = 0;
  for (const childKey of childrenOf(key)) {
    const child = selectionAggregate.value.get(childKey);
    if (!child) continue;
    selected += child.selected;
    total += child.total;
  }
  return selected > 0 && selected < total;
}

const visibleInternalNodes = computed(() => {
  const visible: InternalNode[] = [];
  const visibleKeys = new Set<TreeKey>();
  for (const node of treeData.value.nodes) {
    const parentVisible = node.parentKey === null || visibleKeys.has(node.parentKey);
    const parentExpanded = node.parentKey === null || expandedKeySet.value.has(node.parentKey);
    if (!parentVisible || !parentExpanded) continue;
    visible.push(node);
    visibleKeys.add(node.key);
  }
  return visible;
});

function toPublicNode(node: InternalNode, index = visibleInternalNodes.value.findIndex(item => item.key === node.key)): TreeNode<T> {
  return {
    item: node.item,
    key: node.key,
    parentKey: node.parentKey,
    depth: node.depth,
    index,
    siblingIndex: node.siblingIndex,
    siblingCount: node.siblingCount,
    label: node.label,
    slot: node.slot,
    isBranch: node.isBranch,
    isLeaf: !node.isBranch,
    isExpanded: node.isBranch && expandedKeySet.value.has(node.key),
    isSelected: props.selectionMode !== "none" && selectedKeySet.value.has(node.key),
    isIndeterminate: isIndeterminate(node.key),
    isFocused: focusedKey.value === node.key,
    isDisabled: props.disabled || node.isDisabled,
    isSelectable: !props.disabled && !node.isDisabled && node.isSelectable,
    isLoading: loadingKeySet.value.has(node.key),
  };
}

const visibleNodes = computed<readonly TreeNode<T>[]>(() =>
  visibleInternalNodes.value.map((node, index) => toPublicNode(node, index)),
);
const selectedItems = computed<readonly T[]>(() => props.selectionMode === "none"
  ? []
  : treeData.value.nodes.filter(node => selectedKeySet.value.has(node.key)).map(node => node.item));

const {
  list: virtualRows,
  scrollTo: scrollToVirtualIndex,
  containerProps: virtualContainerProps,
  wrapperProps: virtualWrapperProps,
} = useVirtualList(visibleNodes, {
  itemHeight: () => virtualOptions.value.itemHeight,
  overscan: typeof props.virtualize === "object" ? props.virtualize.overscan ?? 5 : 5,
});
const renderedRows = computed(() => props.virtualize
  ? virtualRows.value
  : visibleNodes.value.map((data, index) => ({ data, index })));
const viewportStyle = computed<StyleValue>(() => props.virtualize
  ? [virtualContainerProps.style, { height: `var(--akaza-tree-virtual-height, ${virtualOptions.value.height}px)` }]
  : undefined);

function eventReason(event: Event | undefined, fallback = "programmatic"): string {
  if (event instanceof KeyboardEvent) return "keyboard";
  if (event instanceof MouseEvent || event?.type.startsWith("pointer")) return "pointer";
  return fallback;
}

function createDetails(node: InternalNode, reason: string, event?: Event) {
  let canceled = false;
  const details: TreeChangeEventDetails<T> = {
    key: node.key,
    item: node.item,
    reason,
    ...(event && { event }),
    cancel: () => {
      canceled = true;
    },
  };
  return { details, canceled: () => canceled };
}

function orderedKeys(keys: Set<TreeKey>): TreeKey[] {
  const known = treeData.value.nodes.map(node => node.key).filter(key => keys.has(key));
  const knownSet = new Set(known);
  return [...known, ...[...keys].filter(key => !knownSet.has(key))];
}

function selectionEqual(left: TreeSelection, right: TreeSelection): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
  }
  return Object.is(left, right);
}

function commitSelection(value: TreeSelection, node: InternalNode, reason: string, event?: Event): boolean {
  if (selectionEqual(selectedKeys.value, value)) return true;
  const change = createDetails(node, reason, event);
  emit("selection-change", value, change.details);
  if (change.canceled()) return false;
  selectedKeys.value = value;
  return true;
}

function applySelectionPropagation(keys: Set<TreeKey>, key: TreeKey, selecting: boolean) {
  if (props.selectionPropagation === "down" || props.selectionPropagation === "both") {
    for (const descendantKey of selectableDescendantKeys(key)) {
      if (selecting) keys.add(descendantKey);
      else keys.delete(descendantKey);
    }
  }
  if (props.selectionPropagation === "up" || props.selectionPropagation === "both") {
    for (const ancestorKey of ancestorKeys(key)) {
      const ancestor = treeData.value.nodeMap.get(ancestorKey);
      if (!ancestor?.isSelectable || ancestor.isDisabled) continue;
      const descendants = selectableDescendantKeys(ancestorKey);
      if (descendants.length > 0 && descendants.every(descendant => keys.has(descendant))) keys.add(ancestorKey);
      else keys.delete(ancestorKey);
    }
  }
}

function selectKey(key: TreeKey, event?: Event, force?: boolean): boolean {
  const node = treeData.value.nodeMap.get(key);
  if (!node || props.disabled || props.readOnly || node.isDisabled || !node.isSelectable || props.selectionMode === "none") return false;
  const reason = eventReason(event);
  if (props.selectionMode === "single") {
    const next = force === false ? null : key;
    const changed = commitSelection(next, node, reason, event);
    if (changed) selectionAnchor.value = key;
    return changed;
  }

  const keys = new Set(selectedKeySet.value);
  let selecting = force ?? !keys.has(key);
  const hasModifier = event instanceof MouseEvent || event instanceof KeyboardEvent
    ? event.ctrlKey || event.metaKey
    : false;
  if (props.selectionBehavior === "replace" && !hasModifier && force === undefined) {
    keys.clear();
    selecting = true;
  }
  if (selecting) keys.add(key);
  else keys.delete(key);
  applySelectionPropagation(keys, key, selecting);
  const changed = commitSelection(orderedKeys(keys), node, reason, event);
  if (changed && !(event instanceof KeyboardEvent && event.shiftKey)) selectionAnchor.value = key;
  return changed;
}

function selectRange(key: TreeKey, event: KeyboardEvent | MouseEvent, anchorKey = selectionAnchor.value): boolean {
  const node = treeData.value.nodeMap.get(key);
  if (!node || props.selectionMode !== "multiple" || props.readOnly) return false;
  const resolvedAnchor = anchorKey
    ?? (Array.isArray(selectedKeys.value) ? selectedKeys.value[selectedKeys.value.length - 1] : selectedKeys.value)
    ?? focusedKey.value;
  const anchorIndex = visibleNodes.value.findIndex(item => item.key === resolvedAnchor);
  const targetIndex = visibleNodes.value.findIndex(item => item.key === key);
  if (anchorIndex < 0 || targetIndex < 0) return selectKey(key, event);
  if (selectionAnchor.value === null && resolvedAnchor !== null && resolvedAnchor !== undefined) selectionAnchor.value = resolvedAnchor;
  const [start, end] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
  const keys = new Set<TreeKey>(event.ctrlKey || event.metaKey ? selectedKeySet.value : []);
  for (const rangeNode of visibleNodes.value.slice(start, end + 1)) {
    if (!rangeNode.isSelectable) continue;
    keys.add(rangeNode.key);
    applySelectionPropagation(keys, rangeNode.key, true);
  }
  return commitSelection(orderedKeys(keys), node, "range", event);
}

function commitExpanded(keys: Set<TreeKey>, node: InternalNode, nextExpanded: boolean, reason: string, event?: Event): boolean {
  const next = orderedKeys(keys);
  if (next.length === expandedKeys.value.length && next.every((key, index) => Object.is(key, expandedKeys.value[index]))) return true;
  const change = createDetails(node, reason, event);
  const details: TreeExpandedChangeEventDetails<T> = { ...change.details, expanded: nextExpanded };
  emit("expanded-change", next, details);
  if (change.canceled()) return false;
  expandedKeys.value = next;
  return true;
}

function setExpanded(key: TreeKey, value: boolean, event?: Event, reason = eventReason(event)): boolean {
  const node = treeData.value.nodeMap.get(key);
  if (!node?.isBranch || props.disabled || node.isDisabled) return false;
  const keys = new Set(expandedKeySet.value);
  if (value) keys.add(key);
  else keys.delete(key);
  return commitExpanded(keys, node, value, reason, event);
}

function toggleExpanded(key: TreeKey, event?: Event): boolean {
  return setExpanded(key, !expandedKeySet.value.has(key), event);
}

function setManyExpanded(value: boolean, event?: Event): boolean {
  const node = treeData.value.nodeMap.get(focusedKey.value ?? treeData.value.nodes[0]?.key ?? "");
  if (!node || props.disabled) return false;
  const keys = value
    ? new Set(treeData.value.nodes.filter(item => item.isBranch && !item.isDisabled).map(item => item.key))
    : new Set<TreeKey>();
  return commitExpanded(keys, node, value, value ? "expand-all" : "collapse-all", event);
}

function expandSiblings(key: TreeKey, event: KeyboardEvent): boolean {
  const node = treeData.value.nodeMap.get(key);
  if (!node) return false;
  const keys = new Set(expandedKeySet.value);
  for (const siblingKey of treeData.value.childrenByParent.get(node.parentKey) ?? []) {
    const sibling = treeData.value.nodeMap.get(siblingKey);
    if (sibling?.isBranch && !sibling.isDisabled) keys.add(siblingKey);
  }
  return commitExpanded(keys, node, true, "expand-siblings", event);
}

function setItemRef(element: Element | ComponentPublicInstance | null, key: TreeKey) {
  if (element) itemRefs.set(key, element as HTMLElement);
  else itemRefs.delete(key);
}

function setViewportRef(element: Element | ComponentPublicInstance | null) {
  virtualContainerProps.ref.value = element as HTMLElement | null;
}

function focusKey(key?: TreeKey, event?: Event, applySelection = true): boolean {
  const target = key === undefined
    ? visibleNodes.value.find(node => node.isSelected && !node.isDisabled) ?? visibleNodes.value.find(node => !node.isDisabled)
    : visibleNodes.value.find(node => Object.is(node.key, key));
  if (!target || target.isDisabled) return false;
  const internal = treeData.value.nodeMap.get(target.key)!;
  if (focusedKey.value !== target.key) {
    const change = createDetails(internal, eventReason(event, "focus"), event);
    emit("focus-change", target.key, change.details);
    if (change.canceled()) return false;
    focusedKey.value = target.key;
  }
  if (applySelection && props.selectOnFocus) selectKey(target.key, event, true);
  if (props.virtualize) scrollToVirtualIndex(target.index);
  nextTick(() => itemRefs.get(target.key)?.focus({ preventScroll: true }));
  return true;
}

function activateKey(key: TreeKey, event?: Event): boolean {
  const node = treeData.value.nodeMap.get(key);
  if (!node || props.disabled || node.isDisabled) return false;
  const change = createDetails(node, eventReason(event, "programmatic"), event);
  emit("activate", node.item, change.details);
  return !change.canceled();
}

function actionsFor(key: TreeKey): TreeNodeActions {
  return {
    focus: event => focusKey(key, event),
    select: event => selectKey(key, event, true),
    toggleSelection: event => selectKey(key, event),
    expand: event => setExpanded(key, true, event),
    collapse: event => setExpanded(key, false, event),
    toggleExpanded: event => toggleExpanded(key, event),
    activate: event => activateKey(key, event),
  };
}

function togglePropsFor(node: TreeNode<T>): ButtonHTMLAttributes {
  const label = node.isExpanded
    ? props.labels?.collapse?.(node.item) ?? `Collapse ${node.label}`
    : props.labels?.expand?.(node.item) ?? `Expand ${node.label}`;
  return {
    type: "button",
    tabindex: -1,
    disabled: node.isDisabled,
    "aria-label": label,
    "aria-expanded": node.isExpanded,
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      toggleExpanded(node.key, event);
      focusKey(node.key, event, false);
    },
  };
}

let tree!: TreeController<T>;

function slotProps(node: TreeNode<T>): TreeItemSlotProps<T> {
  return {
    item: node.item,
    node,
    actions: actionsFor(node.key),
    toggleProps: togglePropsFor(node),
    tree,
  };
}

function itemSlotName(node: TreeNode<T>): "item" | `item-${string}` {
  return node.slot ? `item-${node.slot}` : "item";
}

function itemId(node: TreeNode<T>): string {
  return `${instanceId}-item-${treeData.value.nodeMap.get(node.key)?.sourceIndex ?? node.index}`;
}

function itemStyle(node: TreeNode<T>): CSSProperties {
  const indent = Number.isFinite(props.indent) ? Math.max(0, props.indent) : 16;
  return {
    "--akaza-tree-depth": node.depth,
    "--akaza-tree-indent-offset": `${Math.max(0, node.depth - 1) * indent}px`,
  } as CSSProperties;
}

function isInteractiveTarget(event: MouseEvent): boolean {
  const target = event.target as HTMLElement | null;
  const current = event.currentTarget as HTMLElement | null;
  const interactive = target?.closest("button, a, input, select, textarea, [contenteditable='true'], [data-akaza-tree-ignore]");
  return Boolean(interactive && interactive !== current);
}

function onRowClick(node: TreeNode<T>, event: MouseEvent) {
  if (node.isDisabled || isInteractiveTarget(event)) return;
  const previousFocusedKey = focusedKey.value;
  focusKey(node.key, event, false);
  if (props.expandOnClick && node.isBranch) toggleExpanded(node.key, event);
  if (event.shiftKey && props.selectionMode === "multiple") {
    selectRange(node.key, event, selectionAnchor.value ?? previousFocusedKey);
  } else {
    selectKey(node.key, event, props.selectOnFocus ? true : undefined);
  }
  activateKey(node.key, event);
}

function moveFocus(node: TreeNode<T>, delta: number, event: KeyboardEvent) {
  let index = node.index + delta;
  while (index >= 0 && index < visibleNodes.value.length) {
    const next = visibleNodes.value[index];
    if (next && !next.isDisabled) {
      focusKey(next.key, event, !event.shiftKey);
      if (event.shiftKey) selectRange(next.key, event, selectionAnchor.value ?? node.key);
      return;
    }
    index += delta;
  }
}

function onKeydown(node: TreeNode<T>, event: KeyboardEvent) {
  if (props.disabled) return;
  const nextKey = props.orientation === "vertical" ? "ArrowDown" : props.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
  const previousKey = props.orientation === "vertical" ? "ArrowUp" : props.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
  const expandKey = props.orientation === "vertical" ? props.dir === "rtl" ? "ArrowLeft" : "ArrowRight" : "ArrowDown";
  const collapseKey = props.orientation === "vertical" ? props.dir === "rtl" ? "ArrowRight" : "ArrowLeft" : "ArrowUp";

  if (event.key === nextKey || event.key === previousKey) {
    event.preventDefault();
    moveFocus(node, event.key === nextKey ? 1 : -1, event);
  } else if (event.key === expandKey) {
    event.preventDefault();
    if (node.isBranch && !node.isExpanded) setExpanded(node.key, true, event);
    else if (node.isExpanded) {
      const child = visibleNodes.value
        .slice(node.index + 1)
        .find(item => item.depth === node.depth + 1 && item.parentKey === node.key && !item.isDisabled);
      if (child) focusKey(child.key, event);
    }
  } else if (event.key === collapseKey) {
    event.preventDefault();
    if (node.isBranch && node.isExpanded) setExpanded(node.key, false, event);
    else if (node.parentKey !== null) focusKey(node.parentKey, event);
  } else if (event.key === "Home") {
    event.preventDefault();
    const target = visibleNodes.value.find(item => !item.isDisabled);
    if (target) {
      const anchorKey = selectionAnchor.value ?? node.key;
      focusKey(target.key, event, !event.shiftKey);
      if (event.shiftKey) selectRange(target.key, event, anchorKey);
    }
  } else if (event.key === "End") {
    event.preventDefault();
    const target = [...visibleNodes.value].reverse().find(item => !item.isDisabled);
    if (target) {
      const anchorKey = selectionAnchor.value ?? node.key;
      focusKey(target.key, event, !event.shiftKey);
      if (event.shiftKey) selectRange(target.key, event, anchorKey);
    }
  } else if (event.key === "*") {
    event.preventDefault();
    expandSiblings(node.key, event);
  } else if (event.key === " ") {
    event.preventDefault();
    selectKey(node.key, event);
  } else if (event.key === "Enter") {
    event.preventDefault();
    selectKey(node.key, event, true);
    activateKey(node.key, event);
  } else if (props.selectionMode === "multiple" && event.key.toLowerCase() === "a" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    const keys = new Set(treeData.value.nodes.filter(item => item.isSelectable && !item.isDisabled).map(item => item.key));
    commitSelection(orderedKeys(keys), treeData.value.nodeMap.get(node.key)!, "select-all", event);
  } else if (props.typeahead && event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const character = event.key.toLocaleLowerCase();
    typeaheadQuery = typeaheadQuery && [...typeaheadQuery].every(value => value === character)
      ? character
      : typeaheadQuery + character;
    window.clearTimeout(typeaheadTimer);
    typeaheadTimer = window.setTimeout(() => {
      typeaheadQuery = "";
    }, 500);
    const candidates = [...visibleNodes.value.slice(node.index + 1), ...visibleNodes.value.slice(0, node.index + 1)];
    const match = candidates.find((candidate) => {
      const value = props.textValue?.(candidate.item) ?? candidate.label;
      return !candidate.isDisabled && value.toLocaleLowerCase().startsWith(typeaheadQuery);
    });
    if (match) focusKey(match.key, event);
  }
}

function normalizeFocus() {
  if (!visibleNodes.value.length) {
    focusedKey.value = null;
    return;
  }
  if (focusedKey.value !== null && visibleNodes.value.some(node => node.key === focusedKey.value)) return;
  let key = focusedKey.value;
  while (key !== null) {
    const parentKey = treeData.value.nodeMap.get(key)?.parentKey ?? null;
    if (parentKey !== null && visibleNodes.value.some(node => node.key === parentKey)) {
      focusedKey.value = parentKey;
      return;
    }
    key = parentKey;
  }
  focusedKey.value = visibleNodes.value.find(node => node.isSelected && !node.isDisabled)?.key
    ?? visibleNodes.value.find(node => !node.isDisabled)?.key
    ?? null;
}

function tabIndex(node: TreeNode<T>): 0 | -1 {
  const target = focusedKey.value
    ?? visibleNodes.value.find(item => item.isSelected && !item.isDisabled)?.key
    ?? visibleNodes.value.find(item => !item.isDisabled)?.key;
  return Object.is(node.key, target) ? 0 : -1;
}

function getNode(key: TreeKey): TreeNode<T> | undefined {
  const node = treeData.value.nodeMap.get(key);
  return node ? toPublicNode(node) : undefined;
}

tree = {
  visibleNodes,
  selectedItems,
  selectedKeys,
  expandedKeys,
  focusedKey,
  getNode,
  getItem: key => treeData.value.nodeMap.get(key)?.item,
  focus: focusKey,
  select: (key, event) => selectKey(key, event, true),
  toggleSelection: selectKey,
  expand: (key, event) => setExpanded(key, true, event),
  collapse: (key, event) => setExpanded(key, false, event),
  toggleExpanded,
  expandAll: event => setManyExpanded(true, event),
  collapseAll: event => setManyExpanded(false, event),
  activate: activateKey,
};

defineExpose({
  tree,
  getNode: tree.getNode,
  getItem: tree.getItem,
  focus: tree.focus,
  select: tree.select,
  toggleSelection: tree.toggleSelection,
  expand: tree.expand,
  collapse: tree.collapse,
  toggleExpanded: tree.toggleExpanded,
  expandAll: tree.expandAll,
  collapseAll: tree.collapseAll,
  activate: tree.activate,
});

onUpdated(normalizeFocus);
onBeforeUnmount(() => window.clearTimeout(typeaheadTimer));
</script>

<template>
  <component
    :is="props.as"
    v-bind="$attrs"
    :class="props.ui?.root"
    class="akaza-tree"
    :data-akaza-state="visibleNodes.length ? 'ready' : 'empty'"
    :data-state="visibleNodes.length ? 'ready' : 'empty'"
    :data-akaza-orientation="props.orientation"
    :data-akaza-disabled="props.disabled || undefined"
    :data-akaza-readonly="props.readOnly || undefined"
    :data-akaza-selection-highlight="props.selectionHighlight"
    :data-akaza-transition="props.transition || undefined"
    :dir="props.dir"
  >
    <div
      :ref="setViewportRef"
      role="tree"
      :aria-label="props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby"
      :aria-describedby="props.ariaDescribedby"
      :aria-multiselectable="props.selectionMode === 'multiple' || undefined"
      :aria-orientation="props.orientation"
      :aria-disabled="props.disabled || undefined"
      :aria-readonly="props.readOnly || undefined"
      :class="props.ui?.viewport"
      :style="viewportStyle"
      class="akaza-tree-viewport"
      @scroll="props.virtualize && virtualContainerProps.onScroll()"
    >
      <div v-if="!visibleNodes.length" :class="props.ui?.empty" class="akaza-tree-empty">
        <slot name="empty" :tree="tree">{{ props.labels?.empty ?? "No items." }}</slot>
      </div>
      <div
        v-else
        role="presentation"
        :class="props.ui?.virtualWrapper"
        :style="props.virtualize ? virtualWrapperProps.style : undefined"
        class="akaza-tree-virtual-wrapper"
      >
        <TransitionGroup name="akaza-tree-item" :css="props.transition && !props.virtualize">
          <div
            v-for="row in renderedRows"
            :id="itemId(row.data)"
            :key="row.data.key"
            :ref="element => setItemRef(element, row.data.key)"
            role="treeitem"
            :tabindex="tabIndex(row.data)"
            :aria-level="row.data.depth"
            :aria-posinset="row.data.siblingIndex + 1"
            :aria-setsize="row.data.siblingCount"
            :aria-expanded="row.data.isBranch ? row.data.isExpanded : undefined"
            :aria-selected="props.selectionMode === 'none' || !row.data.isSelectable ? undefined : row.data.isSelected"
            :aria-disabled="row.data.isDisabled || undefined"
            :aria-busy="row.data.isLoading || undefined"
            :class="props.ui?.item"
            :style="itemStyle(row.data)"
            class="akaza-tree-item"
            :data-akaza-state="row.data.isBranch ? row.data.isExpanded ? 'expanded' : 'collapsed' : 'leaf'"
            :data-state="row.data.isBranch ? row.data.isExpanded ? 'expanded' : 'collapsed' : 'leaf'"
            :data-akaza-selected="row.data.isSelected || undefined"
            :data-akaza-indeterminate="row.data.isIndeterminate || undefined"
            :data-akaza-focused="row.data.isFocused || undefined"
            :data-akaza-disabled="row.data.isDisabled || undefined"
            :data-akaza-selectable="row.data.isSelectable || undefined"
            :data-akaza-loading="row.data.isLoading || undefined"
            :data-akaza-depth="row.data.depth"
            @focus="focusKey(row.data.key, $event)"
            @keydown="onKeydown(row.data, $event)"
          >
            <div
              :class="[props.ui?.row, props.selectionHighlight === 'full' && ['akaza-tree-selection', props.ui?.selection]]"
              class="akaza-tree-row"
              :data-akaza-state="row.data.isBranch ? row.data.isExpanded ? 'expanded' : 'collapsed' : 'leaf'"
              :data-akaza-selected="row.data.isSelected || undefined"
              :data-akaza-indeterminate="row.data.isIndeterminate || undefined"
              :data-akaza-focused="row.data.isFocused || undefined"
              :data-akaza-disabled="row.data.isDisabled || undefined"
              :data-akaza-loading="row.data.isLoading || undefined"
              :data-akaza-depth="row.data.depth"
              :data-akaza-selection-highlight="props.selectionHighlight"
              @click="onRowClick(row.data, $event)"
            >
              <span :class="props.ui?.indent" class="akaza-tree-indent" aria-hidden="true" />
              <span
                v-if="!row.data.isBranch"
                :class="[props.ui?.toggle, props.ui?.leafSpacer]"
                class="akaza-tree-toggle akaza-tree-toggle-spacer"
                aria-hidden="true"
              />
              <span
                :class="[props.ui?.content, props.selectionHighlight === 'indented' && ['akaza-tree-selection', props.ui?.selection]]"
                class="akaza-tree-content"
                :data-akaza-selected="row.data.isSelected || undefined"
                :data-akaza-indeterminate="row.data.isIndeterminate || undefined"
                :data-akaza-focused="row.data.isFocused || undefined"
                :data-akaza-selection-highlight="props.selectionHighlight === 'indented' ? 'indented' : undefined"
              >
                <slot :name="itemSlotName(row.data)" v-bind="slotProps(row.data)">
                  <button
                    v-if="row.data.isBranch"
                    v-bind="togglePropsFor(row.data)"
                    :class="props.ui?.toggle"
                    class="akaza-tree-toggle"
                  >
                    <slot name="toggle" v-bind="slotProps(row.data)">
                      <span
                        :class="props.ui?.toggleIcon"
                        class="akaza-tree-toggle-icon"
                        :data-akaza-state="row.data.isExpanded ? 'expanded' : 'collapsed'"
                        aria-hidden="true"
                      >{{ props.dir === "rtl" ? "‹" : "›" }}</span>
                    </slot>
                  </button>

                  <span v-if="$slots.indicator" :class="props.ui?.indicator" class="akaza-tree-indicator">
                    <slot name="indicator" v-bind="slotProps(row.data)" />
                  </span>
                  <span v-if="$slots.icon" :class="props.ui?.icon" class="akaza-tree-icon" aria-hidden="true">
                    <slot name="icon" v-bind="slotProps(row.data)" />
                  </span>
                  <span :class="props.ui?.text" class="akaza-tree-text">
                    <span
                      :class="[props.ui?.label, props.selectionHighlight === 'label' && ['akaza-tree-selection', props.ui?.selection]]"
                      class="akaza-tree-label"
                      :data-akaza-selected="row.data.isSelected || undefined"
                      :data-akaza-indeterminate="row.data.isIndeterminate || undefined"
                      :data-akaza-focused="row.data.isFocused || undefined"
                      :data-akaza-selection-highlight="props.selectionHighlight === 'label' ? 'label' : undefined"
                    >
                      <slot name="label" v-bind="slotProps(row.data)">{{ row.data.label }}</slot>
                    </span>
                  </span>
                  <span v-if="$slots.trailing" :class="props.ui?.trailing" class="akaza-tree-trailing">
                    <slot name="trailing" v-bind="slotProps(row.data)" />
                  </span>
                </slot>
              </span>
            </div>
            <div
              v-if="row.data.isBranch && row.data.isExpanded && row.data.isLoading && !treeData.childrenByParent.get(row.data.key)?.length"
              role="status"
              :class="props.ui?.loading"
              class="akaza-tree-loading"
            >
              <slot name="loading" v-bind="slotProps(row.data)">
                {{ props.labels?.loading?.(row.data.item) ?? `Loading ${row.data.label}...` }}
              </slot>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </component>
</template>

<style>
@layer akaza-reset {
  .akaza-tree,
  .akaza-tree-viewport,
  .akaza-tree-virtual-wrapper,
  .akaza-tree-item,
  .akaza-tree-row,
  .akaza-tree-content,
  .akaza-tree-text {
    min-width: 0;
  }

  .akaza-tree-viewport {
    overflow: auto;
  }

  .akaza-tree-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .akaza-tree-indent {
    flex: none;
    width: var(--akaza-tree-indent-offset, 0);
  }

  .akaza-tree-content {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
  }

  .akaza-tree-label {
    position: relative;
    display: inline-block;
    justify-self: start;
  }

  .akaza-tree-virtual-wrapper {
    position: relative;
  }

  .akaza-tree-toggle,
  .akaza-tree-indicator,
  .akaza-tree-icon,
  .akaza-tree-trailing {
    flex: none;
  }

  .akaza-tree-toggle {
    padding: 0;
    border: 0;
    color: inherit;
    font: inherit;
    background: none;
  }

  .akaza-tree-toggle-spacer {
    visibility: hidden;
    pointer-events: none;
  }

  .akaza-tree-item-enter-active,
  .akaza-tree-item-leave-active,
  .akaza-tree-item-move {
    transition: opacity 0.14s ease-out, transform 0.14s ease-out;
  }

  .akaza-tree-item-enter-from,
  .akaza-tree-item-leave-to {
    opacity: 0;
    transform: translateY(-3px);
  }

  .akaza-tree-item-leave-active {
    position: absolute;
    width: 100%;
    pointer-events: none;
  }

  .akaza-tree[data-akaza-transition="true"] .akaza-tree-toggle-icon {
    transition: transform 0.14s ease-out;
  }

  .akaza-tree-toggle-icon[data-akaza-state="expanded"] {
    transform: rotate(90deg);
  }

  .akaza-tree[dir="rtl"] .akaza-tree-toggle-icon[data-akaza-state="expanded"] {
    transform: rotate(-90deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .akaza-tree-item-enter-active,
    .akaza-tree-item-leave-active,
    .akaza-tree-item-move,
    .akaza-tree[data-akaza-transition="true"] .akaza-tree-toggle-icon {
      transition-duration: 0.01ms;
    }
  }
}
</style>
