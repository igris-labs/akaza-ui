<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";
import { COLOR_FORMATS, ColorArea, ColorPicker, ColorSlider } from "akaza-ui";
import { ref } from "vue";
import { hueAreaUi, sliderUi } from "../color/styles";
const color = ref("#56d799");
const formattedColor = ref("#56d799");
const format = ref<ColorFormat>("hex");
const rtlColor = ref("#56d799");
</script>
<template>
  <div class="grid min-w-0 gap-6 [--ui-radius:0.25rem]">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Hue and saturation</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Choose hue and saturation in the area. Lightness includes black and white; Opacity controls
        transparency.
      </p>
      <output class="text-sm text-muted-foreground">Current: {{ color }}</output>
      <ColorPicker
        v-slot="{ getChannel }"
        v-model="color"
        :ui="{ root: 'grid w-full max-w-64 gap-3' }"
        aria-label="Brand color controls"
      >
        <ColorArea
          color-space="hsl"
          x-channel="hue"
          y-channel="saturation"
          :ui="hueAreaUi"
          aria-label="Brand area"
        />
        <label class="grid gap-1 text-xs text-muted-foreground">
          <span class="flex items-center justify-between">
            Lightness
            <span class="tabular-nums">{{ Math.round(getChannel("hsl", "lightness")) }}%</span>
          </span>
          <ColorSlider
            channel="lightness"
            color-space="hsl"
            :ui="sliderUi"
            aria-label="Lightness"
          />
        </label>
        <label class="grid gap-1 text-xs text-muted-foreground">
          <span class="flex items-center justify-between">
            Opacity
            <span class="tabular-nums">{{ Math.round(getChannel("hsl", "alpha")) }}%</span>
          </span>
          <ColorSlider
            channel="alpha"
            color-space="hsl"
            :ui="sliderUi"
            aria-label="Opacity"
          />
        </label>
      </ColorPicker>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Output format</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Choose the format for the returned value. The area still edits hue and saturation.
      </p>
      <label class="grid w-full max-w-64 gap-1 text-xs text-muted-foreground">
        Output format
        <select
          v-model="format"
          class="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        >
          <option
            v-for="item in COLOR_FORMATS"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </label>
      <ColorPicker
        v-slot="{ getChannel }"
        v-model="formattedColor"
        :format="format"
        :ui="{ root: 'grid w-full max-w-64 gap-3' }"
        aria-label="Formatted color controls"
      >
        <ColorArea
          color-space="hsl"
          x-channel="hue"
          y-channel="saturation"
          :ui="hueAreaUi"
          aria-label="Formatted color area"
        />
        <label class="grid gap-1 text-xs text-muted-foreground">
          <span class="flex items-center justify-between">
            Lightness
            <span class="tabular-nums">{{ Math.round(getChannel("hsl", "lightness")) }}%</span>
          </span>
          <ColorSlider
            channel="lightness"
            color-space="hsl"
            :ui="sliderUi"
            aria-label="Lightness"
          />
        </label>
        <label class="grid gap-1 text-xs text-muted-foreground">
          <span class="flex items-center justify-between">
            Opacity
            <span class="tabular-nums">{{ Math.round(getChannel("hsl", "alpha")) }}%</span>
          </span>
          <ColorSlider
            channel="alpha"
            color-space="hsl"
            :ui="sliderUi"
            aria-label="Opacity"
          />
        </label>
      </ColorPicker>
      <output
        class="block break-all font-mono text-xs"
        aria-live="polite"
      >
        {{ formattedColor }}
      </output>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">RTL and disabled</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        RTL reverses the horizontal axis. Disabled areas remain visible without accepting edits.
      </p>
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="grid gap-2">
          <span class="text-xs text-muted-foreground">Right-to-left</span>
          <ColorPicker
            v-slot="{ getChannel }"
            v-model="rtlColor"
            dir="rtl"
            :ui="{ root: 'grid w-full max-w-64 gap-3' }"
            aria-label="RTL color controls"
          >
            <ColorArea
              color-space="hsl"
              x-channel="hue"
              y-channel="saturation"
              dir="rtl"
              :ui="hueAreaUi"
              aria-label="RTL color area"
            />
            <label class="grid gap-1 text-xs text-muted-foreground">
              <span class="flex items-center justify-between">
                Lightness
                <span class="tabular-nums">{{ Math.round(getChannel("hsl", "lightness")) }}%</span>
              </span>
              <ColorSlider
                channel="lightness"
                color-space="hsl"
                dir="rtl"
                :ui="sliderUi"
                aria-label="Lightness"
              />
            </label>
            <label class="grid gap-1 text-xs text-muted-foreground">
              <span class="flex items-center justify-between">
                Opacity
                <span class="tabular-nums">{{ Math.round(getChannel("hsl", "alpha")) }}%</span>
              </span>
              <ColorSlider
                channel="alpha"
                color-space="hsl"
                dir="rtl"
                :ui="sliderUi"
                aria-label="Opacity"
              />
            </label>
          </ColorPicker>
        </div>
        <div class="grid gap-2">
          <span class="text-xs text-muted-foreground">Disabled</span>
          <ColorPicker
            v-slot="{ getChannel }"
            model-value="#56d799"
            disabled
            :ui="{ root: 'grid w-full max-w-64 gap-3' }"
            aria-label="Disabled color controls"
          >
            <ColorArea
              color-space="hsl"
              x-channel="hue"
              y-channel="saturation"
              disabled
              :ui="hueAreaUi"
              aria-label="Disabled color area"
            />
            <label class="grid gap-1 text-xs text-muted-foreground">
              <span class="flex items-center justify-between">
                Lightness
                <span class="tabular-nums">{{ Math.round(getChannel("hsl", "lightness")) }}%</span>
              </span>
              <ColorSlider
                channel="lightness"
                color-space="hsl"
                disabled
                :ui="sliderUi"
                aria-label="Lightness"
              />
            </label>
            <label class="grid gap-1 text-xs text-muted-foreground">
              <span class="flex items-center justify-between">
                Opacity
                <span class="tabular-nums">{{ Math.round(getChannel("hsl", "alpha")) }}%</span>
              </span>
              <ColorSlider
                channel="alpha"
                color-space="hsl"
                disabled
                :ui="sliderUi"
                aria-label="Opacity"
              />
            </label>
          </ColorPicker>
        </div>
      </div>
    </section>
  </div>
</template>
