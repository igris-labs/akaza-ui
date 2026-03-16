<script setup lang="ts">
import { ref } from "vue";
import { Collapsible } from "akaza-ui";

const open = ref(false);
</script>

<template>
  <section id="collapsible">
    <h2 class="text-lg font-semibold mb-1">Collapsible</h2>
    <p class="text-sm mb-6 text-muted-foreground">An expandable section with a trigger.</p>
    <div class="rounded-lg border p-6 bg-accent">
      <Collapsible v-model="open" :ui="{ trigger: 'demo-collapsible-trigger' }" class="w-full max-w-sm border border-border rounded-lg overflow-hidden bg-background">
        <template #trigger>
          <span class="text-sm font-medium text-foreground">What is Akaza UI?</span>
        </template>
        <template #content>
          <div class="px-4 pb-4 pt-3 text-sm text-muted-foreground border-t border-border">
            Akaza UI is a Vue-native headless component library using slots and the
            <code class="text-foreground font-mono text-xs bg-muted px-1 rounded">ui</code> prop for styling.
          </div>
        </template>
      </Collapsible>
    </div>
  </section>
</template>

<style scoped>
:deep(.demo-collapsible-trigger) {
  padding: 12px 16px;
  color: var(--foreground);
}
:deep(.demo-collapsible-trigger:focus:not(:focus-visible)) {
  outline: none;
}
:deep(.demo-collapsible-trigger:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
:deep(.akaza-collapsible-icon) {
  color: var(--muted-foreground);
}
</style>
