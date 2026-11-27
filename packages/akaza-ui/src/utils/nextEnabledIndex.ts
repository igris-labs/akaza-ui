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

