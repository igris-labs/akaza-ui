import type { Virtualizer } from "@ui-sdk/core";
import type { CSSProperties, Ref } from "vue";
import { createVirtualizer } from "@ui-sdk/core";
import { computed, onScopeDispose, shallowRef, watch } from "vue";

export function useCollectionVirtualizer<T>(options: {
  rows: () => readonly T[];
  key: (row: T, index: number) => string;
  itemHeight: () => number;
  overscan: () => number;
  enabled: () => boolean;
  viewport: Ref<HTMLElement | null>;
}) {
  let virtual: Virtualizer;
  const revision = shallowRef(0);
  const stopConnection = watch([options.overscan, () => options.enabled() ? options.viewport.value : null], ([overscan, element], _previous, cleanup) => {
    virtual = createVirtualizer({
      count: () => options.rows().length,
      key: index => options.key(options.rows()[index]!, index),
      estimate: () => options.itemHeight(),
      overscan,
    });
    cleanup(virtual.subscribe(() => { revision.value++; }));
    if (element) cleanup(virtual.connect(element));
    revision.value++;
  }, { immediate: true, flush: "post" });
  const stopRows = watch([() => options.rows().map(options.key), options.itemHeight], () => virtual.reset(), { flush: "sync" });
  onScopeDispose(() => {
    stopConnection();
    stopRows();
  });

  const rows = computed(() => {
    void revision.value;
    return virtual.items().map(item => ({ ...item, data: options.rows()[item.index]! }));
  });
  const size = computed(() => {
    void revision.value;
    return virtual.size();
  });

  return {
    rows,
    size,
    wrapperStyle: computed<CSSProperties>(() => {
      // Fixed-height rows stay in flow; SDK supplies the leading offset and total size.
      const start = rows.value[0]?.start ?? 0;
      return { height: `${Math.max(0, size.value - start)}px`, marginTop: `${start}px` };
    }),
    scrollTo: (index: number) => virtual.scrollToIndex(index, { align: "start" }),
  };
}
