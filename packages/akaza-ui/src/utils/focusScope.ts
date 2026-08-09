import type { Ref } from "vue";
import { createGlobalState } from "@vueuse/core";
import { onUnmounted } from "vue";
import { getFocusableElements } from "./focusable";

interface FocusScopeAPI {
  paused: boolean;
  container: Ref<HTMLElement | null>;
  getExemptElements: () => Array<HTMLElement | null | undefined>;
  pause: () => void;
  resume: () => void;
}

interface OutsideTreeState {
  ariaHidden: string | null;
  inert: boolean;
}

/**
 * Global stack of active focus scopes.
 * When a new scope is added, the previous top is paused (its Tab handler
 * stays registered but becomes a no-op). When a scope is removed, the new
 * top is resumed. This mirrors Reka UI's FocusScope/stack.ts approach.
 */
const useScopeStack = createGlobalState(() => {
  const stack: FocusScopeAPI[] = [];
  const outsideTree = new Map<HTMLElement, OutsideTreeState>();
  let previousBodyOverflow = "";

  function restoreOutsideTree() {
    for (const [element, state] of outsideTree) {
      element.inert = state.inert;
      if (state.ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", state.ariaHidden);
    }
    outsideTree.clear();
  }

  function hideOutsideTree() {
    restoreOutsideTree();
    if (typeof document === "undefined") return;
    const top = stack[stack.length - 1];
    const protectedElements = [top?.container.value, ...(top?.getExemptElements() ?? [])]
      .filter((element): element is HTMLElement => Boolean(element));
    if (!protectedElements.length) return;

    function visit(parent: HTMLElement) {
      for (const child of Array.from(parent.children) as HTMLElement[]) {
        const containsProtected = protectedElements.some((element) =>
          child === element || child.contains(element),
        );
        if (containsProtected) {
          if (!protectedElements.includes(child)) visit(child);
          continue;
        }
        outsideTree.set(child, {
          ariaHidden: child.getAttribute("aria-hidden"),
          inert: child.inert,
        });
        child.inert = true;
        child.setAttribute("aria-hidden", "true");
      }
    }

    visit(document.body);
  }

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
      hideOutsideTree();
    },
    remove(scope: FocusScopeAPI) {
      const idx = stack.indexOf(scope);
      if (idx !== -1) stack.splice(idx, 1);
      unlockBody();
      // resume the new top
      stack[stack.length - 1]?.resume();
      hideOutsideTree();
    },
  };
});

interface FocusScopeOptions {
  /** CSS selector for the element to focus when the scope activates. Falls back to the first focusable element. */
  initialFocusSelector?: string;
  /** Elements outside the focus container that remain interactive, such as its backdrop. */
  getExemptElements?: () => Array<HTMLElement | null | undefined>;
}

export function useFocusScope(containerRef: Ref<HTMLElement | null>, options: FocusScopeOptions = {}) {
  let previouslyFocused: HTMLElement | null = null;
  let focusOperation = 0;

  const scope: FocusScopeAPI = {
    paused: false,
    container: containerRef,
    getExemptElements: options.getExemptElements ?? (() => []),
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

  function activate(restoreFocusTarget?: HTMLElement | null) {
    if (typeof document === "undefined") return;
    focusOperation += 1;
    previouslyFocused = restoreFocusTarget ?? document.activeElement as HTMLElement;
    add(scope);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    focusFirst();
  }

  function deactivate() {
    if (typeof document === "undefined") return;
    const operation = ++focusOperation;
    const restoreTarget = previouslyFocused;
    remove(scope);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("focusin", handleFocusIn);
    previouslyFocused = null;
    restoreTarget?.focus({ preventScroll: true });
    if (restoreTarget && document.activeElement !== restoreTarget) {
      requestAnimationFrame(() => {
        if (focusOperation === operation && restoreTarget.isConnected) {
          restoreTarget.focus({ preventScroll: true });
        }
      });
    }
  }

  onUnmounted(deactivate);

  return { activate, deactivate };
}
