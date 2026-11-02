<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../ui/slider";

const value = ref(60);
</script>

<template>
  <div class="grid w-full max-w-xs gap-3">
    <Slider
      v-model="value"
      aria-label="Volume"
    />
    <p class="text-xs text-muted-foreground">Value: {{ value }}</p>
  </div>
</template>
