<script setup lang="ts">
import { ref } from "vue";
import { RadioGroup } from "../../ui/radio-group";

const plan = ref("pro");

const options = [
  { value: "free", label: "Free", description: "Up to 3 projects, community support." },
  { value: "pro", label: "Pro", description: "Unlimited projects, priority support." },
  { value: "team", label: "Team", description: "Everything in Pro, plus SSO and audit logs." },
];
</script>

<template>
  <RadioGroup
    v-model="plan"
    :options="options"
  />
</template>
