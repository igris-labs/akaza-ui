import type { SlotDefinition } from "@ui-sdk/core";
import type { CSSProperties, Ref } from "vue";
import { createPopup, definePrimitive, popupSlots, popupState } from "@ui-sdk/core";
import { dialogPreset } from "@ui-sdk/core/dialog";
import { hoverCardPreset } from "@ui-sdk/core/hover-card";
import { popoverPreset } from "@ui-sdk/core/popover";
import { tooltipPreset } from "@ui-sdk/core/tooltip";
import { createGlobalState } from "@vueuse/core";
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onScopeDispose,
  onUpdated,
  shallowRef,
  ssrContextKey,
  useId,
  watch,
  watchEffect,
  watchPostEffect,
} from "vue";

type Kind =
  | "dialog"
  | "alertdialog"
  | "popover"
  | "menu"
  | "select"
  | "combobox"
  | "tooltip"
  | "hover"
  | "navigation";
type PartName = "content" | "trigger" | "backdrop" | "arrow" | "title" | "description";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type FocusTarget =
  | "auto"
  | "content"
  | "none"
  | (string & {})
  | (() => HTMLElement | null | undefined);

interface PopupOptions {
  kind: Kind;
  open: Ref<boolean>;
  content: Ref<HTMLElement | null>;
  contentId?: string;
  keepMounted?: () => boolean;
  trigger?: () => HTMLElement | null | undefined;
  backdrop?: Ref<HTMLElement | null>;
  arrow?: Ref<HTMLElement | null>;
  modal?: () => boolean;
  disabled?: () => boolean;
  delay?: () => number;
  closeDelay?: () => number;
  initialFocus?: FocusTarget;
  finalFocus?: "none" | (() => HTMLElement | null | undefined);
  anchor?: () => HTMLElement | { getBoundingClientRect: () => DOMRect } | null | undefined;
  side?: () => Side;
  align?: () => Align;
  sideOffset?: () => number;
  alignOffset?: () => number;
  collisionPadding?: () => number;
  cssVarPrefix?: string;
  transition?: () => string | false;
  backdropTransition?: () => string | false;
  matchWidth?: () => boolean;
  constrainSize?: boolean;
  request: (open: boolean, reason: string, event?: Event) => void;
}

interface Snapshot {
  open: boolean;
  modal: boolean;
  disabled: boolean;
  delay: number;
  closeDelay: number;
  onOpenChange: (
    open: boolean,
    details: { reason: string; event?: Event; cancel: () => void },
  ) => void;
  onOpenChangeComplete: (open: boolean) => void;
}

function bindPopupMotion(
  element: HTMLElement,
  transitionName: () => string | false | undefined,
  open: boolean,
  firstBind: boolean,
) {
  let prefix: ReturnType<typeof transitionName>;
  let phase: "enter-from" | "enter-to" | "leave-from" | "leave-to" | undefined;
  let classes: string[] = [];

  function setPhase(next: typeof phase, seed = false) {
    element.classList.remove(...classes);
    phase = prefix ? next : undefined;
    classes = phase ? [`${prefix}-${phase}`] : [];
    if (phase && !seed) classes.push(`${prefix}-${phase.split("-")[0]}-active`);
    element.classList.add(...classes);
  }

  function syncEntry() {
    if (phase !== "enter-from" || element.hidden) return;
    const starting = element.hasAttribute("data-starting-style");
    if (starting && classes.length > 1) return;
    // Commit the start style before enabling transitions, so the popup doesn't animate toward it.
    void element.offsetWidth;
    if (starting) {
      setPhase("enter-from");
      return;
    }
    setPhase("enter-to");
    const entry = classes;
    // SDK completion can precede the CSS transition started by this attribute observer.
    const animations =
      element
        .getAnimations?.()
        .filter(
          (animation) =>
            ("transitionProperty" in animation || "animationName" in animation) &&
            animation.playState !== "finished" &&
            animation.playState !== "paused" &&
            Number.isFinite(animation.effect?.getComputedTiming?.().endTime),
        ) ?? [];
    if (animations.length === 0) setPhase(undefined);
    else
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (classes === entry) setPhase(undefined);
      });
  }

  const stopName = watch(
    transitionName,
    (next) => {
      prefix = next;
      setPhase(undefined);
    },
    { immediate: true, flush: "sync" },
  );

  // Seed the first frame before SDK binding can measure or reveal the element.
  if (firstBind && open) setPhase("enter-from", true);
  const observer = new MutationObserver(syncEntry);
  observer.observe(element, {
    attributes: true,
    attributeFilter: ["data-starting-style", "hidden"],
  });

  return {
    syncEntry,
    prepare(nextOpen: boolean) {
      if (open === nextOpen) return;
      open = nextOpen;
      if (open) setPhase("enter-from", true);
      else if (prefix) {
        setPhase("leave-from");
        void element.offsetWidth;
        setPhase("leave-to");
      }
    },
    finishLeave() {
      if (phase === "leave-to") setPhase(undefined);
    },
    destroy() {
      observer.disconnect();
      stopName();
      setPhase(undefined);
    },
  };
}

const useVisualOrder = createGlobalState(() => {
  let count = 0;
  let next = 0;
  return {
    allocate() {
      count += 1;
      next += 2;
      return next;
    },
    release() {
      if (--count === 0) next = 0;
    },
  };
});

const {
  role: _popoverRole,
  press: _popoverPress,
  hover: _popoverHover,
  ...anchoredPreset
} = popoverPreset;

function tag<State extends object, Api, Props, Public>(
  definition: SlotDefinition<State, Api, Props, Public>,
  name: string,
): SlotDefinition<State, Api, Props, Public> {
  const read = definition.attrs;
  return {
    ...definition,
    attrs: (state: State, context: Parameters<NonNullable<typeof read>>[1]) => ({
      "data-slot": name,
      ...read?.(state, context),
    }),
  };
}

const presets = {
  dialog: dialogPreset,
  alertdialog: { ...dialogPreset, role: "alertdialog" as const },
  popover: { ...anchoredPreset, press: _popoverPress, hover: _popoverHover },
  menu: { ...anchoredPreset, behavior: "menu" as const, role: "menu" as const },
  select: { ...anchoredPreset, behavior: "select" as const },
  combobox: { ...anchoredPreset, behavior: "combobox" as const },
  navigation: { ...anchoredPreset, behavior: "navigationMenu" as const },
  tooltip: tooltipPreset,
  hover: hoverCardPreset,
};

const primitives = Object.fromEntries(
  Object.entries(presets).map(([kind, preset]) => [
    kind,
    definePrimitive({
      name: `akaza-${kind}-popup`,
      controlled: ["open"],
      options: {
        open: "boolean",
        modal: "boolean",
        disabled: "boolean",
        delay: "number",
        closeDelay: "number",
        onOpenChange: "callback",
        onOpenChangeComplete: "callback",
      },
      state: (options: Snapshot) => popupState(options),
      sync: (options) => ({ open: options.open, modal: options.modal }),
      api: (context) => createPopup(context, { preset }),
      slots: (slot) => {
        const parts = popupSlots(slot);
        return {
          ...parts,
          trigger: tag(parts.trigger, `akaza-${kind}-popup-trigger`),
          content: tag(parts.content, `akaza-${kind}-popup-content`),
          backdrop: tag(parts.backdrop, `akaza-${kind}-popup-backdrop`),
          arrow: tag(parts.arrow, `akaza-${kind}-popup-arrow`),
        };
      },
    }),
  ]),
);

export function usePopup(options: PopupOptions) {
  const id = `akaza-popup-${useId()}`;
  const primitive = primitives[options.kind]!;
  const server = typeof document === "undefined" || inject(ssrContextKey, null) !== null;
  const hydrated = shallowRef(false);
  const initialContentId = options.contentId ?? `${id}-content`;
  const initialContentAttrs = computed<Record<string, string | undefined>>(() => {
    const preset = presets[options.kind];
    return {
      "data-slot": `akaza-${options.kind}-popup-content`,
      id: initialContentId,
      tabindex: "-1",
      hidden: options.open.value ? undefined : "",
      "data-open": options.open.value ? "" : undefined,
      "data-closed": options.open.value ? undefined : "",
      ...("role" in preset && preset.role ? { role: preset.role } : {}),
    };
  });
  const initialTriggerAttrs = computed<Record<string, string | undefined>>(() => ({
    "data-slot": `akaza-${options.kind}-popup-trigger`,
    id: `${id}-trigger`,
    ...(options.kind === "tooltip"
      ? { "aria-describedby": initialContentId }
      : {
          "aria-expanded": String(options.open.value),
          "aria-controls": options.open.value ? initialContentId : undefined,
        }),
  }));
  const initialBackdropAttrs = computed<Record<string, string | undefined>>(() => ({
    "data-slot": `akaza-${options.kind}-popup-backdrop`,
    id: `${id}-backdrop`,
  }));
  const initialArrowAttrs = computed<Record<string, string | undefined>>(() => ({
    "data-slot": `akaza-${options.kind}-popup-arrow`,
  }));
  const initiallyPresent = computed(
    () => options.open.value || Boolean(options.keepMounted?.()) || options.kind === "tooltip",
  );
  if (server) {
    return {
      present: initiallyPresent,
      contentAttrs: initialContentAttrs,
      triggerAttrs: initialTriggerAttrs,
      backdropAttrs: initialBackdropAttrs,
      arrowAttrs: initialArrowAttrs,
      actualSide: shallowRef<Side>(options.side?.() ?? "bottom"),
      actualAlign: shallowRef<Align>(options.align?.() ?? "start"),
      style: shallowRef<CSSProperties>({}),
      layerOrder: shallowRef(0),
      captureRestoreTarget: (_event?: Event) => {},
      setOpen(open: boolean, reason: string, event?: Event) {
        if (open && options.disabled?.()) return false;
        options.request(open, reason, event);
        return options.open.value === open;
      },
    };
  }
  onMounted(() => {
    hydrated.value = true;
  });
  const restoreTarget = shallowRef<HTMLElement | null>(null);
  let activationFocus: Element | null = null;
  let disposed = false;
  const triggerElement = () => options.trigger?.() ?? restoreTarget.value;
  let action: { reason: string; event?: Event } | undefined;
  const motion = new Map<PartName, ReturnType<typeof bindPopupMotion>>();
  const motionElements = new WeakSet<HTMLElement>();
  const snapshot = (): Snapshot & { id: string } => ({
    id,
    open: options.open.value,
    modal: options.modal?.() ?? (options.kind === "dialog" || options.kind === "alertdialog"),
    disabled: options.disabled?.() ?? false,
    delay: options.delay?.() ?? 0,
    closeDelay: options.closeDelay?.() ?? 0,
    onOpenChange(open, details) {
      // Controlled SDK state waits for Vue acceptance; do not discard SDK's focus-return intent.
      const focused = document.activeElement;
      const returnImplicitFocus =
        !open &&
        details.reason === "escape-key" &&
        options.kind === "popover" &&
        options.finalFocus !== "none" &&
        focused !== null &&
        focused === activationFocus;
      options.request(open, action?.reason ?? details.reason, action?.event ?? details.event);
      if (returnImplicitFocus) restoreImplicitFocus(focused);
    },
    onOpenChangeComplete(open) {
      if (!open && !options.open.value) {
        for (const binding of motion.values()) binding.finishLeave();
      }
    },
  });
  const instance = primitive(snapshot());
  function syncOptions() {
    const next = snapshot();
    for (const binding of motion.values()) binding.prepare(next.open);
    instance.setOptions(next);
  }
  function restoreImplicitFocus(focused: Element) {
    void nextTick(() => {
      // Safari can leave the previously focused control active after a trigger click.
      if (!disposed && !options.open.value && document.activeElement === focused)
        instance.api.focus();
    });
  }
  const state = shallowRef(instance.get());
  const stop = server
    ? () => {}
    : instance.subscribe(() => {
        state.value = { ...instance.get() };
      });
  const parents = new Map<PartName, Node | null>();
  const reparented = shallowRef(0);

  const parts = {
    content: instance.part("content", {
      keepMounted: options.keepMounted?.() ?? false,
      initialFocus: options.initialFocus ?? "auto",
      finalFocus: options.finalFocus ?? (() => restoreTarget.value ?? triggerElement()),
    }),
    trigger: instance.part("trigger", { id: `${id}-trigger` }),
    backdrop: instance.part("backdrop", { id: `${id}-backdrop` }),
    arrow: instance.part("arrow", { id: `${id}-arrow` }),
    title: instance.part("title", { id: `${id}-title` }),
    description: instance.part("description", { id: `${id}-description` }),
  };
  onUpdated(() => {
    // Teleport moves reset native top-layer state without changing the element ref.
    if ([...parents].some(([name, parent]) => parts[name].el?.parentNode !== parent))
      reparented.value += 1;
  });
  const present = computed(() => {
    const keepMounted = options.keepMounted?.() ?? false;
    if (!hydrated.value) return initiallyPresent.value;
    return (
      primitive.slots.content.present?.(state.value, {
        ...parts.content,
        props: { ...parts.content.props, keepMounted },
      }) ?? true
    );
  });

  function attrs(name: PartName): Record<string, string | undefined> {
    const part = parts[name];
    const definition = primitive.slots[name];
    const declaredRole = "role" in definition ? definition.role : undefined;
    const role =
      typeof declaredRole === "function" ? declaredRole(state.value, part) : declaredRole;
    const result: Record<string, string | undefined> = {
      ...definition.attrs?.(state.value, part),
      ...(role ? { role } : {}),
    };
    if (options.contentId) {
      if (name === "content") result.id = options.contentId;
      for (const key of ["aria-controls", "aria-describedby", "aria-labelledby"]) {
        const value = result[key];
        if (value)
          result[key] = value
            .split(/\s+/)
            .map((token) => (token === `${id}-content` ? options.contentId! : token))
            .join(" ");
      }
    }
    return result;
  }
  const contentAttrs = computed(() =>
    hydrated.value ? attrs("content") : initialContentAttrs.value,
  );
  const triggerAttrs = computed(() =>
    hydrated.value ? attrs("trigger") : initialTriggerAttrs.value,
  );
  const backdropAttrs = computed(() =>
    hydrated.value ? attrs("backdrop") : initialBackdropAttrs.value,
  );
  const arrowAttrs = computed(() => (hydrated.value ? attrs("arrow") : initialArrowAttrs.value));
  const actualSide = shallowRef<Side>(options.side?.() ?? "bottom");
  const actualAlign = shallowRef<Align>(options.align?.() ?? "start");
  const style = shallowRef<CSSProperties>({});
  const layerOrder = shallowRef(0);

  function captureRestoreTarget(event?: Event) {
    restoreTarget.value =
      typeof HTMLElement !== "undefined" && event?.currentTarget instanceof HTMLElement
        ? event.currentTarget
        : typeof document !== "undefined"
          ? (document.activeElement as HTMLElement)
          : null;
  }

  if (!server) {
    const visualOrder = useVisualOrder();
    // CSS stacking remains available when native top-layer presentation is unsupported.
    onMounted(() => {
      watch(
        () => state.value.mounted,
        (mounted, _previous, cleanup) => {
          if (!mounted) return;
          layerOrder.value = visualOrder.allocate();
          // iOS Safari otherwise omits clicks on noninteractive page areas after touch release.
          const body = document.body;
          const enableTouchClick = () => {};
          body.addEventListener("click", enableTouchClick);
          cleanup(() => {
            body.removeEventListener("click", enableTouchClick);
            layerOrder.value = 0;
            visualOrder.release();
          });
        },
        { immediate: true, flush: "sync" },
      );
    });
    watchEffect(() => {
      const props = parts.content.props;
      props.initialFocus = options.initialFocus ?? "auto";
      props.finalFocus = options.finalFocus ?? (() => restoreTarget.value ?? triggerElement());
      props.keepMounted = options.keepMounted?.() ?? false;
      props.anchor = options.anchor?.() ?? triggerElement() ?? null;
      props.side = options.side?.() ?? "bottom";
      props.align = options.align?.() ?? "start";
      props.sideOffset = options.sideOffset?.() ?? 0;
      props.alignOffset = options.alignOffset?.() ?? 0;
      props.collisionPadding = options.collisionPadding?.() ?? 8;
      syncOptions();
    });

    for (const name of ["trigger", "backdrop", "arrow", "content"] as const) {
      watchPostEffect((cleanup) => {
        void reparented.value;
        const element =
          name === "trigger"
            ? triggerElement()
            : name === "content"
              ? options.content.value
              : name === "backdrop"
                ? options.backdrop?.value
                : options.arrow?.value;
        if (!element) return;
        const definition = primitive.slots[name];
        const part = parts[name];
        part.el = element;
        parents.set(name, element.parentNode);
        const transitionName =
          name === "content"
            ? options.transition
            : name === "backdrop"
              ? options.backdropTransition
              : undefined;
        const binding = transitionName
          ? bindPopupMotion(
              element,
              transitionName,
              instance.get().open,
              !motionElements.has(element),
            )
          : undefined;
        if (binding) {
          motionElements.add(element);
          motion.set(name, binding);
        }
        const disconnect = definition.connect?.(element);
        const handlers = Object.entries(definition.on ?? {}).map(([type, handler]) => {
          const listener = (event: Event) => {
            if (!event.defaultPrevented) handler(event as never, part);
          };
          element.addEventListener(type, listener);
          return () => element.removeEventListener(type, listener);
        });
        const unbind = definition.bind?.(element, part);
        binding?.syncEntry();
        cleanup(() => {
          handlers.forEach((stop) => stop());
          binding?.destroy();
          motion.delete(name);
          unbind?.();
          disconnect?.();
          part.el = undefined;
          parents.delete(name);
        });
      });
    }

    watchPostEffect((cleanup) => {
      const element = options.content.value;
      if (!element) return;
      const sync = () => {
        const side = element.dataset.side;
        const align = element.dataset.align;
        if (side === "top" || side === "right" || side === "bottom" || side === "left")
          actualSide.value = side;
        if (align === "start" || align === "center" || align === "end") actualAlign.value = align;
        const next: CSSProperties = {};
        if (options.cssVarPrefix) {
          for (const name of [
            "anchor-width",
            "anchor-height",
            "available-width",
            "available-height",
            "transform-origin",
          ]) {
            next[`--${options.cssVarPrefix}-${name}`] = element.style.getPropertyValue(`--${name}`);
          }
        }
        if (options.matchWidth?.()) next.width = element.style.getPropertyValue("--anchor-width");
        if (options.constrainSize) {
          next.boxSizing = "border-box";
          next.maxWidth = element.style.getPropertyValue("--available-width");
          next.maxHeight = element.style.getPropertyValue("--available-height");
          next.overflow = "auto";
        }
        if (JSON.stringify(next) !== JSON.stringify(style.value)) style.value = next;
      };
      const observer = new MutationObserver(sync);
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["style", "data-side", "data-align"],
      });
      sync();
      cleanup(() => observer.disconnect());
    });
  }

  onScopeDispose(() => {
    disposed = true;
    stop();
    instance.destroy();
  });

  function setOpen(open: boolean, reason: string, event?: Event) {
    syncOptions();
    if (open && options.disabled?.()) return false;
    if (open) {
      activationFocus =
        event?.currentTarget === options.trigger?.() ? document.activeElement : null;
      captureRestoreTarget(event);
    }
    action = { reason, ...(event ? { event } : {}) };
    try {
      return instance.api.setOpen(open, { reason, ...(event ? { event } : {}) });
    } finally {
      action = undefined;
    }
  }
  return {
    present,
    contentAttrs,
    triggerAttrs,
    backdropAttrs,
    arrowAttrs,
    actualSide,
    actualAlign,
    style,
    layerOrder,
    captureRestoreTarget,
    setOpen,
  };
}
