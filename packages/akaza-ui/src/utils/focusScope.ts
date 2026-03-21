import type { Ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { onUnmounted } from "vue";
import { getFocusableElements } from "./focusable";

interface FocusScopeAPI {
  paused: boolean;
  pause: () => void;
  resume: () => void;
}

/**
 * Global stack of active focus scopes.
 * When a new scope is added, the previous top is paused (its Tab handler
 * stays registered but becomes a no-op). When a scope is removed, the new
 * top is resumed. This mirrors Reka UI's FocusScope/stack.ts approach.
 */
const useScopeStack = createGlobalState(() => {
  const stack: FocusScopeAPI[] = [];

  return {
    add(scope: FocusScopeAPI) {
      const top = stack[stack.length - 1];
      if (top && top !== scope) top.pause();
      // remove first in case it's being re-added (promotes to top)
      const idx = stack.indexOf(scope);
      if (idx !== -1) stack.splice(idx, 1);
      stack.push(scope);
    },
    remove(scope: FocusScopeAPI) {
      const idx = stack.indexOf(scope);
      if (idx !== -1) stack.splice(idx, 1);
      // resume the new top
      stack[stack.length - 1]?.resume();
    },
  };
});

export function useFocusScope(containerRef: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null = null;

  const scope: FocusScopeAPI = {
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    },
  };

  const { add, remove } = useScopeStack();

  function handleKeyDown(event: KeyboardEvent) {
    if (scope.paused || event.key !== "Tab" || !containerRef.value) return;

    const focusable = getFocusableElements(containerRef.value);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (event.shiftKey) {
      if (document.activeElement === first || document.activeElement === containerRef.value) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function activate() {
    previouslyFocused = document.activeElement as HTMLElement;
    if (containerRef.value) {
      const focusable = getFocusableElements(containerRef.value);
      (focusable[0] ?? containerRef.value).focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    add(scope);
  }

  function deactivate() {
    remove(scope);
    document.removeEventListener("keydown", handleKeyDown);
    previouslyFocused?.focus();
    previouslyFocused = null;
  }

  onUnmounted(deactivate);

  return { activate, deactivate };
}
