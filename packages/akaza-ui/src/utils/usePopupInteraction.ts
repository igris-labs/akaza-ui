import type { MaybeRefOrGetter } from "vue";
import { onBeforeUnmount, onMounted, toValue } from "vue";

interface PopupInteractionOptions {
  root: MaybeRefOrGetter<HTMLElement | null>;
  content: MaybeRefOrGetter<HTMLElement | null>;
  open: MaybeRefOrGetter<boolean>;
  focusTarget: MaybeRefOrGetter<HTMLElement | null>;
  onOutsidePointerDown: (event: PointerEvent) => void;
}

/** Preserve native scrollbar gestures without suppressing their default action. */
export function usePopupInteraction(options: PopupInteractionOptions) {
  let ownerDocument: Document | undefined;
  let pointerDownInsideContent = false;
  function isInternalFocusMove(event: FocusEvent): boolean {
    const root = toValue(options.root);
    const content = toValue(options.content);
    const next = event.relatedTarget as Node | null;
    return Boolean(root?.contains(next) || content?.contains(next)
      || (pointerDownInsideContent && (!next || (root && next.contains(root)))));
  }
  function onPointerDown(event: PointerEvent) {
    const target = event.target as Node | null;
    pointerDownInsideContent = toValue(options.content)?.contains(target) ?? false;
    if (!toValue(options.open) || pointerDownInsideContent || toValue(options.root)?.contains(target)) return;
    options.onOutsidePointerDown(event);
  }
  function onPointerUp() {
    const root = toValue(options.root);
    if (pointerDownInsideContent && toValue(options.open) && root && ownerDocument?.activeElement?.contains(root)) {
      toValue(options.focusTarget)?.focus({ preventScroll: true });
    }
    pointerDownInsideContent = false;
  }
  onMounted(() => {
    ownerDocument = toValue(options.root)?.ownerDocument;
    ownerDocument?.addEventListener("pointerdown", onPointerDown);
    ownerDocument?.addEventListener("pointerup", onPointerUp);
    ownerDocument?.addEventListener("pointercancel", onPointerUp);
  });
  onBeforeUnmount(() => {
    ownerDocument?.removeEventListener("pointerdown", onPointerDown);
    ownerDocument?.removeEventListener("pointerup", onPointerUp);
    ownerDocument?.removeEventListener("pointercancel", onPointerUp);
    pointerDownInsideContent = false;
  });
  return { isInternalFocusMove };
}
