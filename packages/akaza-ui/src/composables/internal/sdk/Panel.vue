<script setup lang="ts">
import { bindPanel } from "@ui-sdk/core";
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue";

const props = defineProps<{
  open: boolean;
  unmountOnHide: boolean;
  prefix: "akaza-accordion" | "akaza-collapsible";
  trigger: (element: HTMLElement) => HTMLElement | undefined;
  ui?: { contentInner?: string; content?: string } | undefined;
}>();

const panel = useTemplateRef<HTMLElement>("panel");
const present = shallowRef(props.open);
const hidden = shallowRef(!props.open);
const closed = shallowRef(!props.open);
let exiting = false;
let opening: "mount" | "animate" = "mount";
let dispose: (() => void) | undefined;

watch(() => props.open, (open) => {
  exiting = !open && present.value;
  if (open) {
    present.value = true;
    hidden.value = false;
  }
}, { flush: "sync" });

onMounted(() => {
  dispose = bindPanel(panel.value!, {
    size: (element, height, width) => {
      element.style.setProperty(`--${props.prefix}-content-height`, height);
      element.style.setProperty(`--${props.prefix}-content-width`, width);
      // SDK moves focus out before this makes a closing panel inert.
      closed.value = !props.open;
    },
    isOpen: () => props.open,
    isExiting: () => exiting,
    isFindable: () => false,
    opening: () => opening,
    reveal: () => {},
    trigger: () => props.trigger(panel.value!),
    subscribe: listener => watch(() => props.open, () => listener(), { flush: "post" }),
    settled: (open) => {
      if (!open && !props.open) hidden.value = true;
    },
    exited: () => {
      if (props.open) return;
      exiting = false;
      present.value = false;
    },
  });
  opening = "animate";
});

onBeforeUnmount(() => dispose?.());
</script>

<template>
  <div
    ref="panel"
    :hidden="hidden"
    :aria-hidden="closed || undefined"
    :inert="closed || undefined"
    :data-akaza-state="open ? 'open' : 'closed'"
    :class="`${prefix}-content`"
  >
    <div :class="[`${prefix}-content-inner`, ui?.contentInner]">
      <div :class="[`${prefix}-content-body`, ui?.content]">
        <slot v-if="!unmountOnHide || present" />
      </div>
    </div>
  </div>
</template>
