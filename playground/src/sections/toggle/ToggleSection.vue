<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "akaza-ui";

const bold = ref(false);
const iconPressed = ref(false);
const disabled = ref(false);
const uiPressed = ref(false);
</script>

<template>
  <section id="toggle">
    <h2 class="text-lg font-semibold mb-1">Toggle</h2>
    <p class="text-sm mb-6 text-muted-foreground">
      A button that toggles between pressed and unpressed.
    </p>

    <!-- Basic -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Basic</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent mb-6">
      <Toggle
        v-model="bold"
        class="tgl-btn"
        :class="bold ? 'tgl-btn--on' : ''"
      >
        Bold
      </Toggle>
      <span class="text-sm text-muted-foreground">{{ bold ? "Pressed" : "Not pressed" }}</span>
    </div>

    <!-- Icon-only with aria-label -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Icon-only (aria-label)</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent mb-6">
      <Toggle
        v-model="iconPressed"
        aria-label="Toggle bold"
        class="tgl-icon"
        :class="iconPressed ? 'tgl-icon--on' : ''"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </Toggle>
      <span class="text-sm text-muted-foreground">{{ iconPressed ? "Bold on" : "Bold off" }}</span>
    </div>

    <!-- Disabled -->
    <p class="text-xs font-medium text-muted-foreground mb-2">Disabled</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent mb-6">
      <Toggle v-model="disabled" :disabled="true" class="tgl-btn tgl-btn--disabled">
        Italic
      </Toggle>
    </div>

    <!-- ui prop -->
    <p class="text-xs font-medium text-muted-foreground mb-2">ui prop</p>
    <div class="rounded-lg border p-6 flex items-center gap-4 bg-accent mb-6">
      <Toggle
        v-model="uiPressed"
        :ui="{ root: uiPressed ? 'tgl-ui--on' : 'tgl-ui--off' }"
        class="tgl-ui"
      >
        <template #default="{ pressed }">
          {{ pressed ? "★ Starred" : "☆ Star" }}
        </template>
      </Toggle>
    </div>
  </section>
</template>

<style>
.tgl-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tgl-btn--on {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.tgl-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tgl-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tgl-icon--on {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.tgl-ui {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tgl-ui--off {
  background: var(--background);
  color: var(--foreground);
}
.tgl-ui--on {
  background: var(--accent);
  color: var(--accent-foreground);
  border-color: var(--primary);
}
</style>
