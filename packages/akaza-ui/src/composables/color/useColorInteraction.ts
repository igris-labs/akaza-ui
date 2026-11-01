import type { Ref } from "vue";
import { ref } from "vue";

/** Pointer capture and cancellation shared by 1D and 2D color controls. */
export function useColorInteraction(
  element: Ref<HTMLElement | null>,
  blocked: () => boolean,
  update: (event: PointerEvent) => void,
  commit: (event: PointerEvent) => void,
  focus: () => void,
) {
  const dragging = ref(false);
  let pointerId: number | null = null;
  function finish(event: PointerEvent, canceled = false) {
    if (event.pointerId !== pointerId) return;
    if (element.value?.hasPointerCapture?.(event.pointerId))
      element.value.releasePointerCapture(event.pointerId);
    pointerId = null;
    dragging.value = false;
    if (!canceled && !blocked()) commit(event);
  }
  return {
    dragging,
    onPointerdown(event: PointerEvent) {
      if (blocked() || event.button !== 0 || event.isPrimary === false) return;
      event.preventDefault();
      pointerId = event.pointerId;
      dragging.value = true;
      element.value?.setPointerCapture?.(event.pointerId);
      focus();
      update(event);
    },
    onPointermove(event: PointerEvent) {
      if (dragging.value && event.pointerId === pointerId && !blocked()) update(event);
    },
    onPointerup: (event: PointerEvent) => finish(event),
    onPointercancel: (event: PointerEvent) => finish(event, true),
    onLostpointercapture: (event: PointerEvent) => finish(event, true),
  };
}
