import type { MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";

interface RovingFocusOptions<T> {
  items: MaybeRefOrGetter<readonly T[]>;
  isDisabled: (item: T, index: number) => boolean;
  loop: MaybeRefOrGetter<boolean>;
}

/** Works with fresh DOM collections as well as data; never caches slot elements. */
export function nextEnabledIndex<T>(
  items: readonly T[], from: number, delta: number, loop: boolean,
  isDisabled: (item: T, index: number) => boolean = () => false,
): number {
  if (!items.length || (delta !== 1 && delta !== -1)) return -1;
  let next = from;
  for (let count = 0; count < items.length; count++) {
    next += delta;
    if (loop) next = ((next % items.length) + items.length) % items.length;
    if (next < 0 || next >= items.length) return -1;
    if (!isDisabled(items[next]!, next)) return next;
  }
  return -1;
}

/** Index traversal only; DOM focus, key direction, and selection stay with the control. */
export function useRovingFocus<T>(options: RovingFocusOptions<T>) {
  const enabledIndices = computed(() => toValue(options.items)
    .flatMap((item, index) => options.isDisabled(item, index) ? [] : [index]));
  const firstIndex = computed(() => enabledIndices.value[0] ?? -1);
  const lastIndex = computed(() => enabledIndices.value[enabledIndices.value.length - 1] ?? -1);

  function nextIndex(from: number, delta: number): number {
    return nextEnabledIndex(toValue(options.items), from, delta, toValue(options.loop), options.isDisabled);
  }

  return { firstIndex, lastIndex, nextIndex };
}
