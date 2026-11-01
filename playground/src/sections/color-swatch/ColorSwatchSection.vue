<script setup lang="ts">
import { ColorSwatch } from "akaza-ui";
import { swatchUi } from "../color/styles";
const colors = [
  "#ef4444",
  "rgb(34 197 94 / 0.5)",
  "oklch(0.7 0.2 250)",
  "color(display-p3 1 0.2 0.4)",
  "transparent",
];
import { canvasCol, exampleStack, exampleTitle, sectionDescription, sectionTitle } from "../styles";
</script>
<template>
  <section id="color-swatch">
    <h2 :class="sectionTitle">Color Swatch</h2>
    <p :class="sectionDescription">
      A read-only color preview.
    </p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Formats and transparency</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Show colors in different CSS formats. Transparent is a valid color, not an empty selection.
        </p>
        <div :class="canvasCol">
          <div class="grid gap-3">
            <div
              v-for="color in colors"
              :key="color"
              class="flex min-w-0 items-center gap-3"
            >
              <ColorSwatch
                :color="color"
                :ui="swatchUi"
              />
              <code class="min-w-0 break-all text-xs text-muted-foreground">{{ color }}</code>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Decorative and custom content</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Use decorative when nearby text names the color. Add an indicator through the default slot.
        </p>
        <div :class="canvasCol">
          <span class="inline-flex items-center gap-2 text-sm">
            <ColorSwatch
              color="#22c55e"
              decorative
              :ui="swatchUi"
            />
            Available
          </span>
          <ColorSwatch
            color="#171717"
            aria-label="Black, selected"
            :ui="{
              root: 'flex size-10 items-center justify-center rounded-md border border-border text-white',
            }"
          >
            <span aria-hidden="true">✓</span>
          </ColorSwatch>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Empty state</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          An empty or invalid color shows an empty swatch. CSS variables are not supported.
        </p>
        <div :class="canvasCol">
          <ColorSwatch
            color=""
            aria-label="No brand color selected"
            :ui="{ root: 'block size-9 rounded-md border border-dashed border-input' }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
