import { onScopeDispose } from "vue";

/** A replaceable timeout; the caller owns the action and interaction policy. */
export function useDelayedAction() {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cancel() {
    clearTimeout(timer);
    timer = undefined;
  }

  function schedule(action: () => void, delay: number) {
    cancel();
    timer = setTimeout(() => {
      timer = undefined;
      action();
    }, delay);
  }

  onScopeDispose(cancel);
  return { schedule, cancel };
}
