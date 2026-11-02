<script setup lang="ts">
import type { AkazaChangeEventDetails, CalendarModelValue } from "akaza-ui";
import type { DateRangeFieldProps, DateRangeFieldSlots } from "./index";
import { Popover, DateRangeField as Primitive } from "akaza-ui";

import { computed, ref, shallowRef, useAttrs, useTemplateRef, watch } from "vue";
import { cn, mergeRecipeSlots } from "../../../utils/ui";
import { Calendar, calendarVariants } from "../calendar";
import { dateFieldVariants, resolveDateFieldVariants } from "../date-field";
import uiConfig from "../ui.config";
import { dateRangeFieldVariants, resolveDateRangeFieldVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<DateRangeFieldProps>(), {
  showCalendar: true,
  calendarLabel: "Choose date range",
  calendarOpen: undefined,
  id: undefined,
  name: undefined,
  startName: undefined,
  endName: undefined,
  locale: undefined,
  dir: undefined,
  placeholder: undefined,
  minValue: undefined,
  maxValue: undefined,
  isDateUnavailable: undefined,
  allowNonContiguousRanges: undefined,
  maximumDays: undefined,
  fixedDate: undefined,
  required: undefined,
  disabled: undefined,
  readOnly: undefined,
  invalid: undefined,
  selectOnFocus: undefined,
  autoAdvance: undefined,
  startLabel: undefined,
  endLabel: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
  modelValue: undefined,
});
const emit = defineEmits<{
  "update:calendarOpen": [open: boolean];
  "update:modelValue": [value: import("akaza-ui").CalendarDateRange];
}>();
defineSlots<DateRangeFieldSlots>();
const attrs = useAttrs();
const localValue = shallowRef<import("akaza-ui").CalendarDateRange>({});
const value = computed({
  get: () => props.modelValue ?? localValue.value,
  set: (value) => {
    localValue.value = value;
    emit("update:modelValue", value);
  },
});
const localCalendarOpen = ref(false);
const calendarOpen = computed({
  get: () => props.calendarOpen ?? localCalendarOpen.value,
  set: (open) => {
    localCalendarOpen.value = open;
    emit("update:calendarOpen", open);
  },
});
watch(
  () => [props.showCalendar, props.disabled, props.readOnly],
  () => {
    if (!props.showCalendar || props.disabled || props.readOnly) calendarOpen.value = false;
  },
);
function openCalendar(event: MouseEvent) {
  if (
    props.showCalendar &&
    !props.disabled &&
    !props.readOnly &&
    (event.target as HTMLElement).closest(".akaza-date-field-segments")
  )
    calendarOpen.value = true;
}
const primitive = useTemplateRef<InstanceType<typeof Primitive>>("primitive");
function selectRange(value: CalendarModelValue, details: AkazaChangeEventDetails) {
  details.cancel();
  if (!value || Array.isArray(value) || !("start" in value || "end" in value)) return;
  const range = value as import("akaza-ui").CalendarDateRange;
  if (primitive.value?.setValue(range, "calendar", details.event) && range.start && range.end)
    calendarOpen.value = false;
}
const resolved = computed(() => resolveDateRangeFieldVariants(props, uiConfig));
const styles = computed(() => dateRangeFieldVariants(resolved.value));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  const flat = Object.fromEntries(
    Object.entries(styles.value)
      .filter(([part]) => !["startField", "endField", "calendar", "calendarTrigger"].includes(part))
      .map(([part, style]) => [
        part,
        cn(style(), overrides?.[part], part === "root" ? props.class : undefined),
      ]),
  );
  return {
    ...flat,
    popover: flat.popover,
    fields: flat.fields,
    calendarContent: flat.calendarContent,
    calendarTrigger: cn(
      dateFieldVariants(resolveDateFieldVariants(resolved.value, uiConfig)).calendarTrigger(),
      props.ui?.calendarTrigger,
    ),
    calendar: mergeRecipeSlots(
      calendarVariants({ size: resolved.value.size, rangeColor: resolved.value.rangeColor }),
      {
        ...props.ui?.calendar,
        root: cn(styles.value.calendar(), props.ui?.calendar?.root),
      },
    ),
    startField: {
      ...mergeRecipeSlots(
        dateFieldVariants(resolveDateFieldVariants(resolved.value, uiConfig)),
        props.ui?.startField,
      ),
      calendar: mergeRecipeSlots(
        calendarVariants({ size: resolved.value.size, rangeColor: resolved.value.rangeColor }),
        props.ui?.startField?.calendar,
      ),
    },
    endField: {
      ...mergeRecipeSlots(
        dateFieldVariants(resolveDateFieldVariants(resolved.value, uiConfig)),
        props.ui?.endField,
      ),
      calendar: mergeRecipeSlots(
        calendarVariants({ size: resolved.value.size, rangeColor: resolved.value.rangeColor }),
        props.ui?.endField?.calendar,
      ),
    },
  };
});
const primitiveProps = computed(() => {
  const {
    class: _class,
    ui: _ui,
    size: _size,
    rangeColor: _rangeColor,
    variant: _variant,
    showCalendar: _showCalendar,
    calendarOpen: _calendarOpen,
    calendarLabel: _calendarLabel,
    ...native
  } = props;
  return native;
});
defineExpose({
  get clear() {
    return primitive.value!.clear;
  },
  get focusEnd() {
    return primitive.value!.focusEnd;
  },
  get focusStart() {
    return primitive.value!.focusStart;
  },
  get setValue() {
    return primitive.value!.setValue;
  },
});
</script>
<template>
  <Popover
    v-model="calendarOpen"
    teleport="body"
    align="start"
    :ui="{
      root: mergedUi.popover,
      content: mergedUi.calendarContent,
    }"
  >
    <template #trigger="scope">
      <div :class="mergedUi.fields">
        <component
          :is="Primitive"
          ref="primitive"
          v-bind="{ ...primitiveProps, ...attrs }"
          v-model="value"
          :ui="mergedUi"
          @click="openCalendar"
        >
          <template
            v-for="(_, name) in $slots"
            #[name]="slotScope"
          >
            <slot
              :name="name as keyof DateRangeFieldSlots"
              v-bind="slotScope ?? {}"
            />
          </template>
        </component>
        <button
          v-if="showCalendar"
          type="button"
          :class="mergedUi.calendarTrigger"
          :disabled="disabled || readOnly"
          v-bind="scope.triggerProps"
          :aria-label="calendarLabel"
          :aria-expanded="calendarOpen"
          @click="scope.toggle($event)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path
              d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            />
          </svg>
        </button>
      </div>
    </template>
    <template #content>
      <div
        role="dialog"
        :aria-label="calendarLabel"
      >
        <Calendar
          :model-value="value"
          selection-mode="range"
          :range-color="resolved.rangeColor"
          :locale="locale"
          :dir="dir"
          :min-value="minValue"
          :max-value="maxValue"
          :is-date-unavailable="isDateUnavailable"
          :allow-non-contiguous-ranges="allowNonContiguousRanges"
          :maximum-days="maximumDays"
          :fixed-date="fixedDate"
          :placeholder="placeholder"
          :size="resolved.size"
          :initial-focus="false"
          :disabled="disabled"
          :read-only="readOnly"
          :ui="mergedUi.calendar"
          :calendar-label="calendarLabel"
          @value-change="selectRange"
        />
      </div>
    </template>
  </Popover>
</template>
