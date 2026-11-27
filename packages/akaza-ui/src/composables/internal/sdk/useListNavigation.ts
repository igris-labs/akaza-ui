import { createListbox, definePrimitive } from "@ui-sdk/core";
import { onScopeDispose, useId } from "vue";

interface ListNavigationOptions {
  items: () => Array<{ value: string; label: string; disabled: boolean }>;
  active: () => string | null;
  loop: () => boolean;
}

interface InstanceOptions {
  config: ListNavigationOptions;
  highlighted: string | null;
}

const navigation = definePrimitive({
  name: "akaza-list-navigation",
  options: { config: "value", highlighted: "value" },
  state: (options: InstanceOptions) => ({ highlighted: options.highlighted }),
  sync: options => ({ highlighted: options.highlighted }),
  api: context => ({
    listbox: createListbox(context, {
      key: "highlighted",
      focus: "virtual",
      items: () => context.options().config.items(),
      filter: () => false,
      loop: () => context.options().config.loop(),
    }),
  }),
  slots: () => ({}),
});

export function useListNavigation(options: ListNavigationOptions) {
  const id = `akaza-list-navigation-${useId()}`;
  const instance = navigation({ id, config: options, highlighted: options.active() });
  onScopeDispose(() => instance.destroy());

  function move(step: number | "first" | "last", event?: Event): string | null {
    // SDK proposes a target from accepted Vue state; it never binds or scrolls DOM.
    instance.setOptions({ id, config: options, highlighted: options.active() });
    instance.api.listbox.move(step, event);
    return instance.get().highlighted;
  }

  return { move };
}
