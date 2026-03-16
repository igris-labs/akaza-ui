<script setup lang="ts">
import { ref } from "vue";
import { RadioGroup } from "akaza-ui";

const selected = ref("md");
const options = ["xs", "sm", "md", "lg", "xl"];
</script>

<template>
  <section id="radio-group">
    <h2 class="text-lg font-semibold mb-1">Radio Group</h2>
    <p class="text-sm mb-6 text-muted-foreground">Single selection from a group of options.</p>
    <div class="rounded-lg border p-6 space-y-4 bg-accent">
      <RadioGroup v-model="selected" :options="options" orientation="horizontal" class="flex gap-2">
        <template #item="{ value, isChecked }">
          <span
            class="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
            :class="isChecked
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted'"
          >
            {{ value }}
          </span>
        </template>
      </RadioGroup>
      <p class="text-sm text-muted-foreground">
        Selected: <span class="text-foreground font-medium">{{ selected }}</span>
      </p>
    </div>
  </section>
</template>
