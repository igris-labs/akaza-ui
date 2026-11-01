<script setup lang="ts">
import { ColorSlider, ColorSwatch } from "akaza-ui";
import { ref } from "vue";
import { sliderUi, swatchUi } from "../color/styles";
import { canvasCol, exampleStack, exampleTitle, sectionDescription, sectionTitle } from "../styles";
const color = ref("#56d799");
</script>
<template>
  <section id="color-slider">
    <h2 :class="sectionTitle">Color Slider</h2>
    <p :class="sectionDescription">
      A slider for hue, opacity, or another color channel.
    </p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Hue and opacity</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Change hue and opacity with separate sliders. Both update the same color value.
        </p>
        <div :class="canvasCol">
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
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Vertical and RTL</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Vertical tracks increase upward. RTL reverses horizontal pointer and arrow direction.
        </p>
        <div :class="canvasCol">
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
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">OKLCH and read-only</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Use a smaller step for OKLCH chroma. Read-only sliders accept focus but prevent changes.
        </p>
        <div :class="canvasCol">
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
        </div>
      </div>
    </div>
  </section>
</template>
