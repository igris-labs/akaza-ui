import { isComposing } from "@ui-sdk/core";
import { button } from "@ui-sdk/core/button";
import { onScopeDispose, useId } from "vue";

export function useButtonKeys(disabled: () => boolean) {
  const id = `akaza-button-keys-${useId()}`;
  let instance: ReturnType<typeof button> | undefined;

  function handle(event: KeyboardEvent) {
    const element = event.currentTarget as HTMLElement;
    if (element.tagName === "BUTTON" || event.target !== element || event.defaultPrevented || isComposing(event)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (disabled()) {
      event.preventDefault();
      return;
    }
    // SDK treats anchors as links even with role=button; ARIA buttons also need Space activation.
    if (element.matches("a[href][role='button']") && event.key === " ") {
      event.preventDefault();
      if (event.type === "keyup") element.click();
      return;
    }
    instance ??= button({ id });
    instance.setOptions({ id, disabled: disabled() });
    const part = instance.part("root");
    part.el = element;
    // Reuse keyboard-generated clicks only; Vue retains native click listeners and loading policy.
    button.slots.root.on?.[event.type as "keydown" | "keyup"]?.(event, part);
  }

  onScopeDispose(() => instance?.destroy());
  return { keydown: handle, keyup: handle };
}
