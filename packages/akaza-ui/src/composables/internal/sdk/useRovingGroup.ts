import { createRovingFocus, definePrimitive, isComposing, keepFocus } from "@ui-sdk/core";
import { computed, onBeforeUpdate, onScopeDispose, shallowRef, useId, watchPostEffect } from "vue";

interface GroupOptions {
  keys: () => readonly string[];
  disabled: (key: string) => boolean;
  preferred: () => string | undefined;
  orientation: () => "horizontal" | "vertical" | "both";
  loop: () => boolean;
  remember?: boolean;
  enabled?: () => boolean;
}

function preferredKey(options: GroupOptions): string | undefined {
  const keys = options.keys().filter(key => !options.disabled(key));
  const requested = options.preferred();
  return requested !== undefined && keys.includes(requested) ? requested : keys[0];
}

const group = definePrimitive({
  name: "akaza-roving-group",
  options: { config: "value" },
  state: (_options: { config: GroupOptions }) => ({ focused: null as string | null }),
  api: (context) => {
    const config = () => context.options().config;
    return {
      roving: createRovingFocus(context, {
        slot: "item",
        key: "focused",
        orientation: () => config().orientation(),
        loop: () => config().loop(),
        remember: config().remember ?? true,
        focusable: item => config().keys().includes(item.key) && !config().disabled(item.key),
        preferred: item => item.key === preferredKey(config()),
        claims: (_state, item) => item.key === preferredKey(config()),
      }),
    };
  },
  slots: slot => ({ item: slot<{ value: string }>({ props: { value: "string" } }) }),
});

export function useRovingGroup(options: GroupOptions) {
  const instance = group({ id: `akaza-roving-${useId()}`, config: options });
  const state = shallowRef({ ...instance.get() });
  const stop = instance.subscribe(() => { state.value = { ...instance.get() }; });
  const bindings = new Map<string, { element: HTMLElement; dispose: () => void }>();
  const roving = instance.api.roving;
  const tabStop = computed(() => options.keys().find(key => !options.disabled(key)
    && roving.tabIndex(state.value, { key, props: { value: key } }) === "0"));

  function bind(key: string, element: HTMLElement | null) {
    const existing = bindings.get(key);
    if (existing?.element === element) return;
    existing?.dispose();
    bindings.delete(key);
    if (element) bindings.set(key, { element, dispose: roving.bind(element, { key, props: { value: key } }) });
  }

  function tabIndex(key: string): number {
    if (!options.keys().includes(key) || options.disabled(key)) return -1;
    if (options.enabled?.() === false) return 0;
    return key === tabStop.value ? 0 : -1;
  }

  function keydown(event: KeyboardEvent, element: HTMLElement) {
    if (options.enabled?.() === false || event.defaultPrevented || isComposing(event)
      || event.altKey || event.ctrlKey || event.metaKey) return;
    return roving.keydown(event, element);
  }

  onBeforeUpdate(() => {
    const focused = [...bindings].find(([, binding]) => binding.element === document.activeElement);
    // Vue's keyed DOM moves can blur an item that still exists.
    if (focused) keepFocus(() => bindings.get(focused[0])?.element);
  });

  watchPostEffect(() => {
    const keys = options.keys();
    keys.forEach(options.disabled);
    options.preferred();
    options.orientation();
    options.loop();
    const current = state.value.focused;
    if (options.remember !== false && (current === null || !keys.includes(current) || options.disabled(current))) {
      const fallback = preferredKey(options);
      // SDK removal reconciliation can wait a task; keep Vue's tab stop current.
      if (fallback !== undefined) roving.remember(fallback);
    }
    roving.check();
  });

  onScopeDispose(() => {
    stop();
    bindings.forEach(binding => binding.dispose());
    bindings.clear();
    instance.destroy();
  });

  return { bind, tabIndex, tabStop, keydown, focus: roving.focus, remember: roving.remember };
}
