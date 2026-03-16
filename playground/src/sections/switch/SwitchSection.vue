<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "akaza-ui";

const on = ref(false);
</script>

<template>
  <section id="switch">
    <h2 class="text-lg font-semibold mb-1">Switch</h2>
    <p class="text-sm mb-6 text-muted-foreground">A toggle switch for boolean settings.</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent">
      <Switch v-model="on" :ui="{ root: 'demo-switch', thumb: 'demo-switch-thumb' }" />
      <span class="text-sm text-muted-foreground">{{ on ? "On" : "Off" }}</span>
    </div>
  </section>
</template>

<style scoped>
:deep(.demo-switch) {
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: var(--border);
  transition: background 0.2s;
  cursor: pointer;
  border: none;
  padding: 2px;
}
:deep(.demo-switch[data-akaza-state="checked"]) {
  background: var(--primary);
}
:deep(.demo-switch:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
:deep(.demo-switch:focus:not(:focus-visible)) {
  outline: none;
}
:deep(.demo-switch-thumb) {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: var(--background);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  transform: translateX(0);
}
:deep(.demo-switch[data-akaza-state="checked"] .demo-switch-thumb) {
  transform: translateX(20px);
}
</style>
