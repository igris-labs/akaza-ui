import { bindDrag } from "@ui-sdk/core";
import { nextTick, onScopeDispose, readonly, shallowRef, watch } from "vue";

interface PointerDragOptions {
  onMove: (event: PointerEvent) => void;
  onEnd: (event: PointerEvent, canceled: boolean) => void;
}

export function usePointerDrag(blocked: () => boolean) {
  const dragging = shallowRef(false);
  let active: { cleanup: (() => void) | undefined; x: number; y: number } | undefined;

  function cancel() {
    const session = active;
    active = undefined;
    dragging.value = false;
    session?.cleanup?.();
  }

  function start(element: HTMLElement, event: PointerEvent, options: PointerDragOptions): boolean {
    if (active || blocked() || event.button !== 0 || event.isPrimary === false) return false;
    const session = { x: event.clientX, y: event.clientY, cleanup: undefined as (() => void) | undefined };
    active = session;
    dragging.value = true;
    function move(event: PointerEvent) {
      if (active !== session || blocked()) return;
      session.x = event.clientX;
      session.y = event.clientY;
      options.onMove(event);
    }
    function finish(event: PointerEvent, canceled: boolean) {
      if (active !== session) return;
      element.removeEventListener("lostpointercapture", lostCapture);
      dragging.value = false;
      // beta.17 flushes queued moves, not a newer pointerup position.
      if (!canceled && event.type === "pointerup" && (event.clientX !== session.x || event.clientY !== session.y)) move(event);
      // Let controlled Vue models accept or reject the final proposal before committing.
      nextTick(() => {
        if (active !== session) return;
        active = undefined;
        if (!blocked()) options.onEnd(event, canceled);
      });
    }
    let stop: (() => void) | undefined;
    function lostCapture(lost: PointerEvent) {
      if (lost.pointerId !== event.pointerId) return;
      stop?.();
      finish(lost, true);
    }
    // beta.17 does not report lostpointercapture through onEnd.
    element.addEventListener("lostpointercapture", lostCapture);
    stop = bindDrag(element, event, {
      onMove: sample => move(sample.event),
      onEnd: finish,
    });
    session.cleanup = () => {
      element.removeEventListener("lostpointercapture", lostCapture);
      stop?.();
    };
    return true;
  }

  watch(blocked, value => { if (value) cancel(); }, { flush: "sync" });
  onScopeDispose(cancel);
  return { start, cancel, dragging: readonly(dragging) };
}
