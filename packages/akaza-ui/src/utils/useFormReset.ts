import { nextTick, onBeforeUnmount, onMounted } from "vue";

/** Resolve current form ownership at reset time; native cancellation wins. */
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
