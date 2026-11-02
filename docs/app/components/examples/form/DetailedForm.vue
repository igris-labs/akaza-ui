<script setup lang="ts">
import type {
  CheckboxGroupOption,
  FormErrors,
  FormSubmitDetails,
  FormValues,
  SelectOption,
} from "akaza-ui";
import { computed, ref } from "vue";
import { Button } from "../../ui/button";
import { CheckboxGroup } from "../../ui/checkbox-group";
import { Field } from "../../ui/field";
import { Fieldset } from "../../ui/fieldset";
import { Form } from "../../ui/form";
import { Input } from "../../ui/input";
import { NumberField } from "../../ui/number-field";
import { Select } from "../../ui/select";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";

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
    !workspaceSlugPattern.test(workspaceSlug.value) ||
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
  const slug = workspaceSlug.value;
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
  if (!workspaceSlugPattern.test(workspaceSlug.value)) {
    issues.push("Use lowercase letters, numbers, and hyphens for the workspace slug.");
  } else if (["admin", "root", "billing"].includes(workspaceSlug.value)) {
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
  const slug = String(values.workspaceSlug ?? "");

  if (email.toLowerCase() === "blocked@company.test") {
    nextErrors.ownerEmail = "blocked@company.test is blocked by server-side validation.";
  }
  if (!workspaceSlugPattern.test(slug)) {
    nextErrors.workspaceSlug = "Use lowercase letters, numbers, and hyphens only.";
  } else if (["admin", "root", "billing"].includes(slug)) {
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
  <section class="bg-background">
    <div class="mx-auto grid w-full min-w-0 max-w-none gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div class="min-w-0 max-w-xl">
        <h2 class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Complete form behavior, in one example.
        </h2>
        <p class="mt-4 text-base leading-7 text-muted-foreground">
          Native validation, server errors, disabled groups, custom controls, and nested fields work
          together in one real flow.
        </p>
        <div class="mt-7 border-t border-border pt-5">
          <h3 class="text-sm font-semibold text-foreground">What to try</h3>
          <ul class="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
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

        <div class="mt-5 border-t border-border pt-5">
          <h3 class="text-sm font-semibold text-foreground">Live checks</h3>
          <ul
            v-if="liveIssues.length"
            class="mt-3 grid gap-2 text-sm leading-6 text-warning"
          >
            <li
              v-for="issue in liveIssues"
              :key="issue"
            >
              {{ issue }}
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-emerald-700 dark:text-emerald-300"
          >
            No known client-side or demo server issues.
          </p>
        </div>

        <div class="mt-5 border-t border-border pt-5">
          <h3 class="text-sm font-semibold text-foreground">Server errors</h3>
          <ul
            v-if="serverErrorItems.length"
            class="mt-3 grid gap-2 text-sm leading-6 text-destructive"
          >
            <li
              v-for="item in serverErrorItems"
              :key="`${item.field}-${item.message}`"
            >
              <span class="font-mono"> {{ item.field }} </span>
              : {{ item.message }}
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-muted-foreground"
          >
            None yet. Submit with reserved slug or blocked email to populate this.
          </p>
        </div>

        <div class="mt-5 border-t border-border pt-5">
          <h3 class="text-sm font-semibold text-foreground">Realtime data</h3>
          <pre
            tabindex="0"
            aria-label="Live form values"
            class="mt-3 max-h-80 w-full min-w-0 max-w-full overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-6 text-muted-foreground"
          >{{ liveData }}</pre>
        </div>
      </div>

      <Form
        :errors="errors"
        class="grid min-w-0 gap-8 rounded-xl border border-border/60 bg-card p-5 sm:p-8"
        @form-submit="onFormSubmit"
        @invalid.capture="onFormInvalid"
      >
        <Fieldset
          legend="Workspace request"
          description="Nested fields share one semantic group, but each control keeps its own label, hint, and error."
        >
          <div class="grid min-w-0 gap-4 md:grid-cols-2">
            <Field
              name="ownerName"
              label="Requester"
              description="Shown on the internal approval ticket."
              required
              :error="ownerNameError"
              :invalid="showOwnerNameIssue"
            >
              <Input
                v-model="ownerName"
                size="md"
                autocomplete="name"
                placeholder="John Doe"
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
            >
              <Input
                v-model="ownerEmail"
                size="md"
                type="email"
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
            >
              <Input
                v-model="workspaceSlug"
                size="md"
                pattern="[a-z0-9\-]+"
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
            >
              <Select
                v-model="plan"
                class="w-full"
                size="md"
                :options="planOptions"
                placeholder="Select plan"
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
            >
              <NumberField
                v-model="seats"
                class="w-full"
                size="md"
                :min="5"
                :max="250"
                @focusout="markInteracted('seats')"
                @value-change="onFieldValueChange('seats')"
              />
            </Field>
          </div>

          <Field
            name="riskScore"
            :label="`Risk score: ${riskLabel}`"
            description="Slider still submits a native value with the form."
          >
            <Slider
              v-model="riskScore"
              size="md"
              :min="0"
              :max="100"
              name="riskScore"
              aria-label="Risk score"
            />
          </Field>
        </Fieldset>

        <Fieldset
          legend="Nested controls"
          description="Checkboxes, switch, and disabled fieldset live inside the same submit flow."
        >
          <Field
            name="permissions"
            label="Permission bundle"
            description="One disabled option is visible because real policy often leaks into forms."
            required
            :error="permissionsError"
            :invalid="showPermissionsIssue"
          >
            <!-- Required validation belongs to the native input; group does not support aria-required. -->
            <CheckboxGroup
              v-model="permissions"
              size="md"
              :aria-required="undefined"
              name="permissions"
              required
              parent
              parent-label="Select all allowed permissions"
              :options="permissionOptions"
              @value-change="onFieldValueChange('permissions')"
            />
          </Field>

          <Switch
            v-model="billingLocked"
            size="md"
            name="billingLocked"
            label="Use locked billing profile"
            description="Turn this off to edit the nested billing fieldset. Disabled fields are omitted from FormData."
          />

          <Fieldset
            legend="Billing profile"
            description="Disabled fieldset with nested Akaza fields and native inputs."
            :disabled="billingLocked"
          >
            <div class="grid min-w-0 gap-4 md:grid-cols-2">
              <Field
                name="billingName"
                label="Billing name"
                :disabled="billingLocked"
              >
                <Input
                  v-model="billingName"
                  size="md"
                />
              </Field>

              <Field
                name="billingEmail"
                label="Billing email"
                :disabled="billingLocked"
              >
                <Input
                  v-model="billingEmail"
                  size="md"
                  type="email"
                />
              </Field>
            </div>
          </Fieldset>
        </Fieldset>

        <div
          class="grid min-w-0 gap-3 border-t border-border pt-5 sm:grid-cols-[auto_1fr] sm:items-start"
        >
          <Button
            type="submit"
            size="md"
          >
            Submit form
          </Button>

          <pre
            tabindex="0"
            aria-label="Form submission result"
            class="max-h-44 w-full min-w-0 max-w-full overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-6 text-muted-foreground"
          >{{ result }}</pre>
        </div>
      </Form>
    </div>
  </section>
</template>
