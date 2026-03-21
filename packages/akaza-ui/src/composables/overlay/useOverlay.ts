import type { Component } from "vue";
import { createSharedComposable } from "@vueuse/core";
import { reactive } from "vue";

export interface OverlayOptions {
  /** Default props to pass to the component. Can be overridden per-open call. */
  props?: Record<string, unknown>;
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

export interface OverlayInstance {
  /** Open the overlay, optionally merging new props. Returns a promise. */
  open: (props?: Record<string, unknown>) => OverlayOpenResult;
  /** Close the overlay, optionally passing a return value. */
  close: (value?: unknown) => void;
  /** Update props on an already-open overlay without closing it. */
  patch: (props: Record<string, unknown>) => void;
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

  function create(component: Component, options?: OverlayOptions): OverlayInstance {
    const id = ++_idCounter;

    const entry: _OverlayEntry = {
      id,
      component,
      props: { ...options?.props },
      modelValue: false,
      destroyOnClose: options?.destroyOnClose ?? false,
      resolve: null,
      _close: () => {}, // filled in below
    };

    function unmount() {
      const idx = overlays.findIndex((o) => o.id === id);
      if (idx !== -1) overlays.splice(idx, 1);
    }

    function close(value?: unknown) {
      entry.modelValue = false;
      if (entry.resolve) {
        entry.resolve(value);
        entry.resolve = null;
      }
      if (entry.destroyOnClose) unmount();
    }

    // Stored on the entry so OverlayProvider can delegate to it
    entry._close = close;

    function open(props?: Record<string, unknown>): OverlayOpenResult {
      if (props) Object.assign(entry.props, props);
      if (!overlays.find((o) => o.id === id)) overlays.push(entry);
      entry.modelValue = true;
      const result = new Promise<unknown>((resolve) => {
        entry.resolve = resolve;
      });
      return { result };
    }

    function patch(props: Record<string, unknown>) {
      Object.assign(entry.props, props);
    }

    function isOpen() {
      return entry.modelValue;
    }

    if (options?.defaultOpen) {
      open();
    }

    return { open, close, patch, unmount, isOpen };
  }

  return { overlays, create };
}

export const useOverlay = createSharedComposable(_useOverlay);
