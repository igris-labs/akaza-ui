<script setup lang="ts">
import { ref } from "vue";

import { Button as ExampleButton } from "../../ui/button";
import { Progress } from "../../ui/progress";

const value = ref(65);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <!-- Determinate -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>Upload progress</span>
        <span>{{ value }}%</span>
      </div>
      <Progress
        v-model="value"
        class="h-2 w-full"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <ExampleButton
        class="flex-1"
        @click="value = Math.max(0, value - 20)"
      >
        − 20%
      </ExampleButton>
      <ExampleButton
        class="flex-1"
        @click="value = Math.min(100, value + 20)"
      >
        + 20%
      </ExampleButton>
    </div>

    <!-- Indeterminate -->
    <div class="flex flex-col gap-2">
      <span class="text-xs text-muted-foreground">Indeterminate</span>
      <Progress
        :model-value="null"
        :ui="{ indicator: 'progress-demo-indeterminate' }"
        class="h-2 w-full"
        aria-label="Loading"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.progress-demo-indeterminate) {
  width: 33.333333%;
  animation: progress-indeterminate 1.4s ease infinite;
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%) scaleX(1);
  }
  50% {
    transform: translateX(100%) scaleX(2);
  }
  100% {
    transform: translateX(300%) scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.progress-demo-indeterminate) {
    animation: none;
    transform: translateX(100%);
  }
}
</style>
