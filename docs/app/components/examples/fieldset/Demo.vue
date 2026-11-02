<script setup lang="ts">
import { Field } from "../../ui/field";
import { Fieldset } from "../../ui/fieldset";
import { Input } from "../../ui/input";
</script>

<template>
  <Fieldset
    legend="Billing details"
    description="Grouped fields share one semantic boundary."
  >
    <Field label="Name">
      <Input
        placeholder="Ada Lovelace"
        class="h-9 w-full max-w-sm"
      />
    </Field>
    <Field label="Company">
      <Input
        placeholder="Analytical Engines Inc."
        class="h-9 w-full max-w-sm"
      />
    </Field>
  </Fieldset>
</template>
