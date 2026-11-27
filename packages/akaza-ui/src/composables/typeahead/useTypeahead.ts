import type { MaybeRefOrGetter, Ref } from "vue";
import { onScopeDispose, readonly, ref, toValue } from "vue";

export interface UseTypeaheadOptions {
  /** Milliseconds before the query clears. Defaults to 500. */
  timeout?: MaybeRefOrGetter<number>;
  /** Repeated letters restart the query, allowing consumers to cycle matches. */
  resetOnRepeatedCharacter?: boolean;
}

export interface UseTypeaheadReturn {
  query: Readonly<Ref<string>>;
  /** Append already-normalized text and return the resulting query. */
  push: (text: string) => string;
  reset: () => void;
}

/**
 * Collect typed characters into a query that clears after a short pause.
 * Call in setup and read the query ref or the string returned by push().
 * It does not listen for keys, match items, or move focus.
 *
 * @example
 * ```ts
 * import { useTypeahead } from "akaza-ui";
 *
 * const { push } = useTypeahead({ timeout: 500 });
 * const query = push("a"); // "a"
 * ```
 */
export function useTypeahead(options: UseTypeaheadOptions = {}): UseTypeaheadReturn {
  const query = ref("");
  let timer: ReturnType<typeof setTimeout> | undefined;
  function reset() {
    clearTimeout(timer);
    timer = undefined;
    query.value = "";
  }
  function push(text: string): string {
    if (!text) return query.value;
    clearTimeout(timer);
    query.value = options.resetOnRepeatedCharacter && query.value && [...query.value].every(value => value === text)
      ? text
      : query.value + text;
    timer = setTimeout(reset, toValue(options.timeout) ?? 500);
    return query.value;
  }
  onScopeDispose(reset);
  return { query: readonly(query), push, reset };
}
