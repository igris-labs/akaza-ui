import { nextTick, onBeforeUnmount, onMounted } from "vue";

/**
 * Reset custom Vue state when the control's native form resets.
 * Call in setup with a getter for the mounted control. The listener is removed
 * on unmount and skips the callback if the reset event is canceled.
 *
 * @example
 * ```ts
 * import { useFormReset } from "akaza-ui";
 * import { ref, useTemplateRef } from "vue";
 *
 * const name = ref("");
 * const input = useTemplateRef<HTMLInputElement>("name");
 * // Use ref="name" on the input inside a form.
 * useFormReset(() => input.value, () => { name.value = ""; });
 * ```
 */
export function useFormReset(control: () => HTMLElement | null, reset: () => void) {
  let document: Document | undefined;
  let disposed = false;
  async function onReset(event: Event) {
    const element = control();
    const form = element && ("form" in element ? element.form : element.closest("form"));
    if (!form || event.target !== form) return;
    await nextTick();
    if (!disposed && !event.defaultPrevented) reset();
  }
  onMounted(() => {
    document = control()?.ownerDocument;
    document?.addEventListener("reset", onReset, true);
  });
  onBeforeUnmount(() => {
    disposed = true;
    document?.removeEventListener("reset", onReset, true);
  });
}
