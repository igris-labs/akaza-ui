<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "../../ui/checkbox";

const notifications = ref(true);
const marketing = ref(false);
const updates = ref<boolean | "indeterminate">("indeterminate");
</script>

<template>
  <div class="flex flex-col gap-4">
    <Checkbox
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account activity."
    />
    <Checkbox
      v-model="marketing"
      label="Marketing emails"
      description="Get notified about new features and promotions."
    />
    <Checkbox
      v-model="updates"
      label="All updates"
      description="A mix of indeterminate, checked, and unchecked."
    />
  </div>
</template>
