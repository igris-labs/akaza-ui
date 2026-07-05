<script setup lang="ts">
import type { FormErrors, FormSubmitDetails, FormValues } from "akaza-ui";
import { ref } from "vue";
import { Button, Field, Fieldset, Form, Input } from "akaza-ui";
import {
  buttonGhost,
  buttonPrimary,
  canvas,
  exampleStack,
  exampleTitle,
  fieldDescription,
  fieldError,
  fieldLabel,
  fieldsetContent,
  fieldsetDescription,
  fieldsetLegend,
  fieldsetRoot,
  inputControl,
  sectionDescription,
  sectionTitle,
} from "../styles";

const errors = ref<FormErrors>({});
const result = ref("No submit yet.");

function onFormSubmit(values: FormValues, details: FormSubmitDetails) {
  result.value = "Native validation blocked submit.";
  errors.value = {};

  if (!details.valid) return;

  const email = String(values.email ?? "");
  if (email === "taken@example.com") {
    errors.value = { email: "Email is already taken." };
    result.value = "Server error returned for email.";
    return;
  }

  result.value = JSON.stringify(values, null, 2);
}

function onReset() {
  errors.value = {};
  result.value = "Form reset.";
}
</script>

<template>
  <section id="form">
    <h2 :class="sectionTitle">Form</h2>
    <p :class="sectionDescription">
      Submit wrapper that exposes FormData, values, server errors, and native validity state.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Native submit + server errors</h3>
        <div :class="canvas">
          <Form
            :errors="errors"
            :ui="{ root: 'grid max-w-lg gap-4' }"
            @form-submit="onFormSubmit"
            @reset="onReset"
          >
            <Fieldset
              legend="Account"
              description="Try taken@example.com to see Form errors passed into Field."
              :ui="{
                root: fieldsetRoot,
                legend: fieldsetLegend,
                description: fieldsetDescription,
                content: fieldsetContent,
              }"
            >
              <Field
                label="Email"
                name="email"
                required
                :ui="{ label: fieldLabel, error: fieldError }"
              >
                <Input
                  type="email"
                  placeholder="you@example.com"
                  :ui="{ root: inputControl }"
                />
              </Field>

              <Field
                label="Company"
                name="company"
                description="Optional. Included in submitted values when filled."
                :ui="{ label: fieldLabel, description: fieldDescription }"
              >
                <Input
                  placeholder="Akaza Labs"
                  :ui="{ root: inputControl }"
                />
              </Field>
            </Fieldset>

            <div class="flex flex-wrap gap-2">
              <Button :class="buttonPrimary" type="submit">Create account</Button>
              <Button :class="buttonGhost" type="reset">Reset</Button>
            </div>

            <pre class="m-0 max-w-full overflow-auto whitespace-pre-wrap rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">{{ result }}</pre>
          </Form>
        </div>
      </div>
    </div>
  </section>
</template>
