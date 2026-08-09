<script setup lang="ts">
import type { CalendarDateRange, CalendarDateValue } from "akaza-ui";
import { CalendarDate } from "@internationalized/date";
import { ref, shallowRef } from "vue";
import { Calendar, Popover } from "akaza-ui";
import {
  buttonPrimary,
  calendarUi,
  canvas,
  canvasCol,
  codePill,
  exampleStack,
  exampleTitle,
  sectionDescription,
  sectionTitle,
} from "../styles";

const selected = shallowRef<CalendarDateValue>(new CalendarDate(2026, 8, 12));
const popoverDate = shallowRef<CalendarDateValue>();
const popoverOpen = ref(false);
const constrained = shallowRef<CalendarDateValue>();
const multiple = shallowRef<CalendarDateValue[]>([
  new CalendarDate(2026, 8, 4),
  new CalendarDate(2026, 8, 18),
]);
const range = shallowRef<CalendarDateRange>({
  start: new CalendarDate(2026, 8, 10),
  end: new CalendarDate(2026, 8, 12),
});

function isWeekend(date: CalendarDateValue) {
  return ["2026-08-08", "2026-08-09", "2026-08-15", "2026-08-16"].includes(date.toString());
}
</script>

<template>
  <section id="calendar">
    <h2 :class="sectionTitle">Calendar</h2>
    <p :class="sectionDescription">
      Locale-aware date grid with roving focus, constraints, single, multiple, and range selection.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single date</h3>
        <div :class="canvasCol">
          <Calendar
            v-model="selected"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :ui="calendarUi"
          />
          <code :class="codePill">selected: {{ selected?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Popover calendar</h3>
        <div :class="canvasCol">
          <Popover v-model="popoverOpen" teleport="body" :ui="{ content: 'w-min max-w-[calc(100dvw-0.5rem)] overflow-auto rounded-lg bg-popover text-popover-foreground shadow-lg' }">
            <template #trigger="{ toggle, triggerProps }">
              <button :class="buttonPrimary" v-bind="triggerProps" @click="toggle">
                {{ popoverDate?.toString() ?? "Choose date" }}
              </button>
            </template>
            <template #content>
              <Calendar
                v-model="popoverDate"
                prevent-deselect
                :placeholder="new CalendarDate(2026, 8, 1)"
                :ui="calendarUi"
                @value-change="popoverOpen = false"
              />
            </template>
          </Popover>
          <code :class="codePill">selected: {{ popoverDate?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Constraints + unavailable dates</h3>
        <div :class="canvasCol">
          <Calendar
            v-model="constrained"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :min-value="new CalendarDate(2026, 8, 5)"
            :max-value="new CalendarDate(2026, 8, 24)"
            :is-date-unavailable="isWeekend"
            disable-days-outside-current-view
            :ui="calendarUi"
          />
          <code :class="codePill">selected: {{ constrained?.toString() ?? "none" }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Date range</h3>
        <div :class="canvasCol">
          <Calendar
            v-model="range"
            selection-mode="range"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :is-date-unavailable="isWeekend"
            :ui="calendarUi"
          />
          <code :class="codePill">
            range: {{ range.start?.toString() ?? "none" }} - {{ range.end?.toString() ?? "select end" }}
          </code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple + two-month paging</h3>
        <div :class="canvas">
          <Calendar
            v-model="multiple"
            selection-mode="multiple"
            fixed-weeks
            paged-navigation
            :number-of-months="2"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :ui="calendarUi"
          >
            <template #day="{ label, today }">
              <span :class="today ? 'font-bold' : undefined">{{ label }}</span>
            </template>
            <template #footer>
              {{ multiple.length }} dates selected. Next and previous move two months.
            </template>
          </Calendar>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Locale + week start</h3>
        <div :class="canvas">
          <Calendar
            locale="fr-FR"
            week-starts-on="mon"
            weekday-format="short"
            :placeholder="new CalendarDate(2026, 8, 1)"
            :ui="calendarUi"
          />
        </div>
      </div>
    </div>
  </section>
</template>
