<script setup lang="ts">
import { Meter } from "akaza-ui";
import {
  canvasCol,
  canvasGrid,
  exampleStack,
  exampleTitle,
  meterUi,
  sectionDescription,
  sectionTitle,
} from "../styles";
</script>

<template>
  <section id="meter">
    <h2 :class="sectionTitle">Meter</h2>
    <p :class="sectionDescription">
      Read-only gauge for bounded values with meter ARIA and state styling.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Basic gauge</h3>
        <div :class="canvasCol">
          <Meter label="Storage used" :value="64" :ui="meterUi" />
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Low/high states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Meter label="API quota" :value="18" :low="25" :high="90" :ui="meterUi" />
          <Meter label="Error budget" :value="94" :low="20" :high="80" :ui="meterUi" />
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Formatted value + slots</h3>
        <div :class="canvasCol">
          <Meter
            :value="0.72"
            :min="0"
            :max="1"
            :format-options="{ style: 'percent' }"
            :ui="meterUi"
            aria-label="Cache hit rate"
          >
            <template #label>Cache hit rate</template>
            <template #value="{ formattedValue }">{{ formattedValue }}</template>
          </Meter>
        </div>
      </div>
    </div>
  </section>
</template>
