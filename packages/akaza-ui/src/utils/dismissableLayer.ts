import { createGlobalState, onKeyStroke } from "@vueuse/core";
import { onUnmounted, ref } from "vue";

/**
 * Global ordered registry of active dismissable layers.
 * Each entry is the dismiss callback of that layer, used as its identity.
 *
 * Mirrors Reka UI's DismissableLayer approach: every layer registers its own
 * onKeyStroke('Escape') handler, but only the one at the top of the stack
 * (highest index) acts — all others return early.
 */
const useLayerStack = createGlobalState(() => {
  const layers: Array<(event?: KeyboardEvent) => void> = [];
  let nextOrder = 0;
  return {
    layers,
    allocateOrder() {
      nextOrder += 2;
      return nextOrder;
    },
    resetOrder() {
      if (layers.length === 0) nextOrder = 0;
    },
  };
});

export function useDismissableLayer(onDismiss: (event?: KeyboardEvent) => void) {
  const stack = useLayerStack();
  const layerOrder = ref(0);

  function register() {
    if (stack.layers.includes(onDismiss)) return;
    layerOrder.value = stack.allocateOrder();
    stack.layers.push(onDismiss);
  }

  function unregister() {
    const idx = stack.layers.lastIndexOf(onDismiss);
    if (idx !== -1) stack.layers.splice(idx, 1);
    layerOrder.value = 0;
    stack.resetOrder();
  }

  // Each layer listens independently — only the topmost one acts.
  onKeyStroke("Escape", (event) => {
    if (event.defaultPrevented) return;
    const isTop = stack.layers[stack.layers.length - 1] === onDismiss;
    if (!isTop) return;
    event.preventDefault();
    onDismiss(event);
  });

  onUnmounted(unregister);

  return { layerOrder, register, unregister };
}
