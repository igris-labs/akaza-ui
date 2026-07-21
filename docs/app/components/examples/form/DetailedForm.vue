<script setup lang="ts">
import type {
  CheckboxGroupOption,
  FormErrors,
  FormSubmitDetails,
  FormValues,
  SelectOption,
} from "akaza-ui";
import {
  Button,
  CheckboxGroup,
  Field,
  Fieldset,
  Form,
  Input,
  NumberField,
  Select,
  Slider,
  Switch,
} from "akaza-ui";
import { computed, ref } from "vue";

const errors = ref<FormErrors>({});
const result = ref("No submit yet. Live values update on the left.");
const submitAttempted = ref(false);
const interactedFields = ref<Record<string, boolean>>({});

const ownerName = ref("");
const ownerEmail = ref("ops@example.com");
const workspaceSlug = ref("support");
const plan = ref("");
const seats = ref<number | null>(3);
const riskScore = ref(72);
const permissions = ref(["read", "export"]);
const billingLocked = ref(true);
const billingName = ref("Rahul Vashishtha");
const billingEmail = ref("billing@example.com");

const planOptions: SelectOption[] = [
  { type: "label", label: "Production" },
  { value: "startup", label: "Startup", description: "Small team with manual review." },
  { value: "business", label: "Business", description: "SAML, audit logs, priority support." },
  { value: "enterprise", label: "Enterprise", description: "Custom contract and legal review." },
  { type: "separator" },
  {
    value: "legacy",
    label: "Legacy contract",
    description: "Visible, but blocked for new requests.",
    disabled: true,
  },
];

const permissionOptions: CheckboxGroupOption[] = [
  {
    value: "read",
    label: "Read customer records",
    description: "Needed by support and operations.",
  },
  {
    value: "export",
    label: "Export reports",
    description: "Downloads CSV files with customer data.",
  },
  {
    value: "admin",
    label: "Admin changes",
    description: "Can invite users and edit billing settings.",
  },
  {
    value: "billing",
    label: "Billing write access",
    description: "Requires finance approval.",
    disabled: true,
  },
];

const fieldUi = {
  root: "min-w-0",
  label: "text-sm font-medium text-neutral-950 dark:text-neutral-50",
  required: "ml-0.5 text-red-600 dark:text-red-400",
  description: "text-xs leading-5 text-neutral-600 dark:text-neutral-400",
  error: "text-xs font-medium text-red-600 dark:text-red-400",
};

const fieldsetUi = {
  root: "min-w-0 rounded-none border border-neutral-300 p-4 data-[akaza-disabled]:bg-neutral-50 data-[akaza-disabled]:opacity-80 dark:border-neutral-800 dark:data-[akaza-disabled]:bg-neutral-900/40",
  legend: "px-1 text-sm font-semibold text-neutral-950 dark:text-neutral-50",
  description: "mt-1 text-xs leading-5 text-neutral-600 dark:text-neutral-400",
  content: "mt-4 grid min-w-0 gap-4",
};

const inputClass =
  "h-10 min-w-0 w-full rounded-none border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 data-[akaza-invalid]:border-red-500 data-[akaza-invalid]:ring-2 data-[akaza-invalid]:ring-red-500/20 data-[akaza-invalid]:focus:border-red-500 data-[akaza-invalid]:focus:ring-red-500/30 dark:border-neutral-800 dark:bg-black dark:text-neutral-50 dark:focus:border-neutral-100 dark:focus:ring-white/10 dark:disabled:bg-neutral-900 dark:data-[akaza-invalid]:border-red-400 dark:data-[akaza-invalid]:ring-red-400/20 dark:data-[akaza-invalid]:focus:border-red-400 dark:data-[akaza-invalid]:focus:ring-red-400/30";

const selectUi = {
  root: "min-w-0 w-full",
  trigger:
    "flex h-10 w-full items-center justify-between rounded-none border border-neutral-300 bg-white px-3 text-left text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600 data-[akaza-invalid]:border-red-500 data-[akaza-invalid]:ring-2 data-[akaza-invalid]:ring-red-500/20 data-[akaza-invalid]:focus:border-red-500 data-[akaza-invalid]:focus:ring-red-500/30 dark:border-neutral-800 dark:bg-black dark:text-neutral-50 dark:focus:border-neutral-100 dark:focus:ring-white/10 dark:disabled:bg-neutral-900 dark:data-[akaza-invalid]:border-red-400 dark:data-[akaza-invalid]:ring-red-400/20 dark:data-[akaza-invalid]:focus:border-red-400 dark:data-[akaza-invalid]:focus:ring-red-400/30",
  placeholder: "text-neutral-500",
  content:
    "z-20 rounded-none border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-black",
  viewport: "max-h-64 overflow-auto",
  option:
    "flex cursor-pointer items-start gap-2 rounded-none px-2 py-1.5 text-sm text-neutral-950 data-[akaza-highlighted]:bg-neutral-100 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40 dark:text-neutral-50 dark:data-[akaza-highlighted]:bg-neutral-800",
  indicator: "w-4 text-neutral-900 dark:text-neutral-100",
  optionText: "grid gap-0.5",
  optionDescription: "text-xs text-neutral-600",
};

const numberUi = {
  root: "h-10 w-full overflow-hidden rounded-none border border-neutral-300 bg-white focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 data-[akaza-invalid]:border-red-500 data-[akaza-invalid]:ring-2 data-[akaza-invalid]:ring-red-500/20 data-[akaza-invalid]:focus-within:border-red-500 data-[akaza-invalid]:focus-within:ring-red-500/30 dark:border-neutral-800 dark:bg-black dark:focus-within:border-neutral-100 dark:focus-within:ring-white/10 dark:data-[akaza-invalid]:border-red-400 dark:data-[akaza-invalid]:ring-red-400/20 dark:data-[akaza-invalid]:focus-within:border-red-400 dark:data-[akaza-invalid]:focus-within:ring-red-400/30",
  decrement:
    "grid h-full w-10 place-items-center border-r border-neutral-300 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300",
  input:
    "h-full min-w-0 flex-1 bg-transparent px-3 text-center text-sm text-neutral-950 outline-none disabled:cursor-not-allowed disabled:text-neutral-600 dark:text-neutral-50",
  increment:
    "grid h-full w-10 place-items-center border-l border-neutral-300 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300",
};

const checkboxUi = {
  root: "border-neutral-300 text-neutral-900 data-[akaza-state=checked]:bg-neutral-900 data-[akaza-state=checked]:text-white dark:border-neutral-700 dark:text-neutral-100 dark:data-[akaza-state=checked]:bg-white dark:data-[akaza-state=checked]:text-neutral-950",
  label: "text-sm font-medium text-neutral-950 dark:text-neutral-50",
  description: "text-xs leading-5 text-neutral-600 dark:text-neutral-400",
};

const checkboxGroupUi = {
  root: "grid min-w-0 gap-2",
  item: "rounded-none border border-neutral-300 p-3 data-[akaza-state=checked]:border-neutral-900 dark:border-neutral-800 dark:data-[akaza-state=checked]:border-neutral-100",
  checkbox: checkboxUi,
};

const sliderUi = {
  root: "h-6 w-full",
  track: "h-2 w-full rounded-none bg-neutral-200 dark:bg-neutral-800",
  range: "h-full rounded-none bg-neutral-900 dark:bg-white",
  thumb:
    "size-5 rounded-none border-2 border-neutral-900 bg-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-white dark:bg-black dark:focus-visible:ring-white",
};

const switchUi = {
  wrapper: "items-start",
  root: "relative h-5 w-9 rounded-none bg-neutral-200 transition data-[akaza-state=checked]:bg-neutral-900 dark:bg-neutral-800 dark:data-[akaza-state=checked]:bg-white",
  thumb:
    "absolute left-0.5 top-0.5 size-4 rounded-none bg-white transition-transform data-[akaza-state=checked]:translate-x-4 dark:bg-black",
  label: "text-sm font-medium text-neutral-950 dark:text-neutral-50",
  description: "text-xs leading-5 text-neutral-600 dark:text-neutral-400",
};

const workspaceSlugPattern = /^[a-z0-9-]+$/;
const riskLabel = computed(() => `${riskScore.value}/100`);
const hasOwnerNameIssue = computed(() => !ownerName.value.trim());
const hasOwnerEmailIssue = computed(
  () =>
    Boolean(errors.value.ownerEmail) || ownerEmail.value.toLowerCase() === "blocked@company.test",
);
const hasWorkspaceSlugIssue = computed(
  () =>
    Boolean(errors.value.workspaceSlug) ||
    ["admin", "root", "billing"].includes(workspaceSlug.value.toLowerCase()),
);
const hasPlanIssue = computed(() => Boolean(errors.value.plan) || !plan.value);
const hasSeatsIssue = computed(
  () => Boolean(errors.value.seats) || seats.value === null || seats.value < 5,
);
const hasPermissionsIssue = computed(
  () => Boolean(errors.value.permissions) || !permissions.value.length,
);
const showOwnerNameIssue = computed(() => hasOwnerNameIssue.value && shouldShowIssue("ownerName"));
const showOwnerEmailIssue = computed(
  () => hasOwnerEmailIssue.value && shouldShowIssue("ownerEmail"),
);
const showWorkspaceSlugIssue = computed(
  () => hasWorkspaceSlugIssue.value && shouldShowIssue("workspaceSlug"),
);
const showPlanIssue = computed(() => hasPlanIssue.value && shouldShowIssue("plan"));
const showSeatsIssue = computed(() => hasSeatsIssue.value && shouldShowIssue("seats"));
const showPermissionsIssue = computed(
  () => hasPermissionsIssue.value && shouldShowIssue("permissions"),
);
const ownerNameError = computed(() =>
  showOwnerNameIssue.value ? "Requester is required." : undefined,
);
const ownerEmailError = computed(() => {
  if (!shouldShowIssue("ownerEmail")) return undefined;
  const serverError = getFieldError("ownerEmail");
  if (serverError) return serverError;
  if (!ownerEmail.value.trim()) return "Work email is required.";
  if (ownerEmail.value.toLowerCase() === "blocked@company.test") {
    return "blocked@company.test is blocked by server-side validation.";
  }
  return undefined;
});
const workspaceSlugError = computed(() => {
  if (!shouldShowIssue("workspaceSlug")) return undefined;
  const serverError = getFieldError("workspaceSlug");
  if (serverError) return serverError;
  const slug = workspaceSlug.value.toLowerCase();
  if (!slug.trim()) return "Workspace slug is required.";
  if (!workspaceSlugPattern.test(slug)) return "Use lowercase letters, numbers, and hyphens only.";
  if (["admin", "root", "billing"].includes(slug)) {
    return `${slug} is reserved. Pick a team-specific slug.`;
  }
  return undefined;
});
const planError = computed(() => {
  if (!showPlanIssue.value) return undefined;
  return getFieldError("plan") || "Select a plan.";
});
const seatsError = computed(() => {
  if (!showSeatsIssue.value) return undefined;
  const serverError = getFieldError("seats");
  if (serverError) return serverError;
  if (seats.value === null) return "Seats are required.";
  if (seats.value < 5) return "Seats must be at least 5.";
  return undefined;
});
const permissionsError = computed(() => {
  if (!showPermissionsIssue.value) return undefined;
  return getFieldError("permissions") || "Pick at least one permission bundle.";
});
const serverErrorItems = computed(() =>
  Object.entries(errors.value).flatMap(([field, value]) => {
    if (!value) return [];
    const messages = Array.isArray(value) ? value : [value];
    return messages.map((message) => ({ field, message }));
  }),
);
const liveIssues = computed(() => {
  const issues: string[] = [];
  if (!plan.value) issues.push("Plan is required.");
  if (seats.value === null || seats.value < 5) issues.push("Seats must be at least 5.");
  if (["admin", "root", "billing"].includes(workspaceSlug.value.toLowerCase())) {
    issues.push("Workspace slug is reserved.");
  }
  if (ownerEmail.value.toLowerCase() === "blocked@company.test") {
    issues.push("Email is blocked by the server rule.");
  }
  if (!permissions.value.length) issues.push("Pick at least one permission.");
  return issues;
});
const liveData = computed(() =>
  JSON.stringify(
    {
      ownerName: ownerName.value,
      ownerEmail: ownerEmail.value,
      workspaceSlug: workspaceSlug.value,
      plan: plan.value || "(missing)",
      seats: seats.value,
      riskScore: riskScore.value,
      permissions: permissions.value,
      billingLocked: billingLocked.value,
      submittedBillingFields: billingLocked.value
        ? "(disabled fieldset omitted from FormData)"
        : {
            billingName: billingName.value,
            billingEmail: billingEmail.value,
          },
    },
    null,
    2,
  ),
);

function clearError(name: string) {
  if (!errors.value[name]) return;
  const { [name]: _removed, ...rest } = errors.value;
  errors.value = rest;
}

function getFieldError(name: string) {
  const value = errors.value[name];
  if (!value) return "";
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value);
}

function markInteracted(name: string) {
  interactedFields.value = { ...interactedFields.value, [name]: true };
}

function onFieldValueChange(name: string) {
  markInteracted(name);
  clearError(name);
}

function shouldShowIssue(name: string) {
  return submitAttempted.value || Boolean(interactedFields.value[name]);
}

function onFormInvalid() {
  submitAttempted.value = true;
}

function onFormSubmit(values: FormValues, details: FormSubmitDetails) {
  submitAttempted.value = true;
  result.value = "";

  if (!details.valid) {
    result.value = "Native validation failed. Fix the highlighted fields and submit again.";
    return;
  }

  const nextErrors: FormErrors = {};
  const email = String(values.ownerEmail ?? "");
  const slug = String(values.workspaceSlug ?? "").toLowerCase();

  if (email.toLowerCase() === "blocked@company.test") {
    nextErrors.ownerEmail = "blocked@company.test is blocked by server-side validation.";
  }
  if (["admin", "root", "billing"].includes(slug)) {
    nextErrors.workspaceSlug = `${slug} is reserved. Pick a team-specific slug.`;
  }
  if (!values.permissions) {
    nextErrors.permissions = "Pick at least one permission bundle.";
  }

  errors.value = nextErrors;

  if (Object.keys(nextErrors).length) {
    result.value = "Server validation returned field errors.";
    return;
  }

  result.value = JSON.stringify(values, null, 2);
}
</script>

<template>
  <section class="border-b border-neutral-200 bg-background py-20 dark:border-white/10 sm:py-28">
    <div
      class="mx-auto grid w-full min-w-0 max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8"
    >
      <div class="min-w-0 max-w-xl">
        <h2
          class="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl"
        >
          Complete form behavior, in one example.
        </h2>
        <p class="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
          Native validation, server errors, disabled groups, custom controls, and nested fields work
          together in one real flow.
        </p>
        <div class="mt-7 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <h3 class="text-sm font-semibold text-neutral-950 dark:text-neutral-50">What to try</h3>
          <ul class="mt-3 grid gap-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            <li>Select a plan and raise seats to 5 or more to clear native validation.</li>
            <li>
              Use slug <code class="font-mono">admin</code>, <code class="font-mono">root</code>, or
              <code class="font-mono">billing</code> to see server errors.
            </li>
            <li>
              Use <code class="font-mono">blocked@company.test</code> to see an email server error.
              <code class="font-mono">ops@example.com</code> is valid.
            </li>
            <li>Unlock billing profile to see nested disabled controls enter FormData.</li>
          </ul>
        </div>

        <div class="mt-5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <h3 class="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Live checks</h3>
          <ul
            v-if="liveIssues.length"
            class="mt-3 grid gap-2 text-sm leading-6 text-amber-700 dark:text-amber-300"
          >
            <li v-for="issue in liveIssues" :key="issue">
              {{ issue }}
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
            No known client-side or demo server issues.
          </p>
        </div>

        <div class="mt-5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <h3 class="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Server errors</h3>
          <ul
            v-if="serverErrorItems.length"
            class="mt-3 grid gap-2 text-sm leading-6 text-red-700 dark:text-red-300"
          >
            <li v-for="item in serverErrorItems" :key="`${item.field}-${item.message}`">
              <span class="font-mono"> {{ item.field }} </span>
              : {{ item.message }}
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            None yet. Submit with reserved slug or blocked email to populate this.
          </p>
        </div>

        <div class="mt-5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <h3 class="text-sm font-semibold text-neutral-950 dark:text-neutral-50">Realtime data</h3>
          <pre
            class="mt-3 max-h-80 w-full min-w-0 max-w-full overflow-auto rounded-none bg-neutral-100 p-3 text-xs leading-5 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >{{ liveData }}</pre>
        </div>
      </div>

      <Form
        :errors="errors"
        class="grid min-w-0 gap-5 rounded-none border border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-black sm:p-6"
        @form-submit="onFormSubmit"
        @invalid.capture="onFormInvalid"
      >
        <Fieldset
          legend="Workspace request"
          description="Nested fields share one semantic group, but each control keeps its own label, hint, and error."
          :ui="fieldsetUi"
        >
          <div class="grid min-w-0 gap-4 md:grid-cols-2">
            <Field
              name="ownerName"
              label="Requester"
              description="Shown on the internal approval ticket."
              required
              :error="ownerNameError"
              :invalid="showOwnerNameIssue"
              :ui="fieldUi"
            >
              <Input
                v-model="ownerName"
                :class="inputClass"
                autocomplete="name"
                placeholder="Riya Shah"
                @blur="markInteracted('ownerName')"
                @value-change="onFieldValueChange('ownerName')"
              />
            </Field>

            <Field
              name="ownerEmail"
              label="Work email"
              description="ops@example.com is valid. Use blocked@company.test for a server error."
              required
              :error="ownerEmailError"
              :invalid="showOwnerEmailIssue"
              :ui="fieldUi"
            >
              <Input
                v-model="ownerEmail"
                type="email"
                :class="inputClass"
                autocomplete="email"
                placeholder="you@company.com"
                @blur="markInteracted('ownerEmail')"
                @value-change="onFieldValueChange('ownerEmail')"
              />
            </Field>
          </div>

          <div class="grid min-w-0 gap-4 md:grid-cols-3">
            <Field
              name="workspaceSlug"
              label="Workspace slug"
              description="Lowercase URL key. Server owns reserved words."
              required
              :error="workspaceSlugError"
              :invalid="showWorkspaceSlugIssue"
              :ui="fieldUi"
            >
              <Input
                v-model="workspaceSlug"
                :class="inputClass"
                pattern="[a-z0-9-]+"
                placeholder="support-team"
                @blur="markInteracted('workspaceSlug')"
                @value-change="onFieldValueChange('workspaceSlug')"
              />
            </Field>

            <Field
              name="plan"
              label="Plan"
              description="Required custom select with disabled option."
              required
              :error="planError"
              :invalid="showPlanIssue"
              :ui="fieldUi"
            >
              <Select
                v-model="plan"
                :options="planOptions"
                placeholder="Select plan"
                :ui="selectUi"
                @focusout="markInteracted('plan')"
                @value-change="onFieldValueChange('plan')"
              />
            </Field>

            <Field
              name="seats"
              label="Seats"
              description="Minimum 5. Initial value is intentionally invalid."
              required
              :error="seatsError"
              :invalid="showSeatsIssue"
              :ui="fieldUi"
            >
              <NumberField
                v-model="seats"
                :min="5"
                :max="250"
                :ui="numberUi"
                @focusout="markInteracted('seats')"
                @value-change="onFieldValueChange('seats')"
              />
            </Field>
          </div>

          <Field
            name="riskScore"
            :label="`Risk score: ${riskLabel}`"
            description="Slider still submits a native value with the form."
            :ui="fieldUi"
          >
            <Slider
              v-model="riskScore"
              :min="0"
              :max="100"
              name="riskScore"
              aria-label="Risk score"
              :ui="sliderUi"
            />
          </Field>
        </Fieldset>

        <Fieldset
          legend="Nested controls"
          description="Checkboxes, switch, and disabled fieldset live inside the same submit flow."
          :ui="fieldsetUi"
        >
          <Field
            name="permissions"
            label="Permission bundle"
            description="One disabled option is visible because real policy often leaks into forms."
            required
            :error="permissionsError"
            :invalid="showPermissionsIssue"
            :ui="fieldUi"
          >
            <CheckboxGroup
              v-model="permissions"
              name="permissions"
              required
              parent
              parent-label="Select all allowed permissions"
              :options="permissionOptions"
              :ui="checkboxGroupUi"
              @value-change="onFieldValueChange('permissions')"
            />
          </Field>

          <Switch
            v-model="billingLocked"
            name="billingLocked"
            label="Use locked billing profile"
            description="Turn this off to edit the nested billing fieldset. Disabled fields are omitted from FormData."
            :ui="switchUi"
          />

          <Fieldset
            legend="Billing profile"
            description="Disabled fieldset with nested Akaza fields and native inputs."
            :disabled="billingLocked"
            :ui="fieldsetUi"
          >
            <div class="grid min-w-0 gap-4 md:grid-cols-2">
              <Field
                name="billingName"
                label="Billing name"
                :disabled="billingLocked"
                :ui="fieldUi"
              >
                <Input v-model="billingName" :class="inputClass" />
              </Field>

              <Field
                name="billingEmail"
                label="Billing email"
                :disabled="billingLocked"
                :ui="fieldUi"
              >
                <Input v-model="billingEmail" type="email" :class="inputClass" />
              </Field>
            </div>
          </Fieldset>
        </Fieldset>

        <div
          class="grid min-w-0 gap-3 border-t border-neutral-200 pt-5 dark:border-neutral-800 sm:grid-cols-[auto_1fr] sm:items-start"
        >
          <Button
            type="submit"
            class="h-10 rounded-none bg-neutral-950 px-4 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:bg-white dark:text-neutral-950 dark:focus-visible:ring-white"
          >
            Submit form
          </Button>

          <pre
            class="max-h-44 w-full min-w-0 max-w-full overflow-auto rounded-none bg-neutral-100 p-3 text-xs leading-5 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >{{ result }}</pre>
        </div>
      </Form>
    </div>
  </section>
</template>
