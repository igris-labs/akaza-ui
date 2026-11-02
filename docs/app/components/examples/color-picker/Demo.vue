<script setup lang="ts">
import type { ColorFormat } from "akaza-ui";

import { COLOR_FORMATS, ColorPicker, ColorSwatch } from "akaza-ui";
import { ref } from "vue";
import { Button as ExampleButton } from "../../ui/button";
import { Field } from "../../ui/field";
import { Popover } from "../../ui/popover";
import { Select } from "../../ui/select";
import { palette, pickerUi } from "../color/styles";
const color = ref("oklch(0.65 0.2 250 / 0.8)");
const formatOptions = COLOR_FORMATS.map((value) => ({ value, label: value }));
const format = ref<ColorFormat>("oklch");
const committed = ref("");
const open = ref(false);
</script>
<template>
  <div class="grid min-w-0 gap-6">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Popover composition</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Use Popover to show the picker in a popup.
      </p>
      <Popover
        v-model="open"
        teleport="body"
      >
        <template #trigger="{ toggle, triggerProps }">
          <ExampleButton
            type="button"
            color="secondary"
            variant="outline"
            size="md"
            class="w-fit"
            v-bind="triggerProps"
            @click="toggle"
          >
            <ColorSwatch
              :color="color"
              decorative
              :ui="{ root: 'block size-4 shrink-0 rounded-sm border border-border' }"
            />
            Choose color
          </ExampleButton>
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
      <Field
        label="Output format"
        class="w-full max-w-sm"
      >
        <Select
          v-model="format"
          :options="formatOptions"
          class="w-full"
        />
      </Field>
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
