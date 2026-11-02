<script setup lang="ts">
import type { EditableProps, EditableSlots } from "./index";
import { Editable as Primitive } from "akaza-ui";

import { computed, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import { buttonVariants } from "../button";
import uiConfig from "../ui.config";
import { editableVariants, resolveEditableVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<EditableProps>(), {
  id: undefined,
  name: undefined,
  placeholder: undefined,
  activationMode: undefined,
  submitMode: undefined,
  startWithEditMode: undefined,
  selectOnFocus: undefined,
  autoResize: undefined,
  multiline: undefined,
  rows: undefined,
  maxLength: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  dir: undefined,
  ariaLabel: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<EditableSlots>();
const attrs = useAttrs();
const styles = computed(() => editableVariants(resolveEditableVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(
        style(),
        ["edit", "submit", "cancel"].includes(part)
          ? buttonVariants({
              size: resolveEditableVariants(props, uiConfig).size,
              color: "primary",
              variant: part === "submit" ? "solid" : "ghost",
            }).root()
          : undefined,
        part === "input" && props.multiline ? "h-auto min-h-20 py-2" : undefined,
        overrides?.[part],
        part === "root" ? props.class : undefined,
      ),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, variant: _variant, ...native } = props;
  return native;
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get cancel() {
    return primitive.value!.cancel;
  },
  get edit() {
    return primitive.value!.edit;
  },
  get focus() {
    return primitive.value!.focus;
  },
  get submit() {
    return primitive.value!.submit;
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
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof EditableSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
