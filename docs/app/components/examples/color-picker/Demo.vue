<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";
import { COLOR_FORMATS, ColorPicker, ColorSwatch, Popover } from "akaza-ui";
import { ref } from "vue";
import { palette, pickerUi, swatchUi } from "../color/styles";
const color = ref("oklch(0.65 0.2 250 / 0.8)");
const format = ref<ColorFormat>("oklch");
const committed = ref("");
const open = ref(false);
</script>
<template>
  <div class="grid min-w-0 gap-6 [--ui-radius:0.25rem]">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Popover composition</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Use Popover to show the picker in a popup.
      </p>
      <Popover
        v-model="open"
        teleport="body"
        :ui="{
          content:
            'max-h-[calc(100dvh-1rem)] w-[min(90vw,22rem)] overflow-y-auto rounded-md border border-border bg-popover p-4 shadow-lg [--ui-radius:0.25rem]',
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
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Output format</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Choose the format for the returned color. Hue stays editable for gray and black.
      </p>
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
      <output class="block break-all font-mono text-xs text-muted-foreground">{{ color }}</output>
      <p class="break-all text-xs text-muted-foreground">
        Committed: {{ committed || "No interaction yet" }}
      </p>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Read-only and disabled</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        These states retain the chosen value and prevent edits.
      </p>
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
    </section>
  </div>
</template>
