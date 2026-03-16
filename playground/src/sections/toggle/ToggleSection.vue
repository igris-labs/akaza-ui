<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "akaza-ui";

const pressed = ref(false);
</script>

<template>
  <section id="toggle">
    <h2 class="text-lg font-semibold mb-1">Toggle</h2>
    <p class="text-sm mb-6 text-muted-foreground">
      A button that toggles between pressed and unpressed.
    </p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent">
      <Toggle
        v-model="pressed"
        class="px-4 py-1.5 rounded-md border text-sm font-medium transition-colors"
        :class="
          pressed
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background text-foreground border-border'
        "
      >
        Bold
      </Toggle>
      <span class="text-sm text-muted-foreground">{{ pressed ? "Pressed" : "Not pressed" }}</span>
    </div>
  </section>
</template>
