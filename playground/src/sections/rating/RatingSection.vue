<script setup lang="ts">
import { Field, Rating } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldLabel,
  ratingUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const score = ref(3);
const preciseScore = ref(2.5);
const requiredScore = ref(0);
const rtlScore = ref(2.5);
const verticalScore = ref(3);
</script>

<template>
  <section id="rating">
    <h2 :class="sectionTitle">Rating</h2>
    <p :class="sectionDescription">
      Radio-group rating input with fractional values, hover preview, clear, RTL, and native forms.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Standard rating</h3>
        <div :class="canvasCol">
          <Rating v-model="score" hoverable clearable :ui="ratingUi" />
          <code :class="codePill">score: {{ score }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Fractional values</h3>
        <div :class="canvasCol">
          <Rating v-model="preciseScore" :step="0.5" hoverable clearable :ui="ratingUi" />
          <code :class="codePill">precise: {{ preciseScore }}</code>
          <p class="text-xs text-muted-foreground">Arrow keys move by 0.5. Home and End jump to range edges.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Right-to-left and vertical navigation</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <div class="grid content-start gap-3">
            <Rating v-model="rtlScore" :step="0.5" dir="rtl" :loop="false" aria-label="RTL quality" :ui="ratingUi" />
            <code :class="codePill">RTL score: {{ rtlScore }}</code>
          </div>
          <div class="grid content-start gap-3">
            <Rating v-model="verticalScore" orientation="vertical" aria-label="Vertical quality" :ui="ratingUi" />
            <code :class="codePill">vertical score: {{ verticalScore }}</code>
          </div>
          <p class="text-xs text-muted-foreground sm:col-span-2">Both arrow pairs select a value. RTL reverses horizontal arrows. The RTL example does not wrap.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Form and display states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-2']">
          <Field
            label="Required score"
            name="score"
            description="Submitted as one numeric form value."
            required
            :ui="{ label: fieldLabel, description: fieldDescription }"
          >
            <Rating v-model="requiredScore" :ui="ratingUi" />
          </Field>
          <div class="grid content-start gap-2">
            <span class="text-sm font-semibold text-foreground">Read-only average</span>
            <Rating :model-value="4" read-only :ui="ratingUi" aria-label="Average rating: 4 of 5" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
