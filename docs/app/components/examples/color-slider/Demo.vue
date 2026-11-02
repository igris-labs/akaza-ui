<script setup lang="ts">
import { ColorSlider, ColorSwatch } from "akaza-ui";
import { ref } from "vue";
import { sliderUi, swatchUi } from "../color/styles";
const color = ref("#56d799");
</script>
<template>
  <div class="grid min-w-0 gap-6">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Hue and opacity</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Change hue and opacity with separate sliders. Both update the same color value.
      </p>
      <ColorSlider
        v-model="color"
        channel="hue"
        :ui="sliderUi"
        aria-label="Hue"
      />
      <div class="flex items-center gap-3">
        <ColorSwatch
          :color="color"
          :ui="swatchUi"
        />
        <output class="break-all font-mono text-xs text-muted-foreground">{{ color }}</output>
      </div>
      <label class="grid max-w-sm gap-2 text-xs">
        Opacity
        <ColorSlider
          v-model="color"
          format="oklch"
          channel="alpha"
          :ui="sliderUi"
        />
      </label>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Vertical and RTL</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Vertical tracks increase upward. RTL reverses horizontal pointer and arrow direction.
      </p>
      <div class="flex items-start gap-6">
        <ColorSlider
          v-model="color"
          orientation="vertical"
          aria-label="Vertical hue"
          :ui="{ ...sliderUi, root: 'h-40 w-6', track: 'h-full w-3 rounded-md' }"
        />
        <ColorSlider
          v-model="color"
          dir="rtl"
          aria-label="RTL hue"
          :ui="sliderUi"
        />
      </div>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">OKLCH and read-only</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Use a smaller step for OKLCH chroma. Read-only sliders accept focus but prevent changes.
      </p>
      <ColorSlider
        v-model="color"
        channel="chroma"
        color-space="oklch"
        format="oklch"
        :step="0.001"
        :ui="sliderUi"
        aria-label="OKLCH chroma"
      />
      <ColorSlider
        :model-value="color"
        read-only
        :ui="sliderUi"
        aria-label="Read-only hue"
      />
    </section>
  </div>
</template>
