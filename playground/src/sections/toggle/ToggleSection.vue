<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "akaza-ui";
import {
  canvasRow,
  sectionDescriptionTight,
  sectionTitle,
  toggleIcon,
  toggleRoot,
  toggleSubtle,
} from "../styles";

const bold = ref(false);
const iconPressed = ref(false);
const disabled = ref(false);
const uiPressed = ref(false);
</script>

<template>
  <section id="toggle">
    <h2 :class="sectionTitle">Toggle</h2>
    <p :class="sectionDescriptionTight">
      A button that toggles between pressed and unpressed.
    </p>

    <!-- Basic -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Basic</p>
    <div :class="[canvasRow, 'mb-6']">
      <Toggle
        v-model="bold"
        :ui="{ root: toggleRoot }"
      >
        Bold
      </Toggle>
      <span class="text-sm text-muted-foreground">{{ bold ? "Pressed" : "Not pressed" }}</span>
    </div>

    <!-- Icon-only with aria-label -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Icon-only (aria-label)</p>
    <div :class="[canvasRow, 'mb-6']">
      <Toggle
        v-model="iconPressed"
        aria-label="Toggle bold"
        :ui="{ root: toggleIcon }"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </Toggle>
      <span class="text-sm text-muted-foreground">{{ iconPressed ? "Bold on" : "Bold off" }}</span>
    </div>

    <!-- Disabled -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Disabled</p>
    <div :class="[canvasRow, 'mb-6']">
      <Toggle v-model="disabled" :disabled="true" :ui="{ root: toggleRoot }">
        Italic
      </Toggle>
    </div>

    <!-- ui prop -->
    <p class="text-xs font-medium text-muted-foreground mb-2">ui prop</p>
    <div :class="[canvasRow, 'mb-6']">
      <Toggle
        v-model="uiPressed"
        :ui="{ root: toggleSubtle }"
      >
        <template #default="{ pressed }">
          {{ pressed ? "★ Starred" : "☆ Star" }}
        </template>
      </Toggle>
    </div>
  </section>
</template>
