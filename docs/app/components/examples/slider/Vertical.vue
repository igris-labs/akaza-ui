<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../ui/slider";

const volume = ref(60);
</script>

<template>
  <div class="flex items-center gap-4">
    <Slider
      v-model="volume"
      orientation="vertical"
      aria-label="Volume"
    />
    <span class="text-sm tabular-nums">Volume: {{ volume }}</span>
  </div>
</template>
