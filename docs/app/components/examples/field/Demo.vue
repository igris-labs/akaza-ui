<script setup lang="ts">
import { computed, ref } from "vue";
import { Field } from "../../ui/field";
import { Input } from "../../ui/input";

const email = ref("");
const invalid = computed(() => email.value.length > 0 && !email.value.includes("@"));
</script>

<template>
  <Field
    label="Email"
    description="Used for account notifications."
    :error="invalid ? 'Enter a valid email address.' : undefined"
    required
  >
    <Input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      class="h-9 w-full max-w-sm"
    />
  </Field>
</template>
