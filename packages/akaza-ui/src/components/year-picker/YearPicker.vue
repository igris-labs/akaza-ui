<script setup lang="ts">
import type { YearPickerModelValue, YearPickerProps } from ".";
import type { AkazaChangeEventDetails } from "../../types";
import type { CalendarDateValue, CalendarModelValue } from "../calendar";
import { computed, useTemplateRef } from "vue";
import PeriodPicker from "../date-period/PeriodPicker.vue";

const props = withDefaults(defineProps<YearPickerProps>(), {
  calendarLabel: "Year picker",
  yearsPerPage: 12,
});
const emit = defineEmits<{
  "value-change": [value: YearPickerModelValue, details: AkazaChangeEventDetails];
  "placeholder-change": [value: CalendarDateValue, details: AkazaChangeEventDetails];
}>();
const model = defineModel<YearPickerModelValue>();
const placeholder = defineModel<CalendarDateValue>("placeholder");
const pickerRef = useTemplateRef<InstanceType<typeof PeriodPicker>>("pickerRef");
const periodProps = computed(() => {
  const { calendarLabel, yearsPerPage, isYearDisabled, isYearUnavailable, ...rest } = props;
  return {
    ...rest,
    pickerLabel: calendarLabel,
    itemsPerPage: yearsPerPage,
    isPeriodDisabled: isYearDisabled,
    isPeriodUnavailable: isYearUnavailable,
  };
});

function onValueChange(value: CalendarModelValue, details: AkazaChangeEventDetails) {
  emit("value-change", value as YearPickerModelValue, details);
}

defineExpose({
  focusValue: (...args: Parameters<InstanceType<typeof PeriodPicker>["focusValue"]>) => pickerRef.value?.focusValue(...args),
  nextPage: (event?: Event) => pickerRef.value?.nextPage(event),
  previousPage: (event?: Event) => pickerRef.value?.previousPage(event),
  selectValue: (...args: Parameters<InstanceType<typeof PeriodPicker>["selectValue"]>) => pickerRef.value?.selectValue(...args),
});
</script>

<template>
  <PeriodPicker
    ref="pickerRef"
    v-model="model"
    v-model:placeholder="placeholder"
    v-bind="periodProps"
    kind="year"
    prefix="year-picker"
    :selection-mode="props.multiple ? 'multiple' : 'single'"
    @value-change="onValueChange"
    @placeholder-change="(value, details) => emit('placeholder-change', value, details)"
  >
    <template #previous="slotProps"><slot name="previous" v-bind="slotProps">‹</slot></template>
    <template #heading="slotProps"><slot name="heading" v-bind="slotProps">{{ slotProps.label }}</slot></template>
    <template #next="slotProps"><slot name="next" v-bind="slotProps">›</slot></template>
    <template #cell="slotProps"><slot name="year" v-bind="slotProps">{{ slotProps.label }}</slot></template>
    <template v-if="$slots.footer" #footer="slotProps"><slot name="footer" v-bind="slotProps" /></template>
  </PeriodPicker>
</template>
