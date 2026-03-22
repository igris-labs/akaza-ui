<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "akaza-ui";
import type { CheckboxValue } from "akaza-ui";

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
</script>

<template>
  <section id="checkbox">
    <h2 class="text-lg font-semibold mb-1">Checkbox</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Tri-state checkbox with form support, custom values, label/description slots,
      and ui-prop class overrides.
    </p>

    <!-- ── 1. States ──────────────────────────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">States</span>
        <span class="cb-demo-label-desc">
          Three states: <code>false</code> (unchecked), <code>true</code> (checked),
          <code>"indeterminate"</code>. Use the cycle button to step through them.
        </span>
      </div>
      <div class="cb-demo-canvas">
        <Checkbox
          v-model="checked"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator' }"
        >
          <template #indicator="{ checked: val }">
            <svg v-if="val === true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="val === 'indeterminate'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </template>
        </Checkbox>
        <button
          class="cb-cycle-btn"
          @click="checked = checked === false ? true : checked === true ? 'indeterminate' : false"
        >
          Cycle state
        </button>
        <code class="cb-state-badge">{{ checked }}</code>
      </div>
    </div>

    <!-- ── 2. Indeterminate — select all pattern ──────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">Indeterminate — select all</span>
        <span class="cb-demo-label-desc">
          Set the parent to <code>"indeterminate"</code> when children are partially checked.
          Toggling the parent programmatically syncs all children.
        </span>
      </div>
      <div class="cb-demo-canvas cb-demo-canvas--col">
        <!-- Parent -->
        <Checkbox
          v-model="parentChecked"
          label="Select all"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label cb-label--bold' }"
          @update:model-value="syncChildren"
        >
          <template #indicator="{ checked: val }">
            <svg v-if="val === true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="val === 'indeterminate'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </template>
        </Checkbox>
        <!-- Children -->
        <div class="cb-children">
          <Checkbox
            v-model="childA"
            label="Option A"
            :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label' }"
            @update:model-value="syncParent"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
          <Checkbox
            v-model="childB"
            label="Option B"
            :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label' }"
            @update:model-value="syncParent"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
        </div>
      </div>
    </div>

    <!-- ── 3. label + description props ──────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">label + description props</span>
        <span class="cb-demo-label-desc">
          Pass <code>label</code> and <code>description</code> for zero-slot usage.
          ARIA linking is handled automatically.
        </span>
      </div>
      <div class="cb-demo-canvas cb-demo-canvas--col">
        <Checkbox
          v-model="newsletter"
          label="Newsletter"
          description="Receive weekly product updates and announcements."
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label', description: 'cb-description' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <Checkbox
          v-model="marketing"
          label="Marketing emails"
          description="Occasional offers and promotions. Unsubscribe any time."
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label', description: 'cb-description' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 4. #label / #description slots ────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">#label and #description slots</span>
        <span class="cb-demo-label-desc">
          Use slots when the label or description needs rich markup — links, badges, formatting.
          Slots take priority over props.
        </span>
      </div>
      <div class="cb-demo-canvas">
        <Checkbox
          v-model="termsChecked"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label', description: 'cb-description' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          <template #label>
            I agree to the
            <a href="#checkbox" class="cb-link">Terms of Service</a>
            and
            <a href="#checkbox" class="cb-link">Privacy Policy</a>
          </template>
          <template #description>
            You must be 18 or older to create an account.
          </template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 5. trueValue / falseValue ─────────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">trueValue / falseValue</span>
        <span class="cb-demo-label-desc">
          Store custom values instead of <code>true</code>/<code>false</code>.
          Useful when the model is driven by a string enum or number flag.
        </span>
      </div>
      <div class="cb-demo-canvas">
        <Checkbox
          v-model="permission"
          true-value="admin"
          false-value="none"
          label="Admin access"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <code class="cb-state-badge">{{ permission }}</code>
      </div>
    </div>

    <!-- ── 6. Form submission (name + required) ───────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">Form submission (name + required)</span>
        <span class="cb-demo-label-desc">
          Pass <code>name</code> to render a hidden native <code>&lt;input type="checkbox"&gt;</code>
          for real form submission. Add <code>required</code> for browser validation.
        </span>
      </div>
      <div class="cb-demo-canvas cb-demo-canvas--col">
        <form class="cb-form" @submit="handleSubmit">
          <Checkbox
            name="agree"
            required
            label="I agree to the terms"
            description="Required to continue."
            :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label', description: 'cb-description' }"
          >
            <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
          </Checkbox>
          <button type="submit" class="cb-submit-btn">Submit form</button>
        </form>
        <p v-if="formMsg" class="cb-form-result">{{ formMsg }}</p>
      </div>
    </div>

    <!-- ── 7. Disabled ────────────────────────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">Disabled</span>
        <span class="cb-demo-label-desc">
          The <code>disabled</code> prop sets <code>aria-disabled</code>, blocks interaction,
          and adds <code>data-akaza-disabled</code> for CSS targeting.
        </span>
      </div>
      <div class="cb-demo-canvas cb-demo-canvas--col">
        <Checkbox
          :model-value="false"
          disabled
          label="Disabled unchecked"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label cb-label--muted', wrapper: 'cb-wrapper--disabled' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
        <Checkbox
          :model-value="true"
          disabled
          label="Disabled checked"
          :ui="{ root: 'cb-box', indicator: 'cb-indicator', label: 'cb-label cb-label--muted', wrapper: 'cb-wrapper--disabled' }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>

    <!-- ── 8. ui prop ─────────────────────────────────────────────────────── -->
    <div class="cb-demo-block">
      <div class="cb-demo-label">
        <span class="cb-demo-label-title">ui prop</span>
        <span class="cb-demo-label-desc">
          Pass classes to <code>wrapper</code>, <code>root</code>, <code>indicator</code>,
          <code>label</code>, and <code>description</code> to style every part
          without touching the slots.
        </span>
      </div>
      <div class="cb-demo-canvas">
        <Checkbox
          v-model="uiChecked"
          label="Custom styled"
          description="All parts styled via the ui prop."
          :ui="{
            wrapper: 'cb-ui-wrapper',
            root: 'cb-ui-box',
            indicator: 'cb-ui-indicator',
            label: 'cb-ui-label',
            description: 'cb-ui-description',
          }"
        >
          <template #indicator><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></template>
        </Checkbox>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Shared checkbox box ─────────────────────────────────────────────────── */
.cb-box {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--border);
  background: var(--background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  padding: 0;
  flex-shrink: 0;
}

.cb-box:focus:not(:focus-visible) { outline: none; }
.cb-box:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.cb-box[data-akaza-state="checked"],
.cb-box[data-akaza-state="indeterminate"] {
  background: var(--primary);
  border-color: var(--primary);
}

.cb-box[data-akaza-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.cb-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-foreground);
  line-height: 1;
}

/* ── Text parts ──────────────────────────────────────────────────────────── */
.cb-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--foreground);
  line-height: 1.4;
  cursor: pointer;
}

.cb-label--bold {
  font-weight: 600;
}

.cb-label--muted {
  color: var(--muted-foreground);
}

.cb-description {
  font-size: 12px;
  color: var(--muted-foreground);
  line-height: 1.4;
}

.cb-link {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Disabled wrapper ────────────────────────────────────────────────────── */
.cb-wrapper--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── ui prop example ─────────────────────────────────────────────────────── */
.cb-ui-wrapper {
  gap: 10px;
  background: color-mix(in srgb, var(--primary) 6%, var(--background));
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
}

.cb-ui-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--primary);
  background: var(--background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s;
  flex-shrink: 0;
}

.cb-ui-box:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.cb-ui-box[data-akaza-state="checked"] {
  background: var(--primary);
}

.cb-ui-indicator {
  color: var(--primary-foreground);
  display: flex;
}

.cb-ui-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.cb-ui-description {
  font-size: 11px;
  color: var(--muted-foreground);
}

/* ── Indeterminate children indent ───────────────────────────────────────── */
.cb-children {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 26px;
}

/* ── State badge ─────────────────────────────────────────────────────────── */
.cb-state-badge {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 2px 6px;
  border-radius: 4px;
}

/* ── Cycle button ────────────────────────────────────────────────────────── */
.cb-cycle-btn {
  font-size: 12px;
  color: var(--muted-foreground);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.cb-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cb-submit-btn {
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.cb-submit-btn:hover { opacity: 0.88; }

.cb-form-result {
  font-size: 12px;
  color: var(--primary);
  font-family: monospace;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.cb-demo-block { margin-bottom: 32px; }

.cb-demo-label { margin-bottom: 12px; }

.cb-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.cb-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.cb-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.cb-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: center;
  gap: 16px;
}

.cb-demo-canvas--col {
  flex-direction: column;
  align-items: flex-start;
}
</style>
