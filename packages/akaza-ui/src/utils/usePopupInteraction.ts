import type { MaybeRefOrGetter } from "vue";
import { onBeforeUnmount, onMounted, toValue } from "vue";

interface PopupInteractionOptions {
  root: MaybeRefOrGetter<HTMLElement | null>;
  content: MaybeRefOrGetter<HTMLElement | null>;
  open: MaybeRefOrGetter<boolean>;
  focusTarget: MaybeRefOrGetter<HTMLElement | null>;
}

/** Preserve native scrollbar gestures without suppressing their default action. */
export function usePopupInteraction(options: PopupInteractionOptions) {
  let ownerDocument: Document | undefined;
  let pointerDownInsideContent = false;
  let pointerDownOnScrollbar = false;
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
    pointerDownOnScrollbar = false;
    if (!pointerDownInsideContent || !(target instanceof HTMLElement)) return;
    const box = target.getBoundingClientRect();
    const left = box.left + target.clientLeft;
    const top = box.top + target.clientTop;
    pointerDownOnScrollbar = (target.scrollHeight > target.clientHeight
      && (event.clientX < left || event.clientX >= left + target.clientWidth))
      || (target.scrollWidth > target.clientWidth
        && (event.clientY < top || event.clientY >= top + target.clientHeight));
  }
  function onPointerUp() {
    const root = toValue(options.root);
    const active = ownerDocument?.activeElement;
    const scrollbarFocus = pointerDownOnScrollbar && active && toValue(options.content)?.contains(active);
    if (pointerDownInsideContent && toValue(options.open) && root && (active?.contains(root) || scrollbarFocus)) {
      toValue(options.focusTarget)?.focus({ preventScroll: true });
    }
    pointerDownInsideContent = false;
    pointerDownOnScrollbar = false;
  }
  onMounted(() => {
    ownerDocument = toValue(options.root)?.ownerDocument;
    ownerDocument?.addEventListener("pointerdown", onPointerDown, true);
    ownerDocument?.addEventListener("pointerup", onPointerUp);
    ownerDocument?.addEventListener("pointercancel", onPointerUp);
  });
  onBeforeUnmount(() => {
    ownerDocument?.removeEventListener("pointerdown", onPointerDown, true);
    ownerDocument?.removeEventListener("pointerup", onPointerUp);
    ownerDocument?.removeEventListener("pointercancel", onPointerUp);
    pointerDownInsideContent = false;
    pointerDownOnScrollbar = false;
  });
  return { isInternalFocusMove };
}
