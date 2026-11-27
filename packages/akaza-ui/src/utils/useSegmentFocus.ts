import { createFocusRecovery } from "@ui-sdk/core";
import { onBeforeUnmount } from "vue";

interface SegmentFocusOptions<T extends string> {
  parts: () => readonly T[];
  focusOptions?: FocusOptions;
  getExtraElement?: (part: T) => HTMLElement | null;
}

/** Locale-ordered input focus, including non-input parts such as a day-period button. */
export function useSegmentFocus<TInput extends string, TPart extends string = TInput>(options: SegmentFocusOptions<TPart>) {
  const segmentRefs = new Map<string, HTMLInputElement>();
  const bindings = new Map<string, { element: HTMLElement; props: { index: number }; dispose: () => void }>();
  let disposed = false;
  const recovery = createFocusRecovery<{ index: number }>({
    fallback: ({ props }) => {
      if (disposed) return;
      const parts = options.parts();
      const part = parts[Math.min(props.index, parts.length - 1)];
      const element = part && (segmentRefs.get(part) ?? options.getExtraElement?.(part));
      return element && !element.matches(":disabled, [inert], [inert] *") ? element : undefined;
    },
  });
  function bindPart(element: HTMLElement | null, part: string) {
    const existing = bindings.get(part);
    const props = { index: options.parts().findIndex(value => value === part) };
    if (existing?.element === element) {
      existing.props.index = props.index;
      return;
    }
    existing?.dispose();
    bindings.delete(part);
    if (element) bindings.set(part, {
      element,
      props,
      dispose: recovery.bind(element, { key: part, props }),
    });
  }
  function setSegmentRef(element: unknown, segment: TInput) {
    if (element) segmentRefs.set(segment, element as HTMLInputElement);
    else segmentRefs.delete(segment);
    bindPart(element as HTMLInputElement | null, segment);
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
  onBeforeUnmount(() => {
    disposed = true;
    bindings.forEach(binding => binding.dispose());
    bindings.clear();
    segmentRefs.clear();
  });
  return { segmentRefs, setSegmentRef, bindPart, focusSegment, moveFocus };
}
