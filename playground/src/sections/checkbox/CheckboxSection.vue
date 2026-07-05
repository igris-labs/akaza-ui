<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "akaza-ui";
import type { CheckboxValue, AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  buttonPrimary,
  canvasCol,
  canvasRow,
  checkboxCustomUi,
  checkboxLabelBold,
  checkboxLabelMuted,
  checkboxUi,
  codePill,
  eventEntry,
  eventLog,
  inlineCode,
  linkInline,
  sectionDescription,
  sectionTitle,
} from "../styles";

// ── 1. States ────────────────────────────────────────────────────────────────
const checked = ref<CheckboxValue>(false);

// ── 2. Indeterminate (controlled) ────────────────────────────────────────────
const parentChecked = ref<CheckboxValue>("indeterminate");
const childA = ref<CheckboxValue>(false);
const childB = ref<CheckboxValue>(true);

function syncParent() {
  if (childA.value && childB.value) parentChecked.value = true;
  else if (!childA.value && !childB.value) parentChecked.value = false;
  else parentChecked.value = "indeterminate";
}
function syncChildren(val: CheckboxValue) {
  childA.value = val === "indeterminate" ? false : val;
  childB.value = val === "indeterminate" ? false : val;
  syncParent();
}

// ── 3. label + description props ─────────────────────────────────────────────
const newsletter = ref<CheckboxValue>(false);
const marketing = ref<CheckboxValue>(false);

// ── 4. #label / #description slots ──────────────────────────────────────────
const termsChecked = ref<CheckboxValue>(false);

// ── 5. trueValue / falseValue ────────────────────────────────────────────────
const permission = ref("none");

// ── 6. Form submission (name + required) ─────────────────────────────────────
const formMsg = ref("");
function handleSubmit(e: Event) {
  e.preventDefault();
  const fd = new FormData(e.target as HTMLFormElement);
  formMsg.value = `agree = "${fd.get("agree") ?? "(not submitted)"}"`;
  setTimeout(() => (formMsg.value = ""), 3000);
}

// ── 7. ui prop ───────────────────────────────────────────────────────────────
const uiChecked = ref<CheckboxValue>(false);

// ── 8. @value-change event details ──────────────────────────────────────────
const eventChecked = ref<CheckboxValue>(false);
const cbLog = ref<string[]>([]);
function onCheckboxChange(value: CheckboxValue, details: AkazaChangeEventDetails) {
  cbLog.value = [`→ ${value} — reason: ${details.reason}`, ...cbLog.value].slice(0, 5);
}
</script>

<template>
  <section id="checkbox">
    <h2 :class="sectionTitle">Checkbox</h2>
    <p :class="sectionDescription">
      Tri-state checkbox with form support, custom values, label/description slots,
      and ui-prop class overrides.
    </p>

    <!-- ── 1. States ──────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">States</span>
        <span class="text-xs text-muted-foreground">
          Three states: <code :class="inlineCode">false</code> (unchecked), <code :class="inlineCode">true</code> (checked),
          <code :class="inlineCode">"indeterminate"</code>. Use the cycle button to step through them.
        </span>
      </div>
      <div :class="canvasRow">
        <Checkbox
          v-model="checked"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator }"
        >
          <template #indicator="{ checked: val }">
            <svg v-if="val === true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="val === 'indeterminate'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </template>
        </Checkbox>
        <button
          type="button"
          :class="buttonGhost"
          @click="checked = checked === false ? true : checked === true ? 'indeterminate' : false"
        >
          Cycle state
        </button>
        <code :class="codePill">{{ checked }}</code>
      </div>
    </div>

    <!-- ── 2. Indeterminate — select all pattern ──────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Indeterminate — select all</span>
        <span class="text-xs text-muted-foreground">
          Set the parent to <code :class="inlineCode">"indeterminate"</code> when children are partially checked.
          Toggling the parent programmatically syncs all children.
        </span>
      </div>
      <div :class="canvasCol">
        <!-- Parent -->
        <Checkbox
          v-model="parentChecked"
          label="Select all"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxLabelBold }"
          @update:model-value="syncChildren"
        >
          <template #indicator="{ checked: val }">
            <svg v-if="val === true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="val === 'indeterminate'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </template>
        </Checkbox>
        <!-- Children -->
        <div class="grid gap-2 pl-7">
          <Checkbox
            v-model="childA"
            label="Option A"
            :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxUi.label }"
            @update:model-value="syncParent"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
          <Checkbox
            v-model="childB"
            label="Option B"
            :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxUi.label }"
            @update:model-value="syncParent"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
        </div>
      </div>
    </div>

    <!-- ── 3. label + description props ──────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">label + description props</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">label</code> and <code :class="inlineCode">description</code> for zero-slot usage.
          ARIA linking is handled automatically.
        </span>
      </div>
      <div :class="canvasCol">
        <Checkbox
          v-model="newsletter"
          label="Newsletter"
          description="Receive weekly product updates and announcements."
          :ui="checkboxUi"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <Checkbox
          v-model="marketing"
          label="Marketing emails"
          description="Occasional offers and promotions. Unsubscribe any time."
          :ui="checkboxUi"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 4. #label / #description slots ────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">#label and #description slots</span>
        <span class="text-xs text-muted-foreground">
          Use slots when the label or description needs rich markup — links, badges, formatting.
          Slots take priority over props.
        </span>
      </div>
      <div :class="canvasRow">
        <Checkbox
          v-model="termsChecked"
          :ui="checkboxUi"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          <template #label>
            I agree to the
            <a href="#checkbox" :class="linkInline">Terms of Service</a>
            and
            <a href="#checkbox" :class="linkInline">Privacy Policy</a>
          </template>
          <template #description>
            You must be 18 or older to create an account.
          </template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 5. trueValue / falseValue ─────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">trueValue / falseValue</span>
        <span class="text-xs text-muted-foreground">
          Store custom values instead of <code :class="inlineCode">true</code>/<code :class="inlineCode">false</code>.
          Useful when the model is driven by a string enum or number flag.
        </span>
      </div>
      <div :class="canvasRow">
        <Checkbox
          v-model="permission"
          true-value="admin"
          false-value="none"
          label="Admin access"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxUi.label }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <code :class="codePill">{{ permission }}</code>
      </div>
    </div>

    <!-- ── 6. Form submission (name + required) ───────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Form submission (name + required)</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">name</code> to render a hidden native <code :class="inlineCode">&lt;input type="checkbox"&gt;</code>
          for real form submission. Add <code :class="inlineCode">required</code> for browser validation.
        </span>
      </div>
      <div :class="canvasCol">
        <form class="grid gap-3" @submit="handleSubmit">
          <Checkbox
            name="agree"
            required
            label="I agree to the terms"
            description="Required to continue."
            :ui="checkboxUi"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
          <button type="submit" :class="buttonPrimary">Submit form</button>
        </form>
        <p v-if="formMsg" class="font-mono text-xs text-primary">{{ formMsg }}</p>
      </div>
    </div>

    <!-- ── 7. Disabled ────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Disabled</span>
        <span class="text-xs text-muted-foreground">
          The <code :class="inlineCode">disabled</code> prop sets <code :class="inlineCode">aria-disabled</code>, blocks interaction,
          and adds <code :class="inlineCode">data-akaza-disabled</code> for CSS targeting.
        </span>
      </div>
      <div :class="canvasCol">
        <Checkbox
          :model-value="false"
          disabled
          label="Disabled unchecked"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxLabelMuted, wrapper: 'opacity-50' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <Checkbox
          :model-value="true"
          disabled
          label="Disabled checked"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxLabelMuted, wrapper: 'opacity-50' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 8. @value-change event details ─────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">@value-change event details</span>
        <span class="text-xs text-muted-foreground">
          Listen to <code :class="inlineCode">@value-change</code> to inspect <code :class="inlineCode">reason</code> (<code :class="inlineCode">"click"</code> or <code :class="inlineCode">"keyboard"</code>)
          and optionally call <code :class="inlineCode">details.cancel()</code> to prevent the change.
        </span>
      </div>
      <div :class="canvasCol">
        <Checkbox
          v-model="eventChecked"
          label="Toggle me (click or Space)"
          :ui="{ root: checkboxUi.root, indicator: checkboxUi.indicator, label: checkboxUi.label }"
          @value-change="onCheckboxChange"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <div v-if="cbLog.length" :class="eventLog">
          <code v-for="(entry, i) in cbLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- ── 9. ui prop ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">ui prop</span>
        <span class="text-xs text-muted-foreground">
          Pass classes to <code :class="inlineCode">wrapper</code>, <code :class="inlineCode">root</code>, <code :class="inlineCode">indicator</code>,
          <code :class="inlineCode">label</code>, and <code :class="inlineCode">description</code> to style every part
          without touching the slots.
        </span>
      </div>
      <div :class="canvasRow">
        <Checkbox
          v-model="uiChecked"
          label="Custom styled"
          description="All parts styled via the ui prop."
          :ui="checkboxCustomUi"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>
  </section>
</template>
