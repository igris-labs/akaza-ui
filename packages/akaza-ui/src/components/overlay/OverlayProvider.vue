<script setup lang="ts">
import type { _OverlayEntry } from "../../composables/overlay/useOverlay";
import { useOverlay } from "../../composables/overlay";

const { overlays } = useOverlay();

/**
 * Called when the component's v-model goes false internally
 * (e.g. Escape key, backdrop click inside the component).
 * Delegates to the instance's close() to resolve the promise.
 */
function onModelClose(overlay: _OverlayEntry) {
  overlay._close(undefined);
}

/**
 * Called when the component emits a `close` event with a return value.
 * Use this in wrapper components that need to return data:
 *   emit('close', result)
 */
function onCloseEvent(overlay: _OverlayEntry, value: unknown) {
  overlay._close(value);
}
</script>

<template>
  <component
    :is="overlay.component"
    v-for="overlay in overlays"
    :key="overlay.id"
    v-bind="overlay.props"
    :model-value="overlay.modelValue"
    @update:model-value="
      (val: boolean) => {
        if (!val) onModelClose(overlay);
      }
    "
    @close="(val: unknown) => onCloseEvent(overlay, val)"
  />
</template>
