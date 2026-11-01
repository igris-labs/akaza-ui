import type { CSSProperties, MaybeRefOrGetter, Ref } from "vue";
import { nextTick, onUnmounted, ref, shallowRef, toValue, watch } from "vue";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlign = "start" | "center" | "end";

interface FloatingPositionOptions {
  reference: Ref<{ getBoundingClientRect: () => DOMRect } | null>;
  floating: Ref<HTMLElement | null>;
  active: MaybeRefOrGetter<boolean>;
  side: MaybeRefOrGetter<FloatingSide>;
  align: MaybeRefOrGetter<FloatingAlign>;
  sideOffset?: MaybeRefOrGetter<number>;
  alignOffset?: MaybeRefOrGetter<number>;
  flipAlign?: boolean;
  collisionPadding?: MaybeRefOrGetter<number>;
  matchWidth?: MaybeRefOrGetter<boolean>;
  strategy?: MaybeRefOrGetter<"absolute" | "fixed">;
  /** Ordered alternatives for popups that can switch axis. Defaults to opposite-side flipping. */
  fallbackSides?: MaybeRefOrGetter<readonly FloatingSide[]>;
  flip?: boolean;
  /** Limit oversized popups to the viewport before choosing their coordinates. */
  constrainSize?: boolean;
  cssVarPrefix: string;
}

interface FloatingPositionReturn {
  style: Ref<CSSProperties>;
  actualSide: Ref<FloatingSide>;
  actualAlign: Ref<FloatingAlign>;
  geometry: Ref<FloatingGeometry | null>;
  update: () => void;
}

interface FloatingGeometry {
  reference: DOMRect;
  width: number;
  height: number;
  left: number;
  top: number;
  side: FloatingSide;
}

/** Arrow coordinates use viewport geometry, independent of the popup's offset parent. */
export function getFloatingArrowStyle(geometry: FloatingGeometry | null, size: number): CSSProperties {
  if (!geometry) return {};
  const { reference, width, height, left, top, side } = geometry;
  const half = size / 2;
  if (side === "top" || side === "bottom") {
    return {
      left: `${Math.max(half, Math.min(reference.left + reference.width / 2 - left - half, width - size - half))}px`,
      [side === "top" ? "bottom" : "top"]: `${-half}px`,
    };
  }
  return {
    top: `${Math.max(half, Math.min(reference.top + reference.height / 2 - top - half, height - size - half))}px`,
    [side === "left" ? "right" : "left"]: `${-half}px`,
  };
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
  const style = ref<CSSProperties>({ position: toValue(options.strategy) ?? "absolute", top: "-9999px", left: "-9999px" });
  const actualSide = ref<FloatingSide>(toValue(options.side));
  const actualAlign = ref<FloatingAlign>(toValue(options.align));
  const geometry = shallowRef<FloatingGeometry | null>(null);
  let listening = false;
  let disposed = false;
  let resizeObserver: ResizeObserver | undefined;

  function update() {
    if (disposed || typeof window === "undefined" || !toValue(options.active)) return;
    const reference = options.reference.value;
    const floating = options.floating.value;
    if (!reference || !floating) return;

    const referenceRect = reference.getBoundingClientRect();
    const measured = floating.getBoundingClientRect();
    // Collision geometry must not change with the popup's enter/leave scale.
    const width = window.innerWidth;
    const height = window.innerHeight;
    const padding = toValue(options.collisionPadding ?? 8);
    const availableWidth = Math.max(0, width - padding * 2);
    const availableHeight = Math.max(0, height - padding * 2);
    const floatingRect = {
      width: Math.min(floating.offsetWidth || measured.width, options.constrainSize ? availableWidth : Infinity),
      height: Math.min(floating.offsetHeight || measured.height, options.constrainSize ? availableHeight : Infinity),
    };
    const offset = toValue(options.sideOffset ?? 0);
    const preferred = toValue(options.side);
    const alternate = opposite(preferred);
    const required = preferred === "top" || preferred === "bottom" ? floatingRect.height : floatingRect.width;
    const preferredSpace = availableSpace(preferred, referenceRect, width, height, padding);
    const alternateSpace = availableSpace(alternate, referenceRect, width, height, padding);
    let side = preferred;
    if (options.flip !== false) {
      if (options.fallbackSides !== undefined) {
        const candidates = [...new Set([preferred, ...toValue(options.fallbackSides)])];
        side = candidates.find(candidate => availableSpace(candidate, referenceRect, width, height, padding)
          >= (candidate === "top" || candidate === "bottom" ? floatingRect.height : floatingRect.width) + offset)
          ?? candidates[candidates.length - 1]!;
      } else {
        side = preferredSpace >= required + offset || preferredSpace >= alternateSpace ? preferred : alternate;
      }
    }
    let align = toValue(options.align);
    const alignOffset = toValue(options.alignOffset ?? 0);
    if (options.flipAlign && align !== "center") {
      const horizontal = side === "top" || side === "bottom";
      const startSpace = horizontal ? width - referenceRect.left - padding : height - referenceRect.top - padding;
      const endSpace = horizontal ? referenceRect.right - padding : referenceRect.bottom - padding;
      const needed = (horizontal ? floatingRect.width : floatingRect.height) + alignOffset;
      if (align === "start" && startSpace < needed && endSpace >= needed) align = "end";
      else if (align === "end" && endSpace < needed && startSpace >= needed) align = "start";
    }

    let top = 0;
    let left = 0;
    if (side === "top") top = referenceRect.top - floatingRect.height - offset;
    else if (side === "bottom") top = referenceRect.bottom + offset;
    else if (side === "left") left = referenceRect.left - floatingRect.width - offset;
    else left = referenceRect.right + offset;

    if (side === "top" || side === "bottom") {
      if (align === "start") left = referenceRect.left + alignOffset;
      else if (align === "end") left = referenceRect.right - floatingRect.width - alignOffset;
      else left = referenceRect.left + (referenceRect.width - floatingRect.width) / 2;
    } else {
      if (align === "start") top = referenceRect.top + alignOffset;
      else if (align === "end") top = referenceRect.bottom - floatingRect.height - alignOffset;
      else top = referenceRect.top + (referenceRect.height - floatingRect.height) / 2;
    }

    left = Math.max(padding, Math.min(left, width - floatingRect.width - padding));
    top = Math.max(padding, Math.min(top, height - floatingRect.height - padding));

    const offsetParent = floating.offsetParent as HTMLElement | null;
    const parentRect = offsetParent?.getBoundingClientRect();
    const strategy = toValue(options.strategy) ?? "absolute";
    const localLeft = parentRect ? left - parentRect.left + offsetParent!.scrollLeft - offsetParent!.clientLeft : left + (strategy === "fixed" ? 0 : window.scrollX);
    const localTop = parentRect ? top - parentRect.top + offsetParent!.scrollTop - offsetParent!.clientTop : top + (strategy === "fixed" ? 0 : window.scrollY);
    const prefix = options.cssVarPrefix;

    actualSide.value = side;
    actualAlign.value = align;
    geometry.value = { reference: referenceRect, ...floatingRect, left, top, side };
    style.value = {
      position: strategy,
      top: `${localTop}px`,
      left: `${localLeft}px`,
      right: "auto",
      bottom: "auto",
      transform: "none",
      transformOrigin: transformOrigin(side, align),
      ...(toValue(options.matchWidth ?? false) && { width: `${referenceRect.width}px` }),
      ...(options.constrainSize && { boxSizing: "border-box", maxWidth: `${availableWidth}px`, maxHeight: `${availableHeight}px`, overflow: "auto" }),
      [`--${prefix}-anchor-width`]: `${referenceRect.width}px`,
      [`--${prefix}-anchor-height`]: `${referenceRect.height}px`,
      [`--${prefix}-available-width`]: `${availableWidth}px`,
      [`--${prefix}-available-height`]: `${availableHeight}px`,
      [`--${prefix}-transform-origin`]: transformOrigin(side, align),
    } as CSSProperties;
  }

  function addListeners() {
    if (disposed || listening || typeof window === "undefined") return;
    listening = true;
    window.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      if (options.reference.value instanceof Element) resizeObserver.observe(options.reference.value);
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
      toValue(options.alignOffset ?? 0),
      toValue(options.collisionPadding ?? 8),
      toValue(options.matchWidth ?? false),
      toValue(options.strategy),
      toValue(options.fallbackSides),
    ],
    () => update(),
    // Teleport can change the offset parent during the same render.
    { flush: "post" },
  );

  watch([() => options.reference.value, () => options.floating.value], async () => {
    if (!toValue(options.active)) return;
    await nextTick();
    if (!toValue(options.active)) return;
    removeListeners();
    update();
    addListeners();
  });

  onUnmounted(() => {
    disposed = true;
    removeListeners();
  });

  return { style, actualSide, actualAlign, geometry, update };
}
