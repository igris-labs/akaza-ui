<script setup lang="ts">
import type { ToastType } from "akaza-ui";
import { createToastManager, Toast, useToast } from "akaza-ui";
import { computed } from "vue";
import {
  buttonDestructive,
  buttonGhost,
  buttonPrimary,
  canvasCol,
  codePill,
  exampleLabelDescription,
  exampleLabelTitle,
  sectionDescription,
  sectionTitle,
  toastUi,
} from "../styles";

const toast = useToast();
const customToast = createToastManager();
const openCount = computed(() => toast.toasts.value.filter((item) => item.state === "open").length);
const customCount = computed(
  () => customToast.toasts.value.filter((item) => item.state === "open").length,
);

function show(type: ToastType) {
  const copy = {
    status: ["Saved", "Workspace settings were updated."],
    alert: ["Action required", "Your session needs attention."],
    success: ["Published", "Deployment is live."],
    info: ["New version", "Akaza UI 0.0.4-alpha is available."],
    warning: ["Storage nearly full", "Less than 10% remains."],
    error: ["Deploy failed", "Production rejected the build artifact."],
  }[type]!;
  toast.add({ title: copy[0], description: copy[1], type, duration: type === "error" ? 0 : 5000 });
}

function showDuplicate() {
  toast.add({
    title: "Comment received",
    description: "Duplicates get independent ids.",
    type: "info",
  });
  toast.add({
    title: "Comment received",
    description: "This is a second notification.",
    type: "info",
  });
}

function showUpdated() {
  toast.add({
    id: "sync",
    title: "Syncing",
    description: "Stable id updates in place.",
    duration: 0,
  });
  window.setTimeout(() => {
    toast.add({
      id: "sync",
      title: "Synced",
      description: "Same id, refreshed timer and animation.",
      type: "success",
    });
  }, 900);
}

function showStack() {
  for (let index = 1; index <= 5; index++) {
    toast.add({
      title: `Queued notification ${index}`,
      description: "Hover the stack to expand it.",
      duration: 0,
    });
  }
}

function showAction() {
  toast.add({
    title: "Connection lost",
    description: "Retry keeps action and urgency independent from visual type.",
    type: "warning",
    priority: "high",
    duration: 0,
    action: {
      label: "Retry",
      altText: "Retry connection",
      onSelect: () => show("success"),
    },
  });
}

function showPromise() {
  void toast.promise(new Promise((resolve) => window.setTimeout(resolve, 1200)), {
    loading: { title: "Publishing", description: "Waiting for deployment queue.", duration: 0 },
    success: { title: "Published", description: "Deployment is live.", type: "success" },
    error: { title: "Failed", description: "Deployment failed.", type: "error" },
  });
}

function showCustom() {
  customToast.add({
    title: "Custom content",
    description: "Toast root keeps live-region behavior while slot owns all inner markup.",
    data: { source: "custom slot" },
    type: "warning",
    duration: 0,
    action: {
      label: "Inspect",
      altText: "Inspect custom notification",
      onSelect: () => undefined,
    },
  });
}
</script>

<template>
  <section id="toast">
    <h2 :class="sectionTitle">Toast</h2>
    <p :class="sectionDescription">
      Queued notifications with independent visual type and urgency, updates, actions, promise
      state, pause, keyboard focus, stacking, and swipe dismissal.
    </p>

    <div class="space-y-8">
      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Standard types</h3>
          <p :class="exampleLabelDescription">
            Visual type is exposed through <code>data-akaza-type</code>. Error defaults to assertive
            priority.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="buttonPrimary" type="button" @click="show('status')">Standard</button>
          <button :class="buttonGhost" type="button" @click="show('success')">Success</button>
          <button :class="buttonGhost" type="button" @click="show('info')">Info</button>
          <button :class="buttonGhost" type="button" @click="show('warning')">Warning</button>
          <button :class="buttonGhost" type="button" @click="show('alert')">Alert</button>
          <button :class="buttonDestructive" type="button" @click="show('error')">Error</button>
        </div>
        <code :class="codePill">Open notifications: {{ openCount }}</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Queue, duplicates, and updates</h3>
          <p :class="exampleLabelDescription">
            New ids create duplicates. Reusing an id updates one toast and refreshes its timer.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="buttonGhost" type="button" @click="showDuplicate">
            Show duplicate pair
          </button>
          <button :class="buttonGhost" type="button" @click="showUpdated">Update stable id</button>
          <button :class="buttonGhost" type="button" @click="showStack">Add five to stack</button>
          <button :class="buttonGhost" type="button" @click="toast.clear()">Clear all</button>
        </div>
        <code :class="codePill">Press F8 to focus notifications. Hover/focus pauses timers.</code>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Action and promise lifecycle</h3>
          <p :class="exampleLabelDescription">
            Actions close only after successful completion. Promise updates preserve one stable
            toast.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="buttonGhost" type="button" @click="showAction">Action toast</button>
          <button :class="buttonGhost" type="button" @click="showPromise">Promise toast</button>
        </div>
      </div>

      <div :class="canvasCol">
        <div>
          <h3 :class="exampleLabelTitle">Custom toast content</h3>
          <p :class="exampleLabelDescription">
            Scoped manager isolates this viewport. Slot replaces all content inside accessible toast
            root.
          </p>
        </div>
        <button :class="buttonGhost" type="button" @click="showCustom">Show custom toast</button>
        <code :class="codePill">Open custom notifications: {{ customCount }}</code>
      </div>
    </div>

    <Toast :ui="toastUi" />
    <Toast :manager="customToast" position="top-right" :ui="toastUi">
      <template #toast="{ toast: item, type, action, performAction, close }">
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold uppercase text-primary-foreground"
            >{{ type.slice(0, 1) }}</span
          >
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-primary">{{ type }}</p>
            <p class="mt-0.5 text-sm font-semibold text-foreground">{{ item.title }}</p>
            <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{{ item.description }}</p>
            <code class="mt-2 block text-[11px] text-primary">{{ item.data }}</code>
            <button
              v-if="action"
              type="button"
              :class="buttonGhost"
              class="mt-3"
              @click="performAction($event)"
            >
              {{ action.label }}
            </button>
          </div>
          <button
            type="button"
            aria-label="Dismiss custom notification"
            class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            @click="close()"
          >
            ×
          </button>
        </div>
      </template>
    </Toast>
  </section>
</template>
