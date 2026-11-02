<script setup lang="ts" generic="T extends string | boolean">
import type { SelectModelValue } from "akaza-ui";
import { computed } from "vue";
import { Field } from "../../ui/field";
import { Select } from "../../ui/select";
const props = defineProps<{
  label: string;
  options: { label: string; value: T }[];
  hint?: string;
}>();
const model = defineModel<T>({ required: true });
const options = computed(() =>
  props.options.map((option) => ({ ...option, value: String(option.value) })),
);
function update(value: SelectModelValue) {
  const option = props.options.find((option) => String(option.value) === value);
  if (option) model.value = option.value;
}
</script>
<template>
  <Field
    :label="label"
    :description="hint"
  >
    <Select
      :model-value="String(model)"
      :options="options"
      class="w-full"
      @update:model-value="update"
    />
  </Field>
</template>
