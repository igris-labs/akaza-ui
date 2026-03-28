<script setup lang="ts">
import { Switch } from "akaza-ui";
import { ref } from "vue";

const notifications = ref(true);
const darkMode = ref(false);
const sound = ref(false);

const trackUi = {
  root: "data-[akaza-state=checked]:bg-neutral-900 dark:data-[akaza-state=checked]:bg-white data-[akaza-state=unchecked]:bg-neutral-200 dark:data-[akaza-state=unchecked]:bg-neutral-700",
};
</script>

<template>
  <div class="flex flex-col gap-5">
    <Switch
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account."
      :ui="trackUi"
    >
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full shadow-sm transition-all duration-200"
          :class="checked ? 'translate-x-5 bg-white dark:bg-neutral-900' : 'translate-x-0 bg-white'"
        />
      </template>
    </Switch>

    <Switch v-model="darkMode" label="Dark mode" description="Apply a dark theme to the interface." :ui="trackUi">
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full shadow-sm transition-all duration-200"
          :class="checked ? 'translate-x-5 bg-white dark:bg-neutral-900' : 'translate-x-0 bg-white'"
        />
      </template>
    </Switch>

    <Switch v-model="sound" label="Sound effects" description="Play sounds for actions and alerts." :ui="trackUi">
      <template #thumb="{ checked }">
        <span
          class="block size-5 rounded-full shadow-sm transition-all duration-200"
          :class="checked ? 'translate-x-5 bg-white dark:bg-neutral-900' : 'translate-x-0 bg-white'"
        />
      </template>
    </Switch>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

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
</style>
