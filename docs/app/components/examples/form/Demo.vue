<script setup lang="ts">
import type { FormErrors, FormSubmitDetails, FormValues } from "akaza-ui";
import { ref } from "vue";
import { Button } from "../../ui/button";
import { Field } from "../../ui/field";
import { Form } from "../../ui/form";
import { Input } from "../../ui/input";

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
    class="max-w-sm gap-4"
    @form-submit="onFormSubmit"
  >
    <Field
      label="Email"
      name="email"
      required
    >
      <Input
        type="email"
        placeholder="you@example.com"
        class="h-9"
      />
    </Field>
    <Button
      type="submit"
      class="w-max"
    >
      Create account
    </Button>
    <p
      v-if="result"
      class="text-xs text-muted-foreground"
    >
      {{ result }}
    </p>
  </Form>
</template>
