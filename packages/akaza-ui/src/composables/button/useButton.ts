import type { ComputedRef, MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";

export interface UseButtonOptions {
  disabled?: MaybeRefOrGetter<boolean>;
  focusableWhenDisabled?: MaybeRefOrGetter<boolean>;
}

export interface UseButtonReturn {
  isDisabled: ComputedRef<boolean>;
  isFocusable: ComputedRef<boolean>;
  onClick: (event: MouseEvent | KeyboardEvent) => void;
}

export function useButton(options: UseButtonOptions = {}): UseButtonReturn {
  const isDisabled = computed(() => toValue(options.disabled) ?? false);
  const isFocusable = computed(
    () => toValue(options.focusableWhenDisabled) ?? false,
  );

  function onClick(event: MouseEvent | KeyboardEvent) {
    if (isDisabled.value) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  return { isDisabled, isFocusable, onClick };
}
