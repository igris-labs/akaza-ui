<script setup lang="ts">
import type { TagsInputProps, TagsInputSlots } from "./index";
import { TagsInput as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveTagsInputVariants, tagsInputVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<TagsInputProps>(), {
  displayValue: undefined,
  convertValue: undefined,
  serializeValue: undefined,
  isEqual: undefined,
  validate: undefined,
  delimiter: undefined,
  addOnBlur: undefined,
  addOnPaste: undefined,
  addOnTab: undefined,
  duplicate: undefined,
  max: undefined,
  trim: undefined,
  clearable: undefined,
  placeholder: undefined,
  maxLength: undefined,
  autoFocus: undefined,
  id: undefined,
  name: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  dir: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
  input: undefined,
});
defineSlots<TagsInputSlots>();
const attrs = useAttrs();
const styles = computed(() => tagsInputVariants(resolveTagsInputVariants(props, uiConfig)));
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
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get add() {
    return primitive.value!.add;
  },
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
      v-if="!$slots.delete"
      #delete
    >
      <svg
        class="size-(--tag-icon-size)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 6 12 12M6 18 18 6" />
      </svg>
    </template>
    <template
      v-if="!$slots.clear"
      #clear
    >
      <svg
        class="size-(--tag-icon-size)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 6 12 12M6 18 18 6" />
      </svg>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof TagsInputSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
