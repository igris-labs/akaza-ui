import { createGlobalState, onKeyStroke } from "@vueuse/core";
import { onUnmounted } from "vue";

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
  return layers;
});

export function useDismissableLayer(onDismiss: (event?: KeyboardEvent) => void) {
  const layers = useLayerStack();

  function register() {
    layers.push(onDismiss);
  }

  function unregister() {
    const idx = layers.lastIndexOf(onDismiss);
    if (idx !== -1) layers.splice(idx, 1);
  }

  // Each layer listens independently — only the topmost one acts.
  onKeyStroke("Escape", (event) => {
    const isTop = layers[layers.length - 1] === onDismiss;
    if (!isTop) return;
    event.preventDefault();
    onDismiss(event);
  });

  onUnmounted(unregister);

  return { register, unregister };
}
