import type { ChangeDetails, Modal, PopupContentProps, PopupPreset } from "@ui-sdk/core";
import { createPopup, definePrimitive, popupSlots, popupState } from "@ui-sdk/core";
import { dialogPreset } from "@ui-sdk/core/dialog";
import { popoverPreset } from "@ui-sdk/core/popover";

export interface Batch13PopupOptions {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: Modal;
  dismissible?: boolean;
  onOpenChange?: (open: boolean, details: ChangeDetails<string>) => void;
}

function defineBatch13Popup(name: string, preset: PopupPreset) {
  return definePrimitive({
    name,
    options: {
      open: "boolean", defaultOpen: "boolean", modal: "value",
      dismissible: "boolean", onOpenChange: "callback",
    },
    state: (options: Batch13PopupOptions) => popupState(options),
    sync: options => options.open === undefined ? {} : { open: options.open },
    api: context => createPopup(context, { preset }),
    slots: slot => popupSlots(slot),
  });
}

export const batch13Dialog = defineBatch13Popup("batch13-dialog", dialogPreset);
export const batch13Popover = defineBatch13Popup("batch13-popover", popoverPreset);

// Fixed test fixture, not a renderer: presence is inspected, never reimplemented.
export function bindBatch13Popup(
  primitive: typeof batch13Dialog,
  options: Batch13PopupOptions & { id: string },
  trigger: HTMLButtonElement,
  content: HTMLDivElement,
  contentProps: PopupContentProps = {},
) {
  const instance = primitive(options);
  const triggerPart = instance.part("trigger", { id: `${options.id}-trigger` });
  const contentPart = instance.part("content", { id: `${options.id}-content`, ...contentProps });
  triggerPart.el = trigger;
  contentPart.el = content;
  const refresh = () => {
    for (const [element, definition, part] of [
      [trigger, primitive.slots.trigger, triggerPart],
      [content, primitive.slots.content, contentPart],
    ] as const) {
      const attrs = definition.attrs?.(instance.get(), part);
      for (const [key, value] of Object.entries(attrs ?? {})) {
        if (value === undefined || value === null) element.removeAttribute(key);
        else element.setAttribute(key, String(value));
      }
    }
  };
  refresh();
  const unsubscribe = instance.subscribe(refresh);
  const disconnectTrigger = primitive.slots.trigger.connect?.(trigger);
  const disconnectContent = primitive.slots.content.connect?.(content);
  const unbindTrigger = primitive.slots.trigger.bind?.(trigger, triggerPart);
  const unbindContent = primitive.slots.content.bind?.(content, contentPart);
  const keydown = (event: KeyboardEvent) => primitive.slots.content.on?.keydown?.(event, contentPart);
  const triggerKeydown = (event: KeyboardEvent) => primitive.slots.trigger.on?.keydown?.(event, triggerPart);
  const press = (event: MouseEvent) => {
    const handler = primitive.slots.trigger.press;
    if (typeof handler === "function") handler(triggerPart, event);
  };
  content.addEventListener("keydown", keydown);
  trigger.addEventListener("keydown", triggerKeydown);
  trigger.addEventListener("click", press);
  return {
    instance,
    trigger,
    content,
    present: () => primitive.slots.content.present?.(instance.get(), contentPart),
    destroy() {
      content.removeEventListener("keydown", keydown);
      trigger.removeEventListener("keydown", triggerKeydown);
      trigger.removeEventListener("click", press);
      unbindContent?.();
      unbindTrigger?.();
      disconnectContent?.();
      disconnectTrigger?.();
      unsubscribe();
      contentPart.el = undefined;
      triggerPart.el = undefined;
      instance.destroy();
    },
  };
}
