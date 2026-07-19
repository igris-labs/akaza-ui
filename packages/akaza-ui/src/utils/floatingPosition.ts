import type { CSSProperties, MaybeRefOrGetter, Ref } from "vue";
import { nextTick, onUnmounted, ref, toValue, watch } from "vue";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlign = "start" | "center" | "end";

interface FloatingPositionOptions {
  reference: Ref<HTMLElement | null>;
  floating: Ref<HTMLElement | null>;
  active: MaybeRefOrGetter<boolean>;
  side: MaybeRefOrGetter<FloatingSide>;
  align: MaybeRefOrGetter<FloatingAlign>;
  sideOffset?: MaybeRefOrGetter<number>;
  collisionPadding?: MaybeRefOrGetter<number>;
  matchWidth?: MaybeRefOrGetter<boolean>;
  cssVarPrefix: string;
}

interface FloatingPositionReturn {
  style: Ref<CSSProperties>;
  actualSide: Ref<FloatingSide>;
  actualAlign: Ref<FloatingAlign>;
  update: () => void;
}

function opposite(side: FloatingSide): FloatingSide {
  if (side === "top") return "bottom";
  if (side === "bottom") return "top";
  if (side === "left") return "right";
  return "left";
}

function availableSpace(side: FloatingSide, rect: DOMRect, width: number, height: number, padding: number) {
  if (side === "top") return rect.top - padding;
  if (side === "bottom") return height - rect.bottom - padding;
  if (side === "left") return rect.left - padding;
  return width - rect.right - padding;
}

function transformOrigin(side: FloatingSide, align: FloatingAlign) {
  if (side === "top" || side === "bottom") {
    const x = align === "start" ? "left" : align === "end" ? "right" : "center";
    return `${x} ${side === "top" ? "bottom" : "top"}`;
  }
  const y = align === "start" ? "top" : align === "end" ? "bottom" : "center";
  return `${side === "left" ? "right" : "left"} ${y}`;
}

export function useFloatingPosition(options: FloatingPositionOptions): FloatingPositionReturn {
  const style = ref<CSSProperties>({ position: "absolute", top: "-9999px", left: "-9999px" });
  const actualSide = ref<FloatingSide>(toValue(options.side));
  const actualAlign = ref<FloatingAlign>(toValue(options.align));
  let listening = false;
  let resizeObserver: ResizeObserver | undefined;

  function update() {
    if (typeof window === "undefined" || !toValue(options.active)) return;
    const reference = options.reference.value;
    const floating = options.floating.value;
    if (!reference || !floating) return;

    const referenceRect = reference.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const padding = toValue(options.collisionPadding ?? 8);
    const offset = toValue(options.sideOffset ?? 0);
    const preferred = toValue(options.side);
    const alternate = opposite(preferred);
    const required = preferred === "top" || preferred === "bottom" ? floatingRect.height : floatingRect.width;
    const preferredSpace = availableSpace(preferred, referenceRect, width, height, padding);
    const alternateSpace = availableSpace(alternate, referenceRect, width, height, padding);
    const side = preferredSpace >= required + offset || preferredSpace >= alternateSpace ? preferred : alternate;
    const align = toValue(options.align);

    let top = 0;
    let left = 0;
    if (side === "top") top = referenceRect.top - floatingRect.height - offset;
    else if (side === "bottom") top = referenceRect.bottom + offset;
    else if (side === "left") left = referenceRect.left - floatingRect.width - offset;
    else left = referenceRect.right + offset;

    if (side === "top" || side === "bottom") {
      if (align === "start") left = referenceRect.left;
      else if (align === "end") left = referenceRect.right - floatingRect.width;
      else left = referenceRect.left + (referenceRect.width - floatingRect.width) / 2;
    } else {
      if (align === "start") top = referenceRect.top;
      else if (align === "end") top = referenceRect.bottom - floatingRect.height;
      else top = referenceRect.top + (referenceRect.height - floatingRect.height) / 2;
    }

    left = Math.max(padding, Math.min(left, width - floatingRect.width - padding));
    top = Math.max(padding, Math.min(top, height - floatingRect.height - padding));

    const offsetParent = floating.offsetParent as HTMLElement | null;
    const parentRect = offsetParent?.getBoundingClientRect();
    const localLeft = parentRect ? left - parentRect.left + offsetParent!.scrollLeft : left + window.scrollX;
    const localTop = parentRect ? top - parentRect.top + offsetParent!.scrollTop : top + window.scrollY;
    const prefix = options.cssVarPrefix;

    actualSide.value = side;
    actualAlign.value = align;
    style.value = {
      position: "absolute",
      top: `${localTop}px`,
      left: `${localLeft}px`,
      right: "auto",
      bottom: "auto",
      transform: "none",
      transformOrigin: transformOrigin(side, align),
      ...(toValue(options.matchWidth ?? false) && { width: `${referenceRect.width}px` }),
      [`--${prefix}-anchor-width`]: `${referenceRect.width}px`,
      [`--${prefix}-anchor-height`]: `${referenceRect.height}px`,
      [`--${prefix}-available-width`]: `${Math.max(0, width - padding * 2)}px`,
      [`--${prefix}-available-height`]: `${Math.max(0, height - padding * 2)}px`,
      [`--${prefix}-transform-origin`]: transformOrigin(side, align),
    } as CSSProperties;
  }

  function addListeners() {
    if (listening || typeof window === "undefined") return;
    listening = true;
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      if (options.reference.value) resizeObserver.observe(options.reference.value);
      if (options.floating.value) resizeObserver.observe(options.floating.value);
    }
  }

  function removeListeners() {
    if (!listening || typeof window === "undefined") return;
    listening = false;
    window.removeEventListener("scroll", update, { capture: true });
    window.removeEventListener("resize", update);
    resizeObserver?.disconnect();
    resizeObserver = undefined;
  }

  watch(() => toValue(options.active), async (active) => {
    if (!active) {
      removeListeners();
      return;
    }
    await nextTick();
    if (!toValue(options.active)) return;
    update();
    addListeners();
  }, { immediate: true });

  watch(
    () => [
      toValue(options.side),
      toValue(options.align),
      toValue(options.sideOffset ?? 0),
      toValue(options.collisionPadding ?? 8),
      toValue(options.matchWidth ?? false),
    ],
    () => update(),
  );

  watch([() => options.reference.value, () => options.floating.value], async () => {
    if (!toValue(options.active)) return;
    await nextTick();
    if (!toValue(options.active)) return;
    removeListeners();
    update();
    addListeners();
  });

  onUnmounted(removeListeners);

  return { style, actualSide, actualAlign, update };
}
