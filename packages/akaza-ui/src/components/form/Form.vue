<script setup lang="ts">
import type { FormProps, FormSubmitDetails, FormValues } from ".";
import { computed, nextTick, provide, ref } from "vue";
import { createChangeDetails } from "../../utils/changeEvent";
import { formContextKey } from "./context";

const {
  id,
  action,
  method = "post",
  autocomplete,
  novalidate = false,
  preventDefault = true,
  errors,
  ui,
} = defineProps<FormProps>();

const emit = defineEmits<{
  submit: [details: FormSubmitDetails];
  "form-submit": [values: FormValues, details: FormSubmitDetails];
  reset: [event: Event];
}>();

const submitted = ref(false);
const lastValid = ref<boolean | null>(null);
const state = computed(() => {
  if (lastValid.value === false) return "invalid";
  if (submitted.value) return "submitted";
  return "idle";
});

provide(formContextKey, {
  errors: computed(() => errors),
});

function getValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const key of new Set(formData.keys())) {
    const entries = formData.getAll(key);
    values[key] = entries.length > 1 ? entries : entries[0]!;
  }
  return values;
}

function onInvalid() {
  submitted.value = true;
  lastValid.value = false;
}

function onSubmit(event: SubmitEvent) {
  const form = event.currentTarget as HTMLFormElement;
  const valid = form.checkValidity();
  submitted.value = true;
  lastValid.value = valid;

  if (preventDefault) event.preventDefault();

  const changeEvent = createChangeDetails("submit", event);
  const details: FormSubmitDetails = { ...changeEvent.details, event, formData: new FormData(form, event.submitter), valid };

  emit("submit", details);
  emit("form-submit", getValues(details.formData), details);

  if (changeEvent.canceled() && !event.defaultPrevented) event.preventDefault();
}

async function onReset(event: Event) {
  emit("reset", event);
  await nextTick();
  if (event.defaultPrevented) return;
  submitted.value = false;
  lastValid.value = null;
}
</script>

<template>
  <form
    :id="id"
    :action="action"
    :method="method"
    :autocomplete="autocomplete"
    :novalidate="novalidate"
    :class="ui?.root"
    :data-akaza-state="state"
    :data-akaza-invalid="lastValid === false || undefined"
    class="akaza-form"
    @invalid.capture="onInvalid"
    @reset="onReset"
    @submit="onSubmit"
  >
    <slot :state="state" :submitted="submitted" :valid="lastValid" />
  </form>
</template>
