<script setup lang="ts">
import { ref } from "vue";
import { Button } from "akaza-ui";

// ── 3. Manual loading ────────────────────────────────────────────────────────
const isLoading = ref(false);
function simulateLoad() {
  isLoading.value = true;
  setTimeout(() => (isLoading.value = false), 2000);
}

// ── 4. loadingAuto — resolves ────────────────────────────────────────────────
async function asyncSave() {
  await new Promise<void>((res) => setTimeout(res, 2000));
}

// ── 5. loadingAuto — rejects (loading still clears) ──────────────────────────
async function asyncFail() {
  await new Promise<void>((_, rej) => setTimeout(rej, 2000));
}

// ── 6. type=submit inside a form ─────────────────────────────────────────────
const formResult = ref("");
function handleSubmit(e: Event) {
  e.preventDefault();
  formResult.value = "Form submitted!";
  setTimeout(() => (formResult.value = ""), 2000);
}
</script>

<template>
  <section id="button">
    <h2 class="text-lg font-semibold mb-1">Button</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Polymorphic button with disabled state, focusable-when-disabled, manual and
      auto loading, form type support, and a custom loading slot.
    </p>

    <!-- ── 1. States ──────────────────────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">States</span>
        <span class="btn-demo-label-desc">
          <code>disabled</code> blocks interaction and sets <code>aria-disabled</code>.
          <code>focusable-when-disabled</code> keeps the button in the tab order while still
          blocking clicks — useful for showing tooltips on disabled controls.
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button class="btn btn--primary">Enabled</Button>

        <Button disabled class="btn btn--primary btn--disabled">
          Disabled
        </Button>

        <Button disabled focusable-when-disabled class="btn btn--ghost btn--disabled">
          Focusable + disabled (Tab here)
        </Button>
      </div>
    </div>

    <!-- ── 2. data-akaza-state ────────────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">data-akaza-state attribute</span>
        <span class="btn-demo-label-desc">
          The root element always carries <code>data-akaza-state</code> set to
          <code>"enabled"</code>, <code>"disabled"</code>, or <code>"loading"</code>.
          Use it in CSS for state-driven styling without JS.
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button class="btn btn--state-demo">Enabled</Button>
        <Button disabled class="btn btn--state-demo">Disabled</Button>
        <Button :loading="true" class="btn btn--state-demo">
          <template #loading><span class="btn-spinner" />Loading</template>
        </Button>
      </div>
    </div>

    <!-- ── 3. Manual loading ──────────────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">Manual loading</span>
        <span class="btn-demo-label-desc">
          Bind <code>:loading</code> to control the state externally. When loading,
          the default slot is replaced by <code>#loading</code> (built-in spinner by default).
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button
          :loading="isLoading"
          class="btn btn--primary btn--icon-gap"
          @click="simulateLoad"
        >
          Save (2s)
        </Button>
      </div>
    </div>

    <!-- ── 4. Custom #loading slot ────────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">Custom #loading slot</span>
        <span class="btn-demo-label-desc">
          Replace the built-in spinner entirely. The <code>#loading</code> slot renders
          in place of <code>#default</code> while loading — you control the full content.
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button
          :loading="isLoading"
          class="btn btn--ghost btn--icon-gap"
          @click="simulateLoad"
        >
          Upload file
          <template #loading>
            <svg class="btn-spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Uploading…
          </template>
        </Button>
      </div>
    </div>

    <!-- ── 5. loadingAuto — resolves ─────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">loadingAuto (resolves)</span>
        <span class="btn-demo-label-desc">
          Pass <code>loading-auto</code> + <code>:on-click</code> with an async function.
          The button automatically enters loading state while the Promise is pending and
          clears it when the Promise settles — no external ref needed.
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button
          loading-auto
          :on-click="asyncSave"
          class="btn btn--primary btn--icon-gap"
        >
          Auto save (2s)
        </Button>
      </div>
    </div>

    <!-- ── 6. loadingAuto — rejects ───────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">loadingAuto (rejects)</span>
        <span class="btn-demo-label-desc">
          If the Promise rejects, the loading state still clears correctly.
          Error handling is left to the caller — the button stays usable.
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button
          loading-auto
          :on-click="asyncFail"
          class="btn btn--destructive btn--icon-gap"
        >
          Delete (fails after 2s)
        </Button>
      </div>
    </div>

    <!-- ── 7. type prop (submit / reset) ─────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">type prop</span>
        <span class="btn-demo-label-desc">
          <code>type="submit"</code> and <code>type="reset"</code> work as native form
          buttons. The <code>type</code> attribute is only set when <code>as="button"</code>.
        </span>
      </div>
      <div class="btn-demo-canvas btn-demo-canvas--col">
        <form class="btn-form" @submit="handleSubmit">
          <input class="btn-input" type="text" placeholder="Type something…" />
          <div class="btn-form-actions">
            <Button type="reset" class="btn btn--ghost">Reset</Button>
            <Button type="submit" class="btn btn--primary">Submit</Button>
          </div>
        </form>
        <p v-if="formResult" class="btn-form-result">{{ formResult }}</p>
      </div>
    </div>

    <!-- ── 8. Polymorphic ─────────────────────────────────────────────────── -->
    <div class="btn-demo-block">
      <div class="btn-demo-label">
        <span class="btn-demo-label-title">Polymorphic (as prop)</span>
        <span class="btn-demo-label-desc">
          Render as any element. <code>as="a"</code> produces a link with full disabled/loading
          ARIA support. <code>as="div"</code> makes a non-button interactive element
          (remember to add keyboard handling yourself).
        </span>
      </div>
      <div class="btn-demo-canvas">
        <Button as="a" href="#button" class="btn btn--link">
          As &lt;a&gt; (scrolls to top)
        </Button>

        <Button as="div" role="button" tabindex="0" class="btn btn--ghost">
          As &lt;div&gt;
        </Button>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Button base ─────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s, background 0.15s;
  white-space: nowrap;
}

.btn--icon-gap {
  gap: 6px;
}

/* ── Variants ────────────────────────────────────────────────────────────── */
.btn--primary {
  background: var(--primary);
  color: var(--primary-foreground);
}
.btn--primary:hover:not([data-akaza-disabled]):not([data-akaza-loading]) {
  opacity: 0.88;
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--foreground);
}
.btn--ghost:hover:not([data-akaza-disabled]):not([data-akaza-loading]) {
  background: var(--muted);
}

.btn--destructive {
  background: var(--destructive);
  color: #fff;
}
.btn--destructive:hover:not([data-akaza-disabled]):not([data-akaza-loading]) {
  opacity: 0.88;
}

.btn--link {
  background: none;
  color: var(--primary);
  padding-left: 0;
  padding-right: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Disabled ────────────────────────────────────────────────────────────── */
.btn--disabled,
.btn[data-akaza-disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Loading ─────────────────────────────────────────────────────────────── */
.btn[data-akaza-loading] {
  cursor: wait;
  opacity: 0.75;
}

.btn-spinner {
  animation: btn-spin 0.75s linear infinite;
  flex-shrink: 0;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

/* ── data-akaza-state demo ───────────────────────────────────────────────── */
.btn--state-demo {
  background: var(--muted);
  color: var(--foreground);
  border: 1px solid var(--border);
  gap: 6px;
}
.btn--state-demo[data-akaza-state="disabled"] {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn--state-demo[data-akaza-state="loading"] {
  opacity: 0.7;
  cursor: wait;
  border-color: var(--primary);
  color: var(--primary);
}

/* ── Form example ────────────────────────────────────────────────────────── */
.btn-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 320px;
}

.btn-input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  font-size: 13px;
  outline: none;
}

.btn-input:focus {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}

.btn-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-form-result {
  font-size: 12px;
  color: var(--primary);
  margin-top: 4px;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.btn-demo-block {
  margin-bottom: 32px;
}

.btn-demo-label {
  margin-bottom: 12px;
}

.btn-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.btn-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.btn-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.btn-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-demo-canvas--col {
  flex-direction: column;
  align-items: flex-start;
}
</style>
