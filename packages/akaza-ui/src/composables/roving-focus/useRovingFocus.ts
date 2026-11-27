import type { ComponentPublicInstance, ComputedRef, MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";
import { useRovingGroup } from "../internal/sdk/useRovingGroup";

export interface RovingFocusItem {
  /** A unique key that stays the same when the item moves. */
  key: string;
  /** Skip this item when choosing a tab stop or moving with arrow keys. */
  disabled?: boolean;
}

export interface UseRovingFocusOptions {
  /** Items in the order they appear in the template. Pass a ref or getter for changes. */
  items: MaybeRefOrGetter<readonly RovingFocusItem[]>;
  /** Which arrows to handle. Defaults to horizontal. */
  orientation?: MaybeRefOrGetter<"horizontal" | "vertical" | "both">;
  /** Wrap at either end. Defaults to true. */
  loop?: MaybeRefOrGetter<boolean>;
}

export interface RovingFocusItemProps {
  ref: (element: Element | ComponentPublicInstance | null) => void;
  tabindex: 0 | -1;
  onKeydown: (event: KeyboardEvent) => void;
}

export interface UseRovingFocusReturn {
  /** The key of the item Tab enters, or undefined when no item can take focus. */
  tabStop: ComputedRef<string | undefined>;
  /** Bind to the native element that takes focus, not to a wrapper. */
  itemProps: (key: string) => RovingFocusItemProps;
}

/**
 * Give a custom group of controls one Tab stop and move focus with arrow keys.
 * Call in setup. Pass refs or getters for options that change.
 * You still own roles, labels, disabled attributes, and selection.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useRovingFocus } from "akaza-ui";
 *
 * const items = [{ key: "undo" }, { key: "redo" }];
 * const { itemProps } = useRovingFocus({ items });
 * </script>
 *
 * <template>
 *   <div role="toolbar" aria-label="History">
 *     <button v-bind="itemProps('undo')" type="button">Undo</button>
 *     <button v-bind="itemProps('redo')" type="button">Redo</button>
 *   </div>
 * </template>
 * ```
 */
export function useRovingFocus(options: UseRovingFocusOptions): UseRovingFocusReturn {
  const items = computed(() => toValue(options.items));
  const keys = computed(() => items.value.map(item => item.key));
  const disabled = computed(() => new Set(items.value.filter(item => item.disabled).map(item => item.key)));
  const roving = useRovingGroup({
    keys: () => keys.value,
    disabled: key => disabled.value.has(key),
    preferred: () => keys.value.find(key => !disabled.value.has(key)),
    orientation: () => toValue(options.orientation) ?? "horizontal",
    loop: () => toValue(options.loop) ?? true,
  });

  function itemProps(key: string): RovingFocusItemProps {
    return {
      ref: element => roving.bind(key, element instanceof HTMLElement ? element : null),
      tabindex: roving.tabIndex(key) === 0 ? 0 : -1,
      onKeydown: (event) => {
        const element = event.currentTarget;
        if (event.target === element && element instanceof HTMLElement && !disabled.value.has(key)) {
          roving.keydown(event, element);
        }
      },
    };
  }

  return { tabStop: roving.tabStop, itemProps };
}
