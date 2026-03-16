<script setup lang="ts">
import { ref } from "vue";
import { Accordion } from "akaza-ui";

const open = ref("");
const items = [
  { value: "what", label: "What is Akaza UI?" },
  { value: "how", label: "How does it work?" },
  { value: "why", label: "Why slots over sub-components?" },
];
</script>

<template>
  <section id="accordion">
    <h2 class="text-lg font-semibold mb-1">Accordion</h2>
    <p class="text-sm mb-6 text-muted-foreground">Multiple collapsible sections, one open at a time.</p>
    <div class="rounded-lg border p-6 bg-accent">
      <Accordion
        v-model="open"
        :items="items"
        value-key="value"
        collapsible
        :ui="{ trigger: 'demo-accordion-trigger' }"
        class="w-full max-w-sm border border-border rounded-lg overflow-hidden divide-y divide-border bg-background"
      >
        <template #trigger="{ item }">
          <span class="text-sm font-medium text-foreground">{{ item.label }}</span>
        </template>
        <template #content="{ value }">
          <div class="px-4 pb-4 pt-3 text-sm text-muted-foreground border-t border-border">
            <template v-if="value === 'what'">A Vue-native headless component library focused on slots over sub-components.</template>
            <template v-else-if="value === 'how'">Components own their DOM; you style via the <code class="text-foreground font-mono text-xs bg-muted px-1 rounded">ui</code> prop and fill named slots.</template>
            <template v-else>Because Vue's slot API is first-class and doesn't require wrapping every element in a sub-component.</template>
          </div>
        </template>
      </Accordion>
    </div>
  </section>
</template>

<style scoped>
:deep(.demo-accordion-trigger) {
  padding: 12px 16px;
  color: var(--foreground);
}
:deep(.demo-accordion-trigger:focus:not(:focus-visible)) {
  outline: none;
}
:deep(.demo-accordion-trigger:focus-visible) {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
:deep(.akaza-accordion-icon) {
  color: var(--muted-foreground);
}
</style>
