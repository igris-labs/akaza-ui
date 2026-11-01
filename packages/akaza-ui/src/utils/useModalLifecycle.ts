import type { Ref } from "vue";
import { nextTick, watch } from "vue";
import { useDismissableLayer } from "./dismissableLayer";
import { useFocusScope } from "./focusScope";

interface ModalLifecycleOptions {
  open: Ref<boolean>;
  content: Ref<HTMLElement | null>;
  overlay: Ref<HTMLElement | null>;
  onEscape: (event?: KeyboardEvent) => void;
  initialFocusSelector?: string;
}

/** Share modal effects without sharing each component's dismissal policy. */
export function useModalLifecycle(options: ModalLifecycleOptions) {
  let restoreFocusTarget: HTMLElement | null = null;
  const { activate, deactivate } = useFocusScope(options.content, {
    ...(options.initialFocusSelector && { initialFocusSelector: options.initialFocusSelector }),
    getExemptElements: () => [options.overlay.value],
  });
  const { layerOrder, register, unregister } = useDismissableLayer(options.onEscape);

  function captureRestoreTarget(event?: Event) {
    restoreFocusTarget = typeof HTMLElement !== "undefined" && event?.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : null;
  }

  watch(options.open, async (open, _previous, cleanup) => {
    let stale = false;
    cleanup(() => { stale = true; });
    if (!open) {
      restoreFocusTarget = null;
      deactivate();
      unregister();
      return;
    }
    const focusTarget = restoreFocusTarget
      ?? (typeof document !== "undefined" ? document.activeElement as HTMLElement : null);
    await nextTick();
    if (stale || !options.open.value) return;
    activate(focusTarget);
    restoreFocusTarget = null;
    register();
  }, { immediate: true });

  return { layerOrder, captureRestoreTarget };
}
