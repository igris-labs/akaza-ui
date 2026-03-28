<script setup lang="ts">
import { Switch } from "akaza-ui";
import { ref } from "vue";

const notifications = ref(true);
const darkMode = ref(false);
const sound = ref(false);
</script>

<template>
  <div class="flex flex-col gap-5">
    <Switch
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account."
    >
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          :class="checked ? 'translate-x-5' : 'translate-x-0'"
        />
      </template>
    </Switch>

    <Switch v-model="darkMode" label="Dark mode" description="Apply a dark theme to the interface.">
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          :class="checked ? 'translate-x-5' : 'translate-x-0'"
        />
      </template>
    </Switch>

    <Switch v-model="sound" label="Sound effects" description="Play sounds for actions and alerts.">
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          :class="checked ? 'translate-x-5' : 'translate-x-0'"
        />
      </template>
    </Switch>
  </div>
</template>

<style scoped>
:deep(.akaza-switch-wrapper) {
  @apply flex items-center justify-between gap-4;
}

:deep(.akaza-switch-text) {
  @apply flex flex-col gap-0.5;
}

:deep(.akaza-switch-label) {
  @apply text-sm font-medium text-neutral-900 dark:text-neutral-100;
}

:deep(.akaza-switch-description) {
  @apply text-xs text-neutral-500 dark:text-neutral-400;
}

:deep(.akaza-switch) {
  @apply relative flex h-6 w-11 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors duration-200;
}

:deep(.akaza-switch[aria-checked="true"]) {
  @apply bg-neutral-900 dark:bg-white;
}

:deep(.akaza-switch[aria-checked="false"]) {
  @apply bg-neutral-200 dark:bg-neutral-700;
}
</style>
