<script setup lang="ts">
import { ref } from "vue";
import { Progress } from "akaza-ui";

const value = ref(40);
</script>

<template>
  <section id="progress">
    <h2 class="text-lg font-semibold mb-1">Progress</h2>
    <p class="text-sm mb-6 text-muted-foreground">Shows completion of a task or operation.</p>
    <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
      <Progress v-model="value" :max="100" :ui="{ root: 'demo-progress-root', indicator: 'demo-progress-indicator' }" />
      <div class="flex items-center gap-3">
        <input v-model.number="value" type="range" min="0" max="100" class="flex-1 accent-primary" />
        <span class="text-sm text-muted-foreground w-10 text-right">{{ value }}%</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-progress-root {
  width: 100%;
  height: 8px;
  border-radius: 9999px;
  background: var(--muted);
  overflow: hidden;
}
.demo-progress-indicator {
  height: 100%;
  border-radius: 9999px;
  background: var(--primary);
  transition: width 0.3s ease;
}
</style>
