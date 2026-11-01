import type { Ref } from "vue";
import type { AkazaChangeEventDetails } from "../types";
import { computed, nextTick, onMounted, ref, watch } from "vue";

interface ChildValidationState {
  invalid: boolean;
  filled: boolean;
}

/** Preserve the child's cancellation function when forwarding an endpoint event. */
export function rangeEndpointDetails(endpoint: "start" | "end", details: AkazaChangeEventDetails): AkazaChangeEventDetails {
  return {
    reason: `${endpoint}-${details.reason}`,
    ...(details.event && { event: details.event }),
    cancel: details.cancel,
  };
}

export function useRangeFieldState(options: {
  root: Ref<HTMLElement | null>;
  children: () => Array<ChildValidationState | undefined>;
  updateValidity: () => void;
}) {
  const touched = ref(false);
  const focused = ref(false);
  const validationActive = ref(false);
  const childInvalid = computed(() => options.children().some(state => state?.invalid));
  const childFilled = computed(() => options.children().some(state => state?.filled));
  function syncChildState() {
    options.updateValidity();
  }
  watch([childInvalid, childFilled], syncChildState, { flush: "post" });
  onMounted(syncChildState);

  function onInput() {
    validationActive.value = true;
    nextTick(syncChildState);
  }
  function onFocusin() {
    focused.value = true;
  }
  function onFocusout(event: FocusEvent) {
    if (options.root.value?.contains(event.relatedTarget as Node | null)) return;
    focused.value = false;
    touched.value = true;
    validationActive.value = true;
    nextTick(syncChildState);
  }

  return { touched, focused, validationActive, childInvalid, childFilled, syncChildState, onInput, onFocusin, onFocusout };
}
