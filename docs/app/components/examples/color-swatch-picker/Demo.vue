<script setup lang="ts">
import { ColorSwatch, ColorSwatchPicker } from "akaza-ui";
import { ref } from "vue";
import { palette, paletteUi, swatchUi } from "../color/styles";
const color = ref("#2a9d6f");
const colors = ref<string[]>([]);
const customItems = [
  { value: "#22c55e", label: "Production" },
  { value: "#f59e0b", label: "Staging" },
  { value: "#ef4444", label: "Incident" },
];
</script>
<template>
  <div class="grid min-w-0 gap-6">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Single selection</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Select a color. Screen readers can read each color's label.
      </p>
      <ColorSwatchPicker
        v-model="color"
        :items="palette.filter((item) => !item.disabled)"
        :ui="paletteUi"
        aria-label="Brand palette"
      >
        <template #indicator="{ isSelected }">
          <Icon
            v-if="isSelected"
            name="lucide:check"
            class="size-4 drop-shadow-sm"
            aria-hidden="true"
          />
        </template>
      </ColorSwatchPicker>
      <output class="block break-all font-mono text-xs">{{ color }}</output>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Multiple selection and RTL</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Toggle several colors, use Shift with navigation to extend selection, and skip disabled
        options.
      </p>
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
          <Icon
            v-if="isSelected"
            name="lucide:check"
            class="size-4 drop-shadow-sm"
            aria-hidden="true"
          />
        </template>
      </ColorSwatchPicker>
      <output class="block whitespace-pre-wrap break-all font-mono text-xs">{{
        JSON.stringify(colors, null, 2)
      }}</output>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Custom item slot</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Replace the option content. The wrapper still handles selection and focus.
      </p>
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
    </section>
  </div>
</template>
