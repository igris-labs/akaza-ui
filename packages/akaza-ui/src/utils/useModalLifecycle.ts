import type { MaybeRefOrGetter, Ref } from "vue";
import { nextTick, onBeforeUnmount, toValue, watch } from "vue";
import { useDismissableLayer } from "./dismissableLayer";
import { useFocusScope } from "./focusScope";

interface ModalLifecycleOptions {
  open: Ref<boolean>;
  content: Ref<HTMLElement | null>;
  overlay: Ref<HTMLElement | null>;
  modal?: MaybeRefOrGetter<boolean>;
  onEscape: (event?: KeyboardEvent) => void;
  initialFocusSelector?: string;
}

/** Share modal effects without sharing each component's dismissal policy. */
export function useModalLifecycle(options: ModalLifecycleOptions) {
  let restoreFocusTarget: HTMLElement | null = null;
  let nonModalRestoreTarget: HTMLElement | null = null;
  const { activate, deactivate, contains } = useFocusScope(options.content, {
    ...(options.initialFocusSelector && { initialFocusSelector: options.initialFocusSelector }),
    getExemptElements: () => [options.overlay.value],
  });
  const { layerOrder, register, unregister } = useDismissableLayer(options.onEscape);

  function captureRestoreTarget(event?: Event) {
    restoreFocusTarget = typeof HTMLElement !== "undefined" && event?.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : null;
  }

  function restoreNonModalFocus() {
    if (typeof document !== "undefined" && contains(document.activeElement)
      && nonModalRestoreTarget?.isConnected) nonModalRestoreTarget.focus({ preventScroll: true });
    nonModalRestoreTarget = null;
  }
  onBeforeUnmount(restoreNonModalFocus);

  watch([options.open, () => toValue(options.modal ?? true)], async ([open, modal], _previous, cleanup) => {
    let stale = false;
    cleanup(() => { stale = true; });
    if (!open) {
      restoreFocusTarget = null;
      restoreNonModalFocus();
      deactivate();
      unregister();
      return;
    }
    const focusTarget = restoreFocusTarget
      ?? (typeof document !== "undefined" ? document.activeElement as HTMLElement : null);
    nonModalRestoreTarget = !modal && !contains(focusTarget) ? focusTarget : null;
    if (!modal) deactivate();
    await nextTick();
    if (stale || !options.open.value || typeof document === "undefined") return;
    if (modal) activate(focusTarget);
    restoreFocusTarget = null;
    register();
  }, { immediate: true });

  return { layerOrder, captureRestoreTarget };
}
