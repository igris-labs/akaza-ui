<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";
import { ColorPicker, ColorSwatch, Popover, COLOR_FORMATS } from "akaza-ui";
import { ref } from "vue";
import { palette, pickerUi, swatchUi } from "../color/styles";
import { canvasCol, exampleStack, exampleTitle, sectionDescription, sectionTitle } from "../styles";
const color = ref("oklch(0.65 0.2 250 / 0.8)");
const format = ref<ColorFormat>("oklch");
const committed = ref("");
const open = ref(false);
</script>
<template>
  <section id="color-picker">
    <h2 :class="sectionTitle">Color Picker</h2>
    <p :class="sectionDescription">
      A color editor with an area, sliders, and text input.
    </p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Output format</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Choose the format for the returned color. Hue stays editable for gray and black.
        </p>
        <div :class="canvasCol">
          <label class="grid max-w-sm gap-1 text-xs text-muted-foreground">
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
            v-model="color"
            :format="format"
            :items="palette"
            :ui="pickerUi"
            aria-label="Brand color"
            @value-commit="committed = $event"
          />
          <output class="block break-all font-mono text-xs text-muted-foreground">
            {{ color }}
          </output>
          <p class="break-all text-xs text-muted-foreground">
            Committed: {{ committed || "No interaction yet" }}
          </p>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Popover composition</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Use Popover to show the picker in a popup.
        </p>
        <div :class="canvasCol">
          <Popover
            v-model="open"
            teleport="body"
            :ui="{
              content:
                'max-h-[calc(100dvh-1rem)] w-[min(90vw,22rem)] overflow-y-auto rounded-md border border-border bg-popover p-4 shadow-lg',
            }"
          >
            <template #trigger="{ toggle, triggerProps }">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
                v-bind="triggerProps"
                @click="toggle"
              >
                <ColorSwatch
                  :color="color"
                  decorative
                  :ui="swatchUi"
                />
                Choose color
              </button>
            </template>
            <template #content>
              <ColorPicker
                v-model="color"
                :format="format"
                :ui="pickerUi"
                aria-label="Popup color"
              />
            </template>
          </Popover>
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Read-only and disabled</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          These states retain the chosen value and prevent edits.
        </p>
        <div :class="canvasCol">
          <ColorPicker
            :model-value="color"
            read-only
            :ui="pickerUi"
            aria-label="Read-only color"
          />
          <ColorPicker
            :model-value="color"
            disabled
            :show-alpha="false"
            :ui="pickerUi"
            aria-label="Disabled color"
          />
        </div>
      </div>
    </div>
  </section>
</template>
