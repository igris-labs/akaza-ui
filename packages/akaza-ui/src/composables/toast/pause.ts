import type { ToastManager } from ".";

export const toastPauseHandlers = new WeakMap<ToastManager, (owner: object, paused: boolean, id?: string) => void>();
const customHolds = new WeakMap<ToastManager, Set<object>>();

// Built-in managers distinguish application, viewport and per-item action holds without a second timer.
export function setToastPaused(manager: ToastManager, owner: object, paused: boolean, id?: string) {
  const handler = toastPauseHandlers.get(manager);
  if (handler) return handler(owner, paused, id);
  const holds = customHolds.get(manager) ?? new Set<object>();
  customHolds.set(manager, holds);
  const wasPaused = holds.size > 0;
  if (paused) holds.add(owner);
  else holds.delete(owner);
  if (!wasPaused && holds.size) manager.pause();
  else if (wasPaused && !holds.size) manager.resume();
}
