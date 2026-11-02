<script setup lang="ts">
import type { ToggleGroupModel } from "akaza-ui";
import { ref } from "vue";
import { ToggleGroup } from "../../ui/toggle-group";

const value = ref<ToggleGroupModel>("center");
const options = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];
</script>

<template>
  <div class="grid gap-3">
    <ToggleGroup
      v-model="value"
      :allow-empty="false"
      :options="options"
      aria-label="Text alignment"
    />
    <p class="text-xs text-muted-foreground">Value: {{ value }}</p>
  </div>
</template>
