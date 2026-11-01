import { onBeforeUnmount } from "vue";

interface SegmentFocusOptions<T extends string> {
  parts: () => readonly T[];
  focusOptions?: FocusOptions;
  getExtraElement?: (part: T) => HTMLElement | null;
}

/** Locale-ordered input focus, including non-input parts such as a day-period button. */
export function useSegmentFocus<TInput extends string, TPart extends string = TInput>(options: SegmentFocusOptions<TPart>) {
  const segmentRefs = new Map<string, HTMLInputElement>();
  function setSegmentRef(element: unknown, segment: TInput) {
    if (element) segmentRefs.set(segment, element as HTMLInputElement);
    else segmentRefs.delete(segment);
  }
  function focusSegment(segment: TInput) {
    segmentRefs.get(segment)?.focus(options.focusOptions);
  }
  function moveFocus(part: TPart, delta: number) {
    const parts = options.parts();
    const index = parts.indexOf(part);
    const next = parts[Math.min(parts.length - 1, Math.max(0, index + delta))];
    if (!next) return;
    const element = segmentRefs.get(next) ?? options.getExtraElement?.(next);
    element?.focus(options.focusOptions);
  }
  onBeforeUnmount(() => segmentRefs.clear());
  return { segmentRefs, setSegmentRef, focusSegment, moveFocus };
}
