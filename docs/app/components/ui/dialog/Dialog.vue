<script setup lang="ts">
import type { DialogProps, DialogSlots } from "./index";
import { Dialog as Primitive } from "akaza-ui";

import { computed, onMounted, ref, useAttrs, useTemplateRef } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { dialogVariants, resolveDialogVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<DialogProps>(), {
  as: undefined,
  title: undefined,
  description: undefined,
  ariaLabel: undefined,
  closeOnBackdropClick: undefined,
  fullscreen: undefined,
  teleport: undefined,
  transition: undefined,
  duration: undefined,
  ui: undefined,
  modelValue: undefined,
});
defineSlots<DialogSlots>();
const attrs = useAttrs();
// Programmatic overlays mount open; let Akaza mount closed so its entrance transition runs.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const styles = computed(() => dialogVariants(resolveDialogVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "content" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, width: _width, ...native } = props;
  return { ...native, modelValue: props.modelValue === true ? mounted.value : props.modelValue };
});
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
defineExpose({
  get open() {
    return primitive.value!.open;
  },
  get close() {
    return primitive.value!.close;
  },
  get toggle() {
    return primitive.value!.toggle;
  },
  get titleId() {
    return primitive.value!.titleId;
  },
  get descriptionId() {
    return primitive.value!.descriptionId;
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
        :name="name as keyof DialogSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
