import { createTypeahead, isComposing, isTypeaheadKey } from "@ui-sdk/core";
import { onScopeDispose } from "vue";

interface TypeaheadSearchOptions<T> {
  items: () => readonly T[];
  label: (item: T) => string;
  disabled?: (item: T) => boolean;
}

export function useTypeaheadSearch<T>(options: TypeaheadSearchOptions<T>) {
  const typeahead = createTypeahead();
  onScopeDispose(typeahead.reset);

  function search(event: KeyboardEvent, currentIndex: number): number {
    if (event.defaultPrevented || isComposing(event) || !isTypeaheadKey(event)) return -1;
    if (event.key === " " && !typeahead.active()) return -1;

    const items = options.items();
    const indices = items.flatMap((item, index) => options.disabled?.(item) ? [] : [index]);
    if (!indices.length) return -1;

    event.preventDefault();
    const match = typeahead(event.key, indices.map(index => options.label(items[index]!)), indices.indexOf(currentIndex));
    return match >= 0 ? indices[match]! : -1;
  }

  return { search, active: typeahead.active, reset: typeahead.reset };
}
