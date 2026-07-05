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
  let previousBodyOverflow = "";

  function lockBody() {
    if (typeof document === "undefined") return;
    if (stack.length !== 1) return;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function unlockBody() {
    if (typeof document === "undefined") return;
    if (stack.length !== 0) return;
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = "";
  }

  return {
    add(scope: FocusScopeAPI) {
      const top = stack[stack.length - 1];
      if (top && top !== scope) top.pause();
      // remove first in case it's being re-added (promotes to top)
      const idx = stack.indexOf(scope);
      if (idx !== -1) stack.splice(idx, 1);
      stack.push(scope);
      lockBody();
    },
    remove(scope: FocusScopeAPI) {
      const idx = stack.indexOf(scope);
      if (idx !== -1) stack.splice(idx, 1);
      unlockBody();
      // resume the new top
      stack[stack.length - 1]?.resume();
    },
  };
});

interface FocusScopeOptions {
  /** CSS selector for the element to focus when the scope activates. Falls back to the first focusable element. */
  initialFocusSelector?: string;
}

export function useFocusScope(containerRef: Ref<HTMLElement | null>, options: FocusScopeOptions = {}) {
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

  function focusFirst() {
    if (!containerRef.value) return;
    const initial = options.initialFocusSelector
      ? containerRef.value.querySelector<HTMLElement>(options.initialFocusSelector)
      : null;
    if (initial) {
      initial.focus();
    } else {
      const focusable = getFocusableElements(containerRef.value);
      (focusable[0] ?? containerRef.value).focus();
    }
  }

  function handleFocusIn(event: FocusEvent) {
    if (scope.paused || !containerRef.value) return;
    if (containerRef.value.contains(event.target as Node)) return;
    focusFirst();
  }

  function activate() {
    if (typeof document === "undefined") return;
    previouslyFocused = document.activeElement as HTMLElement;
    focusFirst();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    add(scope);
  }

  function deactivate() {
    if (typeof document === "undefined") return;
    remove(scope);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("focusin", handleFocusIn);
    previouslyFocused?.focus();
    previouslyFocused = null;
  }

  onUnmounted(deactivate);

  return { activate, deactivate };
}
