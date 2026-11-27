import { createInlineEdit, definePrimitive } from "@ui-sdk/core";
import { computed, onScopeDispose, shallowRef, useId } from "vue";

interface InlineEditOptions {
  value: () => string;
  disabled: () => boolean;
  initialEditing: boolean;
  commit: (text: string, reason: string, event?: Event) => boolean;
}

interface Snapshot {
  editing: string | null;
  value: string;
  disabled: boolean;
  commit: (text: string) => boolean;
}

const editor = definePrimitive({
  name: "akaza-inline-edit",
  options: { editing: "value", value: "string", disabled: "boolean", commit: "callback" },
  state: (options: Snapshot) => ({ editing: options.editing }),
  sync: options => ({ editing: options.editing }),
  api: context => ({ edit: createInlineEdit(context, {
    key: "editing",
    value: () => context.options().value,
    disabled: () => context.options().disabled,
    commit: (_id, text) => context.options().commit(text),
  }) }),
  slots: () => ({}),
});

export function useInlineEdit(options: InlineEditOptions) {
  const id = `akaza-inline-edit-${useId()}`;
  const snapshot = (editing: boolean, commit: Snapshot["commit"] = () => false) => ({
    id,
    editing: editing ? "value" : null,
    value: options.value(),
    disabled: options.disabled(),
    commit,
  });
  // Seed SSR state without start(), which requires a browser HTMLElement global.
  const instance = editor(snapshot(options.initialEditing));
  const state = shallowRef(instance.get());
  const stop = instance.subscribe(() => { state.value = { ...instance.get() }; });
  const edit = instance.api.edit;
  const editing = computed(() => edit.editing(state.value) !== null);

  function start(event?: Event) {
    if (editing.value) return false;
    instance.setOptions(snapshot(false));
    return edit.start("value", { reason: "imperative", ...(event ? { event } : {}) });
  }

  function end(text: string, reason: string, event?: Event) {
    if (!editing.value || options.disabled()) return false;
    const commit = (value: string) => options.commit(value, reason, event);
    // Public end() reads bound DOM or start text. Snapshot the Vue draft without binding a second focus owner.
    instance.setOptions(snapshot(false, commit));
    edit.start("value", { reason: "imperative", ...(event ? { event } : {}), text });
    // SDK skips unchanged commits; Akaza still allows both submission events to veto them.
    if (text === options.value() && !commit(text)) return false;
    return edit.end("imperative", event);
  }

  function reset(editing: boolean) {
    instance.setOptions(snapshot(editing));
  }

  onScopeDispose(() => {
    stop();
    instance.destroy();
  });

  return { editing, start, end, cancel: edit.cancel, reset };
}
