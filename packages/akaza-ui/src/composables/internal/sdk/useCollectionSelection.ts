import { useSelectionGroup } from "./useSelectionGroup";

interface CollectionSelectionOptions<Value> {
  value: () => readonly Value[];
  equals: (left: Value, right: Value) => boolean;
  change: (value: Value[], reason: string, event?: Event) => boolean;
}

export function useCollectionSelection<Value>(options: CollectionSelectionOptions<Value>) {
  let selected: string[] = [];
  let order: string[] = [];
  let values = new Map<string, Value>();
  let disabled = new Set<string>();
  let requested = false;
  let accepted = false;
  const selection = useSelectionGroup({
    value: () => selected,
    order: () => order,
    multiple: () => true,
    disabled: key => disabled.has(key),
    change: (keys, reason, event) => {
      requested = true;
      accepted = options.change(keys.map(key => values.get(key)!), reason, event);
      return accepted;
    },
  });

  function prepare() {
    requested = false;
    accepted = false;
    values = new Map();
    disabled = new Set();
    selected = options.value().map((value, index) => {
      const key = `selected-${index}`;
      values.set(key, value);
      return key;
    });
  }

  function select(value: Value, toggle: boolean, reason: string, event?: Event): boolean {
    prepare();
    // Keys live for one action only; comparators and original objects stay in Akaza.
    selected = selected.map(key => options.equals(values.get(key)!, value) ? "target" : key);
    values.set("target", value);
    order = ["target"];
    selection.select("target", toggle, reason, event);
    // Akaza emits repeated choices; SDK suppresses unchanged choose requests.
    if (!requested) accepted = options.change([value], reason, event);
    return accepted;
  }

  function replaceRange(items: readonly { value: Value; disabled: boolean }[], from: number, to: number, reason: string, event?: Event): boolean {
    prepare();
    order = items.map((item, index) => {
      const key = `option-${index}`;
      values.set(key, item.value);
      if (item.disabled) disabled.add(key);
      return key;
    });
    selection.replaceRange(order[to]!, order[from]!, reason, event);
    if (!requested) accepted = options.change([], reason, event);
    return accepted;
  }

  return { select, replaceRange };
}
