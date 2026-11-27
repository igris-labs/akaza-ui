import type { ComputedRef, InjectionKey } from "vue";
import { computed, hasInjectionContext, inject, provide, ref } from "vue";
import { createAppState } from "../../utils/appState";
import { toastPauseHandlers } from "./pause";

export type ToastType = "status" | "alert" | "success" | "info" | "warning" | "error";
export type ToastPriority = "low" | "high";
export type ToastState = "open" | "closing";
export type ToastCloseReason = "action" | "close-button" | "escape" | "swipe" | "timeout" | "programmatic";

export interface ToastAction {
  label: string;
  /** Accessible explanation when the visible label is not self-explanatory. */
  altText?: string;
  closeOnSelect?: boolean;
  onSelect: (event?: Event) => void | Promise<void>;
}

export interface ToastItem<T = unknown> {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  priority: ToastPriority;
  duration: number;
  action?: ToastAction;
  data?: T;
  state: ToastState;
  updateKey: number;
  onClose?: (reason: ToastCloseReason) => void;
  onRemove?: () => void;
}

export interface ToastAddOptions<T = unknown> {
  id?: string;
  title?: string;
  description?: string;
  type?: ToastType;
  /** Announcement urgency, independent from visual `type`. */
  priority?: ToastPriority;
  /** Auto-dismiss delay in milliseconds. Use `0` for a persistent toast. */
  duration?: number;
  action?: ToastAction;
  data?: T;
  onClose?: (reason: ToastCloseReason) => void;
  onRemove?: () => void;
}

export interface ToastUpdateOptions<T = unknown>
  extends Partial<Omit<ToastItem<T>, "id" | "state" | "updateKey">> {
  id: string;
}

export interface ToastPromiseOptions<T> {
  loading: ToastAddOptions;
  success: ToastAddOptions | ((value: T) => ToastAddOptions);
  error: ToastAddOptions | ((error: unknown) => ToastAddOptions);
}

export interface ToastManagerOptions {
  duration?: number;
  removeDelay?: number;
}

export interface ToastManager {
  toasts: ComputedRef<ToastItem[]>;
  add: <T = unknown>(options: ToastAddOptions<T>) => string;
  update: <T = unknown>(options: ToastUpdateOptions<T>) => void;
  close: (id: string, reason?: ToastCloseReason) => void;
  remove: (id: string) => void;
  clear: (reason?: ToastCloseReason) => void;
  pause: () => void;
  resume: () => void;
  promise: <T>(source: Promise<T>, options: ToastPromiseOptions<T>) => Promise<T>;
}

interface TimerState {
  startedAt: number;
  remaining: number;
  timer: number | undefined;
}

const TOAST_MANAGER_KEY: InjectionKey<ToastManager> = Symbol("akaza-toast-manager");

function createId() {
  return `akaza-toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDefaultPriority(type: ToastType): ToastPriority {
  return type === "alert" || type === "error" ? "high" : "low";
}

/** Create a separate toast queue. Pass it to Toast and useToast to share only that queue. */
export function createToastManager(options: ToastManagerOptions = {}): ToastManager {
  const defaultDuration = options.duration ?? 5000;
  const removeDelay = options.removeDelay ?? 200;
  const items = ref<ToastItem[]>([]);
  const timers = new Map<string, TimerState>();
  const removalTimers = new Map<string, number>();
  const holds = new Map<object, string | undefined>();
  const manualPause = {};

  function isPaused(id: string) {
    return [...holds.values()].some((held) => held === undefined || held === id);
  }

  function clearTimer(id: string) {
    const state = timers.get(id);
    if (state?.timer !== undefined && typeof window !== "undefined") window.clearTimeout(state.timer);
  }

  function schedule(toast: ToastItem, remaining = toast.duration) {
    clearTimer(toast.id);
    timers.delete(toast.id);
    if (typeof window === "undefined" || !Number.isFinite(toast.duration) || toast.duration <= 0 || toast.state !== "open") return;

    const state: TimerState = { startedAt: Date.now(), remaining, timer: undefined };
    if (!isPaused(toast.id)) {
      const delay = Math.min(remaining, 2_147_483_647);
      state.timer = window.setTimeout(() => {
        if (remaining > delay) schedule(toast, remaining - delay);
        else close(toast.id, "timeout");
      }, delay);
    }
    timers.set(toast.id, state);
  }

  function add<T = unknown>(addOptions: ToastAddOptions<T>) {
    const id = addOptions.id ?? createId();
    const existing = items.value.find((item) => item.id === id);
    if (existing) {
      update({ id, ...addOptions });
      return id;
    }

    const type = addOptions.type ?? "status";
    const toast: ToastItem<T> = {
      id,
      type,
      priority: addOptions.priority ?? getDefaultPriority(type),
      duration: addOptions.duration ?? defaultDuration,
      state: "open",
      updateKey: 0,
      ...(addOptions.title !== undefined && { title: addOptions.title }),
      ...(addOptions.description !== undefined && { description: addOptions.description }),
      ...(addOptions.action !== undefined && { action: addOptions.action }),
      ...(addOptions.data !== undefined && { data: addOptions.data }),
      ...(addOptions.onClose !== undefined && { onClose: addOptions.onClose }),
      ...(addOptions.onRemove !== undefined && { onRemove: addOptions.onRemove }),
    };
    items.value.push(toast as ToastItem);
    schedule(toast as ToastItem);
    return id;
  }

  function update<T = unknown>(updateOptions: ToastUpdateOptions<T>) {
    const index = items.value.findIndex((item) => item.id === updateOptions.id);
    if (index < 0) return;
    if (typeof window !== "undefined") window.clearTimeout(removalTimers.get(updateOptions.id));
    removalTimers.delete(updateOptions.id);
    const current = items.value[index]!;
    const type = updateOptions.type ?? current.type;
    const toast: ToastItem = {
      ...current,
      ...updateOptions,
      type,
      priority: updateOptions.priority ?? (updateOptions.type ? getDefaultPriority(type) : current.priority),
      state: "open",
      updateKey: current.updateKey + 1,
    };
    items.value.splice(index, 1, toast);
    schedule(toast);
  }

  function remove(id: string) {
    clearTimer(id);
    timers.delete(id);
    if (typeof window !== "undefined") window.clearTimeout(removalTimers.get(id));
    removalTimers.delete(id);
    const toast = items.value.find((item) => item.id === id);
    if (!toast) return;
    items.value = items.value.filter((item) => item.id !== id);
    toast.onRemove?.();
  }

  function close(id: string, reason: ToastCloseReason = "programmatic") {
    const toast = items.value.find((item) => item.id === id);
    if (!toast || toast.state === "closing") return;
    clearTimer(id);
    timers.delete(id);
    toast.state = "closing";
    try {
      toast.onClose?.(reason);
    } finally {
      if (items.value.find((item) => item.id === id) === toast && toast.state === "closing") {
        if (typeof window === "undefined" || removeDelay <= 0) {
          remove(id);
        } else {
          removalTimers.set(id, window.setTimeout(() => remove(id), removeDelay));
        }
      }
    }
  }

  function clear(reason: ToastCloseReason = "programmatic") {
    const errors: unknown[] = [];
    for (const toast of items.value.slice()) {
      if (!items.value.includes(toast)) continue;
      try {
        close(toast.id, reason);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) throw errors[0];
  }

  function setPaused(owner: object, paused: boolean, id?: string) {
    if (paused === holds.has(owner)) return;
    if (paused) holds.set(owner, id);
    else holds.delete(owner);
    if (typeof window === "undefined") return;
    const now = Date.now();
    for (const toast of items.value) {
      const state = timers.get(toast.id);
      if (!state) continue;
      if (isPaused(toast.id)) {
        if (state.timer === undefined) continue;
        window.clearTimeout(state.timer);
        state.remaining = Math.max(0, state.remaining - (now - state.startedAt));
        state.timer = undefined;
      } else if (state.timer === undefined) {
        schedule(toast, state.remaining);
      }
    }
  }

  function pause() {
    setPaused(manualPause, true);
  }

  function resume() {
    setPaused(manualPause, false);
  }

  async function promise<T>(source: Promise<T>, promiseOptions: ToastPromiseOptions<T>) {
    const id = add(promiseOptions.loading);
    const loading = items.value.find((item) => item.id === id);
    const isCurrent = () => loading?.state === "open" && items.value.includes(loading);
    try {
      const value = await source;
      if (!isCurrent()) return value;
      const next = typeof promiseOptions.success === "function"
        ? promiseOptions.success(value)
        : promiseOptions.success;
      if (isCurrent()) update({ type: "success", ...next, id });
      return value;
    } catch (error) {
      if (!isCurrent()) throw error;
      const next = typeof promiseOptions.error === "function"
        ? promiseOptions.error(error)
        : promiseOptions.error;
      if (isCurrent()) update({ type: "error", ...next, id });
      throw error;
    }
  }

  const manager: ToastManager = {
    toasts: computed(() => items.value),
    add,
    update,
    close,
    remove,
    clear,
    pause,
    resume,
    promise,
  };
  toastPauseHandlers.set(manager, setPaused);
  return manager;
}

const useDefaultManager = createAppState(createToastManager);

/** Call in setup to give descendant components their own toast queue. */
export function provideToastManager(manager = createToastManager()) {
  provide(TOAST_MANAGER_KEY, manager);
  return manager;
}

/**
 * Add, update, or dismiss notifications from setup. Render Toast to show them.
 * Pass a manager to choose a queue, or use the queue provided by an ancestor.
 * Without either, this uses the default queue. During SSR that queue is scoped to the app.
 *
 * @example
 * ```ts
 * import { useToast } from "akaza-ui";
 *
 * // Render <Toast /> in the app.
 * const toast = useToast();
 * function reportSaved() {
 *   return toast.add({ title: "Saved", type: "success" });
 * }
 * ```
 */
export function useToast(manager?: ToastManager): ToastManager {
  if (manager) return manager;
  const provided = hasInjectionContext() ? inject(TOAST_MANAGER_KEY, null) : null;
  return provided ?? useDefaultManager();
}
