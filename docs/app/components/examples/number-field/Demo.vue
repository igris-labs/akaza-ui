<script setup lang="ts">
import { ref } from "vue";
import { NumberField } from "../../ui/number-field";

const value = ref<number | null>(3);
</script>

<template>
  <div class="grid max-w-xs gap-3">
    <NumberField
      v-model="value"
      :min="1"
      :max="10"
      scrub-label="Drag"
    />
    <p class="text-xs text-muted-foreground">Value: {{ value ?? "(empty)" }}</p>
  </div>
</template>
