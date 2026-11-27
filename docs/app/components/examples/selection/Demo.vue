<script setup lang="ts">
import { useSelection } from "akaza-ui";

const days = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday", disabled: true },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
];
const { selectedKeys, isSelected, toggle, selectRange, clear } = useSelection({
  items: days,
  multiple: true,
});
</script>

<template>
  <div class="grid gap-3">
    <fieldset class="min-w-0">
      <legend class="mb-1 text-sm font-semibold text-foreground">
        Pickup days
      </legend>
      <div class="flex flex-wrap gap-x-4">
        <label
          v-for="day in days"
          :key="day.key"
          class="inline-flex min-h-11 items-center gap-2 text-sm text-foreground has-disabled:text-muted-foreground"
        >
          <input
            type="checkbox"
            class="size-4 accent-primary"
            :checked="isSelected(day.key)"
            :disabled="day.disabled"
            @change="toggle(day.key, $event)"
          >
          {{ day.label }}{{ day.disabled ? " (unavailable)" : "" }}
        </label>
      </div>
    </fieldset>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="min-h-10 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="selectRange('mon', 'thu', $event)"
      >
        Select Monday to Thursday
      </button>
      <button
        type="button"
        class="min-h-10 rounded-md px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="clear($event)"
      >
        Clear
      </button>
    </div>
    <output class="text-sm text-muted-foreground">{{ selectedKeys.length }} selected</output>
  </div>
</template>
