import type { Component, DefineComponent } from "vue";
import { createSharedComposable } from "@vueuse/core";
import { reactive } from "vue";

/**
 * Extracts the props type from a Vue component.
 * Works with components defined via defineComponent / defineProps.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentProps<T extends Component> = T extends DefineComponent<infer P, any, any, any, any, any, any, any>
  ? Omit<P, "modelValue" | "onUpdate:modelValue" | "onClose">
  : Record<string, unknown>;

export interface OverlayOptions<T extends Component> {
  /** Default props to pass to the component. Can be overridden per-open call. */
  props?: Partial<ComponentProps<T>>;
  /** Open immediately after create(). Default: false. */
  defaultOpen?: boolean;
  /** Remove the component from the DOM when closed. Default: false. */
  destroyOnClose?: boolean;
}

export interface OverlayOpenResult {
  /** Resolves when the overlay is closed. The resolved value is whatever was
   *  passed to close() or emitted via the component's `close` event. */
  result: Promise<unknown>;
}

export interface OverlayInstance<T extends Component> {
  /** Open the overlay, optionally merging new props. Returns a promise. */
  open: (props?: Partial<ComponentProps<T>>) => OverlayOpenResult;
  /** Close the overlay, optionally passing a return value. */
  close: (value?: unknown) => void;
  /** Update props on an already-open overlay without closing it. */
  patch: (props: Partial<ComponentProps<T>>) => void;
  /** Remove the overlay from the DOM entirely. */
  unmount: () => void;
  /** Whether the overlay is currently visible. */
  isOpen: () => boolean;
}

// Internal shape — shared between composable and OverlayProvider
export interface _OverlayEntry {
  id: number;
  component: Component;
  props: Record<string, unknown>;
  modelValue: boolean;
  destroyOnClose: boolean;
  resolve: ((value: unknown) => void) | null;
  _close: (value?: unknown) => void;
}

let _idCounter = 0;

function _useOverlay() {
  const overlays = reactive<_OverlayEntry[]>([]);

  function create<T extends Component>(component: T, options?: OverlayOptions<T>): OverlayInstance<T> {
    const id = ++_idCounter;

    // Raw entry — pushed into the reactive array on first open.
    // All state mutations MUST go through getEntry() to hit the reactive proxy.
    const raw: _OverlayEntry = {
      id,
      component,
      props: { ...options?.props } as Record<string, unknown>,
      modelValue: false,
      destroyOnClose: options?.destroyOnClose ?? false,
      resolve: null,
      _close: () => {}, // filled in below
    };

    /** Returns the reactive proxy for this entry, or undefined if unmounted. */
    function getEntry() {
      return overlays.find((o) => o.id === id);
    }

    function unmount() {
      const idx = overlays.findIndex((o) => o.id === id);
      if (idx !== -1) overlays.splice(idx, 1);
    }

    function close(value?: unknown) {
      const entry = getEntry();
      if (entry) entry.modelValue = false;
      // resolve lives on the raw object — not reactive state, just a callback
      if (raw.resolve) {
        raw.resolve(value);
        raw.resolve = null;
      }
      if (raw.destroyOnClose) unmount();
    }

    // Stored on the raw entry so OverlayProvider can delegate to it
    raw._close = close;

    function open(props?: Partial<ComponentProps<T>>): OverlayOpenResult {
      if (!overlays.find((o) => o.id === id)) overlays.push(raw);
      const entry = getEntry()!;
      if (props) Object.assign(entry.props, props);
      entry.modelValue = true;
      const result = new Promise<unknown>((resolve) => {
        raw.resolve = resolve;
      });
      return { result };
    }

    function patch(props: Partial<ComponentProps<T>>) {
      const entry = getEntry();
      if (entry) Object.assign(entry.props, props);
    }

    function isOpen() {
      const entry = getEntry();
      return entry?.modelValue ?? false;
    }

    if (options?.defaultOpen) {
      open();
    }

    return { open, close, patch, unmount, isOpen };
  }

  return { overlays, create };
}

export const useOverlay = createSharedComposable(_useOverlay);
