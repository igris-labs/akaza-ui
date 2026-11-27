import type { ReorderDraft } from "@ui-sdk/core";
import { bindDrag, createReorder, definePrimitive, dragThreshold, keepFocus } from "@ui-sdk/core";
import { computed, onBeforeUpdate, onScopeDispose, shallowRef, useId, watch } from "vue";

interface TableReorderOptions {
  keys: () => string[];
  disabled: (key: string) => boolean;
  label: (key: string) => string | undefined;
  horizontal?: boolean;
  rtl?: () => boolean;
  move: (source: string, target: string, event?: Event) => boolean;
}

const tableReorder = definePrimitive({
  name: "akaza-table-reorder",
  options: { value: "list", config: "value" },
  state: (options: { value: string[]; config: TableReorderOptions }) => ({
    value: options.value,
    moving: null as ReorderDraft | null,
  }),
  sync: options => ({ value: options.value }),
  api: (context) => {
    const config = context.options().config;
    const reorder = createReorder(context, {
      slot: "item",
      key: "value",
      draft: "moving",
      orientation: () => config.horizontal ? "horizontal" : "vertical",
      disabled: item => config.disabled(item.key),
      label: config.label,
      set: (next, details) => {
        const { value, moving } = context.store.get();
        if (!moving || config.disabled(moving.key)) return false;
        const target = value[next.indexOf(moving.key)];
        return target !== undefined && config.move(moving.key, target, details.event);
      },
    });
    return { reorder, clear: () => context.store.set({ moving: null }) };
  },
  slots: slot => ({ item: slot<{ value: string }>({ props: { value: "string" } }) }),
});

export function useTableReorder(options: TableReorderOptions) {
  const id = `akaza-table-reorder-${useId()}`;
  const instance = tableReorder({ id, value: options.keys(), config: options });
  const state = shallowRef({ ...instance.get() });
  const unsubscribe = instance.subscribe(() => { state.value = { ...instance.get() }; });
  const { reorder } = instance.api;
  const bindings = new Map<string, { element: HTMLElement; dispose: () => void }>();
  let stopPointer: (() => void) | undefined;

  function sync() {
    instance.setOptions({ id, value: options.keys(), config: options });
  }

  function bind(key: string, element: unknown) {
    const existing = bindings.get(key);
    if (existing?.element === element) return;
    existing?.dispose();
    bindings.delete(key);
    if (element instanceof HTMLElement) {
      bindings.set(key, { element, dispose: reorder.bind(element, { key, props: { value: key } }) });
    }
  }

  function cancel() {
    stopPointer?.();
    stopPointer = undefined;
    reorder.cancel();
    instance.api.clear();
    sync();
  }

  function finish(event?: Event) {
    try {
      reorder.drop(event);
    } finally {
      // Controlled parents may refuse a request; never carry the optimistic SDK draft into the next action.
      instance.api.clear();
      sync();
    }
  }

  function moveAt(event: PointerEvent) {
    const draft = instance.get().moving;
    if (!draft) return;
    const horizontal = options.horizontal;
    const reversed = horizontal && options.rtl?.();
    const pointer = horizontal ? event.clientX : event.clientY;
    const remaining = instance.get().value.filter(key => !draft.keys.includes(key));
    let index = 0;
    for (const key of remaining) {
      const rect = bindings.get(key)?.element.getBoundingClientRect();
      if (!rect) continue;
      const middle = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      if (reversed ? pointer < middle : pointer > middle) index++;
    }
    reorder.moveTo(index);
  }

  function pointerdown(key: string, event: PointerEvent) {
    if (stopPointer || event.defaultPrevented || event.button !== 0 || event.isPrimary === false) return;
    sync();
    if (!options.keys().includes(key) || options.disabled(key)) return;
    if (instance.get().moving) cancel();
    stopPointer = bindDrag(event.currentTarget as HTMLElement, event, {
      threshold: dragThreshold,
      cancelOnEscape: true,
      onStart: () => reorder.grab(key),
      onMove: sample => moveAt(sample.event),
      onEnd: (release, canceled) => {
        stopPointer = undefined;
        if (canceled) cancel();
        else {
          // bindDrag flushes the latest move, not necessarily the pointerup coordinates.
          moveAt(release);
          finish(release);
        }
      },
    });
  }

  function keydown(key: string, event: KeyboardEvent) {
    if (stopPointer || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    sync();
    const dropping = instance.get().moving && (event.key === " " || event.key === "Enter");
    try {
      reorder.keydown(event, key);
    } finally {
      if (dropping) {
        instance.api.clear();
        sync();
      }
    }
  }

  watch(() => options.keys().map(key => [key, options.disabled(key)]), () => {
    if (instance.get().moving || stopPointer) cancel();
    else sync();
  });

  onBeforeUpdate(() => {
    const active = [...bindings.values()].map(binding => binding.element)
      .find(element => element.contains(element.ownerDocument.activeElement));
    const focused = active?.ownerDocument.activeElement as HTMLElement | null;
    if (focused) keepFocus(() => focused.isConnected ? focused : undefined);
  });

  onScopeDispose(() => {
    stopPointer?.();
    unsubscribe();
    bindings.forEach(binding => binding.dispose());
    bindings.clear();
    instance.destroy();
  });

  const target = computed(() => {
    const draft = state.value.moving;
    return draft ? state.value.value[draft.order.indexOf(draft.key)] : undefined;
  });

  return {
    bind, pointerdown, keydown, cancel,
    busy: () => Boolean(stopPointer || instance.get().moving),
    grabbed: (key: string) => state.value.moving?.key === key,
    target: (key: string) => target.value === key && !state.value.moving?.keys.includes(key),
  };
}
