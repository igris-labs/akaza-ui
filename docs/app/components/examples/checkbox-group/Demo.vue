<script setup lang="ts">
import type { CheckboxGroupValue } from "akaza-ui";
import { ref } from "vue";
import { CheckboxGroup } from "../../ui/checkbox-group";

const value = ref<CheckboxGroupValue[]>(["email"]);
const options = [
  { value: "email", label: "Email", description: "Product updates and changelog notes." },
  { value: "sms", label: "SMS", description: "Critical security alerts only." },
  { value: "push", label: "Push", description: "In-app notifications." },
];
</script>

<template>
  <div class="grid max-w-sm gap-3">
    <CheckboxGroup
      v-model="value"
      parent
      legend="Notification channels"
      name="channels"
      parent-description="Toggle every enabled channel."
      :options="options"
    />
    <p class="text-xs text-muted-foreground">Selected: {{ value.join(", ") || "none" }}</p>
  </div>
</template>
