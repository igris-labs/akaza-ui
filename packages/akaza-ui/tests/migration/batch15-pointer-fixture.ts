import type { Ref } from "vue";
import { bindDrag } from "@ui-sdk/core";
import { onScopeDispose, readonly, shallowRef, watch } from "vue";

interface PointerDragOptions {
  threshold?: number;
  lock?: boolean;
  cancelOnEscape?: boolean;
  onStart?: (event: PointerEvent) => boolean | void;
  onMove: (sample: {
    x: number;
    y: number;
    movementX: number;
    movementY: number;
    locked: boolean;
    event: PointerEvent;
  }) => void;
  onEnd: (event: PointerEvent, canceled: boolean) => void;
}

// Historical public-API probe; Batch21 permits SDK frame sampling in production controls.
export function usePointerDrag(blocked: () => boolean = () => false): {
  start: (element: HTMLElement, event: PointerEvent, options: PointerDragOptions) => boolean;
  cancel: () => void;
  dragging: Readonly<Ref<boolean>>;
} {
  const dragging = shallowRef(false);
  let cleanup: (() => void) | undefined;

  function cancel() {
    cleanup?.();
    cleanup = undefined;
    dragging.value = false;
  }

  function start(element: HTMLElement, event: PointerEvent, options: PointerDragOptions): boolean {
    if (dragging.value || blocked() || event.button !== 0 || event.isPrimary === false) return false;
    dragging.value = true;
    cleanup = bindDrag(element, event, {
      ...options,
      onStart(event) {
        const accepted = !blocked() && options.onStart?.(event) !== false;
        if (!accepted) cancel();
        return accepted;
      },
      onMove(sample) {
        if (!blocked()) options.onMove(sample);
      },
      onEnd(event, canceled) {
        cleanup = undefined;
        dragging.value = false;
        options.onEnd(event, canceled || blocked());
      },
    });
    return true;
  }

  watch(blocked, (value) => {
    if (value) cancel();
  }, { flush: "sync" });
  onScopeDispose(cancel);

  return { start, cancel, dragging: readonly(dragging) };
}
