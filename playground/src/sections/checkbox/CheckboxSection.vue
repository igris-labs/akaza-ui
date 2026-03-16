<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "akaza-ui";
import type { CheckboxValue } from "akaza-ui";

const value = ref<CheckboxValue>(false);
</script>

<template>
  <section id="checkbox">
    <h2 class="text-lg font-semibold mb-1">Checkbox</h2>
    <p class="text-sm mb-6 text-muted-foreground">Tri-state checkbox: checked, unchecked, and indeterminate.</p>
    <div class="rounded-lg border p-6 flex items-center gap-6 bg-accent">
      <div class="flex items-center gap-2">
        <Checkbox v-model="value" :ui="{ root: 'demo-checkbox', indicator: 'demo-checkbox-indicator' }">
          <template #indicator="{ checked }">
            <span v-if="checked === true">✓</span>
            <span v-else-if="checked === 'indeterminate'">–</span>
          </template>
        </Checkbox>
        <span class="text-sm text-foreground">Accept terms</span>
      </div>
      <button
        class="text-xs text-muted-foreground underline"
        @click="value = value === false ? true : value === true ? 'indeterminate' : false"
      >
        Cycle state
      </button>
      <span class="text-xs text-muted-foreground capitalize">{{ value }}</span>
    </div>
  </section>
</template>

<style scoped>
:deep(.demo-checkbox) {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--border);
  background: var(--background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  padding: 0;
  flex-shrink: 0;
}
:deep(.demo-checkbox:focus:not(:focus-visible)) {
  outline: none;
}
:deep(.demo-checkbox:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
:deep(.demo-checkbox[data-akaza-state="checked"]),
:deep(.demo-checkbox[data-akaza-state="indeterminate"]) {
  background: var(--primary);
  border-color: var(--primary);
}
:deep(.demo-checkbox-indicator) {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-foreground);
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
}
</style>
