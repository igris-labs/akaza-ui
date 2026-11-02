<script setup lang="ts">
import type { RatingProps, RatingSlots } from "./index";
import { Rating as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { ratingVariants, resolveRatingVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<RatingProps>(), {
  length: undefined,
  step: undefined,
  clearable: undefined,
  hoverable: undefined,
  loop: undefined,
  orientation: undefined,
  dir: undefined,
  autoFocus: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  getValueLabel: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<RatingSlots>();
const attrs = useAttrs();
const styles = computed(() => ratingVariants(resolveRatingVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get clear() {
    return primitive.value!.clear;
  },
  get focus() {
    return primitive.value!.focus;
  },
});
</script>
<template>
  <component
    :is="Primitive"
    ref="primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-if="!$slots.empty"
      #empty
    >
      <svg
        class="block size-(--rating-icon-size)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    </template>
    <template
      v-if="!$slots.filled"
      #filled
    >
      <svg
        class="block size-(--rating-icon-size)"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof RatingSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
