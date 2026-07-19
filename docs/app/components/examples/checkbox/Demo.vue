<script setup lang="ts">
import { Checkbox } from "akaza-ui";
import { ref } from "vue";

const notifications = ref(true);
const marketing = ref(false);
const updates = ref<boolean | "indeterminate">("indeterminate");

const checkboxUi = {
  root: "checkbox-box",
  indicator: "checkbox-indicator",
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <Checkbox
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account activity."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </Checkbox>

    <Checkbox
      v-model="marketing"
      label="Marketing emails"
      description="Get notified about new features and promotions."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
    </Checkbox>

    <Checkbox
      v-model="updates"
      label="All updates"
      description="A mix of indeterminate, checked, and unchecked."
      :ui="checkboxUi"
    >
      <template #indicator="{ checked }">
        <svg
          v-if="checked === true"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg
          v-else-if="checked === 'indeterminate'"
          class="size-3 text-white dark:text-neutral-900"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 6h6" stroke-linecap="round" />
        </svg>
      </template>
    </Checkbox>
  </div>
</template>

<style scoped>
@reference "../../../assets/css/main.css";

:deep(.akaza-checkbox-wrapper) {
  @apply flex cursor-pointer items-start gap-3;
}

:deep(.checkbox-box) {
  @apply flex size-4 items-center justify-center rounded border border-neutral-400 bg-white text-transparent transition-colors dark:border-neutral-600 dark:bg-neutral-800;
}

:deep(.checkbox-box[data-akaza-state="checked"]),
:deep(.checkbox-box[data-akaza-state="indeterminate"]) {
  @apply border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900;
}

:deep(.checkbox-indicator) {
  @apply flex items-center justify-center;
}

:deep(.akaza-checkbox-text) {
  @apply flex flex-col gap-0.5;
}

:deep(.akaza-checkbox-label) {
  @apply text-sm font-medium text-neutral-900 dark:text-neutral-100;
}

:deep(.akaza-checkbox-description) {
  @apply text-xs text-neutral-600 dark:text-neutral-400;
}
</style>
