<script setup lang="ts">
import { ref } from "vue";
import { Button } from "akaza-ui";
import {
  buttonDestructive,
  buttonGhost,
  buttonLink,
  buttonPrimary,
  canvasCol,
  canvasRow,
  inlineCode,
  inputControl,
  sectionDescription,
  sectionTitle,
} from "../styles";

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
    <h2 :class="sectionTitle">Button</h2>
    <p :class="sectionDescription">
      Polymorphic button with disabled state, focusable-when-disabled, manual and
      auto loading, form type support, and a custom loading slot.
    </p>

    <!-- ── 1. States ──────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">States</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">disabled</code> blocks interaction and sets <code :class="inlineCode">aria-disabled</code>.
          <code :class="inlineCode">focusable-when-disabled</code> keeps the button in the tab order while still
          blocking clicks — useful for showing tooltips on disabled controls.
        </span>
      </div>
      <div :class="canvasRow">
        <Button :class="buttonPrimary">Enabled</Button>

        <Button disabled :class="buttonPrimary">
          Disabled
        </Button>

        <Button disabled focusable-when-disabled :class="buttonGhost">
          Focusable + disabled (Tab here)
        </Button>
      </div>
    </div>

    <!-- ── 2. data-akaza-state ────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">data-akaza-state attribute</span>
        <span class="text-xs text-muted-foreground">
          The root element always carries <code :class="inlineCode">data-akaza-state</code> set to
          <code :class="inlineCode">"enabled"</code>, <code :class="inlineCode">"disabled"</code>, or <code :class="inlineCode">"loading"</code>.
          Use it in CSS for state-driven styling without JS.
        </span>
      </div>
      <div :class="canvasRow">
        <Button :class="buttonGhost">Enabled</Button>
        <Button disabled :class="buttonGhost">Disabled</Button>
        <Button :loading="true" :class="buttonGhost">
          <template #loading>
            <svg class="size-3.5 animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Loading
          </template>
        </Button>
      </div>
    </div>

    <!-- ── 3. Manual loading ──────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Manual loading</span>
        <span class="text-xs text-muted-foreground">
          Bind <code :class="inlineCode">:loading</code> to control the state externally. When loading,
          the default slot is replaced by <code :class="inlineCode">#loading</code> (built-in spinner by default).
        </span>
      </div>
      <div :class="canvasRow">
        <Button
          :loading="isLoading"
          :class="buttonPrimary"
          @click="simulateLoad"
        >
          Save (2s)
        </Button>
      </div>
    </div>

    <!-- ── 4. Custom #loading slot ────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Custom #loading slot</span>
        <span class="text-xs text-muted-foreground">
          Replace the built-in spinner entirely. The <code :class="inlineCode">#loading</code> slot renders
          in place of <code :class="inlineCode">#default</code> while loading — you control the full content.
        </span>
      </div>
      <div :class="canvasRow">
        <Button
          :loading="isLoading"
          :class="buttonGhost"
          @click="simulateLoad"
        >
          Upload file
          <template #loading>
            <svg class="size-3.5 animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Uploading…
          </template>
        </Button>
      </div>
    </div>

    <!-- ── 5. loadingAuto — resolves ─────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">loadingAuto (resolves)</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">loading-auto</code> + <code :class="inlineCode">:on-click</code> with an async function.
          The button automatically enters loading state while the Promise is pending and
          clears it when the Promise settles — no external ref needed.
        </span>
      </div>
      <div :class="canvasRow">
        <Button
          loading-auto
          :on-click="asyncSave"
          :class="buttonPrimary"
        >
          Auto save (2s)
        </Button>
      </div>
    </div>

    <!-- ── 6. loadingAuto — rejects ───────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">loadingAuto (rejects)</span>
        <span class="text-xs text-muted-foreground">
          If the Promise rejects, the loading state still clears correctly.
          Error handling is left to the caller — the button stays usable.
        </span>
      </div>
      <div :class="canvasRow">
        <Button
          loading-auto
          :on-click="asyncFail"
          :class="buttonDestructive"
        >
          Delete (fails after 2s)
        </Button>
      </div>
    </div>

    <!-- ── 7. type prop (submit / reset) ─────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">type prop</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">type="submit"</code> and <code :class="inlineCode">type="reset"</code> work as native form
          buttons. The <code :class="inlineCode">type</code> attribute is only set when <code :class="inlineCode">as="button"</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <form class="grid w-full max-w-sm gap-3" @submit="handleSubmit">
          <input :class="inputControl" type="text" placeholder="Type something…" />
          <div class="flex justify-end gap-2">
            <Button type="reset" :class="buttonGhost">Reset</Button>
            <Button type="submit" :class="buttonPrimary">Submit</Button>
          </div>
        </form>
        <p v-if="formResult" class="text-xs text-primary">{{ formResult }}</p>
      </div>
    </div>

    <!-- ── 8. Polymorphic ─────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Polymorphic (as prop)</span>
        <span class="text-xs text-muted-foreground">
          Render as any element. <code :class="inlineCode">as="a"</code> produces a link with full disabled/loading
          ARIA support. <code :class="inlineCode">as="div"</code> makes a non-button interactive element
          (remember to add keyboard handling yourself).
        </span>
      </div>
      <div :class="canvasRow">
        <Button as="a" href="#button" :class="buttonLink">
          As &lt;a&gt; (scrolls to top)
        </Button>

        <Button as="div" role="button" tabindex="0" :class="buttonGhost">
          As &lt;div&gt;
        </Button>
      </div>
    </div>
  </section>
</template>
