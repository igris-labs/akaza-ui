<script setup lang="ts">
import type { CheckboxGroupValue } from "akaza-ui";
import { ref } from "vue";
import { CheckboxGroup } from "akaza-ui";
import { canvasCol, checkboxGroupUi, codePill, sectionDescriptionTight, sectionTitle } from "../styles";

const channels = ref<CheckboxGroupValue[]>(["email"]);
const options = [
  { value: "email", label: "Email", description: "Product updates and changelog notes." },
  { value: "sms", label: "SMS", description: "Critical security alerts only." },
  { value: "push", label: "Push", description: "In-app notifications." },
];
</script>

<template>
  <section id="checkbox-group">
    <h2 :class="sectionTitle">Checkbox Group</h2>
    <p :class="sectionDescriptionTight">
      Items-based multi-select built on Checkbox.
    </p>

    <div :class="canvasCol">
      <CheckboxGroup
        v-model="channels"
        parent
        legend="Notification channels"
        name="channels"
        parent-description="Toggle every enabled channel."
        :options="options"
        :ui="checkboxGroupUi"
      />
      <code :class="codePill">{{ channels.join(", ") || "none" }}</code>
    </div>
  </section>
</template>
