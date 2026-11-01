<script setup lang="ts">
import { ColorSwatchPicker, ColorSwatch } from "akaza-ui";
import { ref } from "vue";
import { palette, paletteUi, swatchUi } from "../color/styles";
import { canvasCol, exampleStack, exampleTitle, sectionDescription, sectionTitle } from "../styles";
const color = ref("#2a9d6f");
const colors = ref<string[]>([]);
const customItems = [
  { value: "#22c55e", label: "Production" },
  { value: "#f59e0b", label: "Staging" },
  { value: "#ef4444", label: "Incident" },
];
</script>
<template>
  <section id="color-swatch-picker">
    <h2 :class="sectionTitle">Color Swatch Picker</h2>
    <p :class="sectionDescription">
      Choose one or more colors from a list.
    </p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Single selection</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Select a color. Screen readers can read each color's label.
        </p>
        <div :class="canvasCol">
          <ColorSwatchPicker
            v-model="color"
            :items="palette.filter((item) => !item.disabled)"
            :ui="paletteUi"
            aria-label="Brand palette"
          >
            <template #indicator="{ isSelected }">
              <svg
                v-if="isSelected"
                class="size-4 drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m20 6-11 12-5-5" />
              </svg>
            </template>
          </ColorSwatchPicker>
          <output class="block break-all font-mono text-xs">{{ color }}</output>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Multiple selection and RTL</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Toggle several colors, use Shift with navigation to extend selection, and skip disabled
          options.
        </p>
        <div :class="canvasCol">
          <ColorSwatchPicker
            v-model="colors"
            :items="palette"
            multiple
            dir="rtl"
            format="lch"
            :ui="paletteUi"
            aria-label="Multiple colors"
          >
            <template #indicator="{ isSelected }">
              <svg
                v-if="isSelected"
                class="size-4 drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m20 6-11 12-5-5" />
              </svg>
            </template>
          </ColorSwatchPicker>
          <output class="block whitespace-pre-wrap break-all font-mono text-xs">{{
            JSON.stringify(colors, null, 2)
          }}</output>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Custom item slot</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Replace the option content. The wrapper still handles selection and focus.
        </p>
        <div :class="canvasCol">
          <ColorSwatchPicker
            v-model="color"
            :items="customItems"
            :ui="{
              ...paletteUi,
              content: 'grid gap-2',
              item: 'flex items-center gap-3 rounded-md border border-border p-2 data-[akaza-state=checked]:bg-accent',
            }"
            aria-label="Environment colors"
          >
            <template #item="{ color: itemColor, label, isSelected }">
              <ColorSwatch
                :color="itemColor"
                decorative
                :ui="swatchUi"
              />
              <span class="text-sm">{{ label }}</span>
              <span
                v-if="isSelected"
                class="ml-auto text-xs text-muted-foreground"
              >
                Selected
              </span>
            </template>
          </ColorSwatchPicker>
        </div>
      </div>
    </div>
  </section>
</template>
