<script setup lang="ts">
import type { CheckboxGroupValue } from "akaza-ui";
import { ref } from "vue";
import { CheckboxGroup } from "akaza-ui";
import { canvasCol, checkboxGroupUi, codePill, exampleTitle, sectionDescriptionTight, sectionTitle } from "../styles";

const channels = ref<CheckboxGroupValue[]>(["email"]);
const guardedChannels = ref<CheckboxGroupValue[]>(["email", "locked"]);
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

    <div :class="['mt-8', canvasCol]">
      <h3 :class="exampleTitle">Cancelable parent + disabled selection</h3>
      <CheckboxGroup
        v-model="guardedChannels"
        parent
        legend="Required email channel"
        :options="[...options, { value: 'locked', label: 'Security audit', disabled: true }]"
        :ui="checkboxGroupUi"
        @value-change="(value, details) => { if (!value.includes('email')) details.cancel(); }"
      />
      <code :class="codePill">{{ guardedChannels.join(', ') }}</code>
    </div>
  </section>
</template>
