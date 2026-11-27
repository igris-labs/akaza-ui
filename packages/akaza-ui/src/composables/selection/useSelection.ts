import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import type { AkazaChangeEventDetails } from "../../types";
import { computed, shallowRef, toValue } from "vue";
import { createChangeDetails } from "../../utils/changeEvent";
import { useSelectionGroup } from "../internal/sdk/useSelectionGroup";

export interface SelectionItem {
  /** A unique key that stays the same when the item moves. */
  key: string;
  /** Do not select or toggle this item. Ranges skip it. */
  disabled?: boolean;
}

export interface UseSelectionOptions {
  /** Items in range order. Pass a ref or getter for changes. */
  items: MaybeRefOrGetter<readonly SelectionItem[]>;
  /** Share selection with a writable Vue ref. Defaults to an empty selection. */
  model?: Ref<string[]>;
  /** Allow multiple selected keys and ranges. Defaults to false. */
  multiple?: MaybeRefOrGetter<boolean>;
  /** Runs before a change. Call details.cancel() to keep the current selection. */
  onChange?: (keys: readonly string[], details: AkazaChangeEventDetails) => void;
}

export interface UseSelectionReturn {
  /** The current keys, including any set directly on the model. */
  selectedKeys: ComputedRef<readonly string[]>;
  isSelected: (key: string) => boolean;
  /** Replace the selection with this item. */
  select: (key: string, event?: Event) => void;
  /** Add or remove this item. In single mode, adding it replaces the selection. */
  toggle: (key: string, event?: Event) => void;
  /** In multiple mode, replace the selection with the enabled items between two keys. */
  selectRange: (from: string, to: string, event?: Event) => void;
  clear: (event?: Event) => void;
}

/**
 * Track which items are selected. Call in setup and pass a ref or getter
 * for items that change. Pass a writable model to share the selection.
 * It does not handle keyboard events, move focus, render controls, or add ARIA.
 *
 * @example
 * ```ts
 * import { useSelection } from "akaza-ui";
 *
 * const { selectedKeys, toggle } = useSelection({
 *   items: [{ key: "draft" }, { key: "review" }],
 *   multiple: true,
 * });
 * toggle("draft"); // selectedKeys.value is ["draft"].
 * ```
 */
export function useSelection(options: UseSelectionOptions): UseSelectionReturn {
  const model = options.model ?? shallowRef<string[]>([]);
  const selectedKeys = computed<readonly string[]>(() => model.value);
  const items = computed(() => toValue(options.items));
  const order = computed(() => items.value.map(item => item.key));
  const enabled = computed(() => new Set(items.value.filter(item => !item.disabled).map(item => item.key)));
  const multiple = () => toValue(options.multiple) ?? false;

  function change(keys: string[], reason: string, event?: Event): boolean {
    const request = createChangeDetails(reason, event);
    options.onChange?.(keys, request.details);
    if (request.canceled()) return false;
    model.value = keys;
    return true;
  }

  const selection = useSelectionGroup({
    value: () => model.value,
    order: () => order.value,
    multiple,
    disabled: key => !enabled.value.has(key),
    change,
  });

  return {
    selectedKeys,
    isSelected: key => selectedKeys.value.includes(key),
    select: (key, event) => {
      if (enabled.value.has(key)) selection.select(key, false, "select", event);
    },
    toggle: (key, event) => {
      if (enabled.value.has(key)) selection.select(key, true, "toggle", event);
    },
    selectRange: (from, to, event) => {
      if (multiple() && enabled.value.has(from) && enabled.value.has(to)) {
        selection.replaceRange(to, from, "range", event);
      }
    },
    clear: (event) => {
      if (model.value.length) change([], "clear", event);
    },
  };
}
