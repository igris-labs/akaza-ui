import { createSelection, definePrimitive } from "@ui-sdk/core";
import { onScopeDispose, useId } from "vue";

interface SelectionGroupOptions {
  value: () => string[];
  order: () => readonly string[];
  multiple: () => boolean;
  disabled: (key: string) => boolean;
  change: (value: string[], reason: string, event?: Event) => boolean;
}

interface InstanceOptions {
  value: string[];
  config: SelectionGroupOptions;
}

const group = definePrimitive({
  name: "akaza-selection-group",
  options: { value: "list", config: "value" },
  state: (options: InstanceOptions) => ({ value: options.value }),
  sync: options => ({ value: options.value }),
  api: context => ({
    selection: createSelection(context, {
      key: "value",
      order: () => context.options().config.order(),
      multiple: () => context.options().config.multiple(),
      selectable: key => context.options().config.order().includes(key) && !context.options().config.disabled(key),
      set: (value, details: { reason: string; event?: Event }) => context.options().config.change(value, details.reason, details.event),
    }),
  }),
  slots: () => ({}),
});

export function useSelectionGroup(options: SelectionGroupOptions) {
  const id = `akaza-selection-${useId()}`;
  const instance = group({ id, value: options.value(), config: options });
  onScopeDispose(() => instance.destroy());

  function select(key: string, toggle: boolean, reason: string, event?: Event) {
    // Read the Vue model at the action boundary; SDK never commits a second selection.
    instance.setOptions({ id, value: [...options.value()], config: options });
    const details = event ? { reason, event } : { reason };
    if (toggle) instance.api.selection.toggle(key, details);
    else instance.api.selection.choose(key, details);
  }

  function replaceRange(key: string, from: string, reason: string, event?: Event) {
    instance.setOptions({ id, value: [...options.value()], config: options });
    instance.api.selection.setAnchor(from);
    instance.api.selection.extend(key, { reason, ...(event ? { event } : {}), additive: false });
  }

  return { select, replaceRange };
}
