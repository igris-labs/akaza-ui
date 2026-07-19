<script setup lang="ts">
import type { FormErrors, FormSubmitDetails, FormValues } from "akaza-ui";
import { Button, Field, Form, Input } from "akaza-ui";
import { ref } from "vue";

const result = ref("");
const errors = ref<FormErrors>({});

function onFormSubmit(values: FormValues, details: FormSubmitDetails) {
  if (!details.valid) return;
  const email = String(values.email ?? "");
  errors.value = email === "taken@example.com" ? { email: "Email is already taken." } : {};
  if (errors.value.email) return;
  result.value = `Submitted ${email}`;
}
</script>

<template>
  <Form
    :errors="errors"
    class="grid max-w-sm gap-4 rounded-xl border border-neutral-300 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
    @form-submit="onFormSubmit"
  >
    <Field
      label="Email"
      name="email"
      required
      :ui="{ label: 'text-sm font-medium', error: 'text-xs text-red-600 dark:text-red-400' }"
    >
      <Input
        type="email"
        placeholder="you@example.com"
        class="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm data-[invalid]:border-red-500 dark:border-neutral-800 dark:bg-neutral-950"
      />
    </Field>
    <Button
      type="submit"
      class="w-max rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
    >
      Create account
    </Button>
    <p v-if="result" class="text-xs text-neutral-600">{{ result }}</p>
  </Form>
</template>
