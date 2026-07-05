<script setup lang="ts">
import type { ToggleGroupModel } from "akaza-ui";
import { ref } from "vue";
import { ToggleGroup } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  sectionDescription,
  sectionTitle,
  toggleGroupCardUi,
  toggleGroupUi,
} from "../styles";

const align = ref<ToggleGroupModel>("left");
const formats = ref<ToggleGroupModel>(["bold"]);
const density = ref<ToggleGroupModel>("comfortable");

const alignOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const formatOptions = [
  { value: "bold", label: "Bold" },
  { value: "italic", label: "Italic" },
  { value: "underline", label: "Underline" },
];

const densityOptions = [
  { value: "compact", label: "Compact", description: "Dense rows for power users." },
  { value: "comfortable", label: "Comfortable", description: "Balanced spacing for forms." },
  { value: "spacious", label: "Spacious", description: "Large touch targets.", disabled: true },
];
</script>

<template>
  <section id="toggle-group">
    <h2 :class="sectionTitle">Toggle Group</h2>
    <p :class="sectionDescription">
      Single or multiple selection with roving focus and pressed state attrs.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single selection</h3>
        <div :class="canvasCol">
          <ToggleGroup
            v-model="align"
            :options="alignOptions"
            :allow-empty="false"
            aria-label="Text alignment"
            :ui="toggleGroupUi"
          />
          <code :class="codePill">align: {{ align }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Multiple selection</h3>
        <div :class="canvasCol">
          <ToggleGroup
            v-model="formats"
            type="multiple"
            name="format"
            :options="formatOptions"
            aria-label="Text formatting"
            :ui="toggleGroupUi"
          />
          <code :class="codePill">formats: {{ formats }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Custom item slot</h3>
        <div :class="canvasCol">
          <ToggleGroup v-model="density" :options="densityOptions" :ui="toggleGroupCardUi">
            <template #item="{ label, description, isPressed }">
              <span>
                <span class="block text-sm font-medium text-foreground">{{ label }}</span>
                <span class="block text-xs text-muted-foreground">{{ description }}</span>
              </span>
              <span
                class="mt-1 size-2 rounded-full"
                :class="isPressed ? 'bg-primary' : 'bg-muted-foreground/30'"
              />
            </template>
          </ToggleGroup>
          <code :class="codePill">density: {{ density }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Vertical + disabled group</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <ToggleGroup
            model-value="center"
            orientation="vertical"
            :options="alignOptions"
            :ui="toggleGroupUi"
            aria-label="Vertical alignment"
          />
          <ToggleGroup
            model-value="left"
            disabled
            :options="alignOptions"
            :ui="toggleGroupUi"
            aria-label="Disabled alignment"
          />
        </div>
      </div>
    </div>
  </section>
</template>
