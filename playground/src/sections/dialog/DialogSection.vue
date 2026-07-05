<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  buttonPrimary,
  canvasCol,
  canvasRow,
  dialogContent,
  dialogContentFullscreen,
  dialogContentInner,
  dialogOverlay,
  dialogOverlayInner,
  eventEntry,
  eventLog as eventLogClass,
  footerActions,
  sectionDescriptionTight,
  sectionTitle,
} from "../styles";

const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
const open5 = ref(false);
const open5Inner = ref(false);
const open6 = ref(false);
const open7 = ref(false);
const open8 = ref(false);

// ── 9. Event details ────────────────────────────────────────────────────────
const open9 = ref(false);
const eventLog = ref<string[]>([]);
function onDialogChange(open: boolean, details: AkazaChangeEventDetails) {
  eventLog.value = [
    `${open ? "open" : "close"} — reason: ${details.reason}`,
    ...eventLog.value,
  ].slice(0, 5);
}

// ── 10. Cancel close ────────────────────────────────────────────────────────
const open10 = ref(false);
const hasUnsaved = ref(true);
function onGuardedChange(_open: boolean, details: AkazaChangeEventDetails) {
  if (!_open && hasUnsaved.value && details.reason !== "confirm") {
    details.cancel();
  }
}
</script>

<template>
  <section id="dialog">
    <h2 :class="sectionTitle">Dialog</h2>
    <p :class="sectionDescriptionTight">
      A modal dialog with focus trap, backdrop, and teleport.
    </p>

    <!-- 1. Title + description props -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">Title &amp; description props</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open1"
          title="Confirm action"
          description="This will permanently delete the item. This action cannot be undone."
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close">Cancel</button>
              <button :class="buttonPrimary" @click="close">Confirm</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 2. Custom #title and #description slots -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">#title and #description slots</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open2"
          :ui="{ overlay: dialogOverlay, content: dialogContent, title: 'text-lg font-bold text-primary' }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #title>
            <span>🎉 Custom title slot</span>
          </template>
          <template #description>
            <p>
              This description comes from the <code>#description</code> slot, giving full control
              over markup.
            </p>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Done</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 3. Custom #header slot (manual layout) -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom #header slot</span>
      <div :class="canvasRow">
        <Dialog v-model="open3" :ui="{ overlay: dialogOverlay, content: dialogContent }">
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #header="{ close, titleId }">
            <div class="flex items-center justify-between">
              <h2 :id="titleId" class="text-base font-semibold text-foreground">Custom header layout</h2>
              <button class="rounded px-1 text-lg leading-none text-muted-foreground hover:text-foreground" aria-label="Close" @click="close">✕</button>
            </div>
          </template>
          <template #body>
            <p class="text-sm leading-relaxed text-muted-foreground">
              The header slot gives full control. The close button is rendered manually.
            </p>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 4. No backdrop close -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">closeOnBackdropClick: false</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open4"
          title="Sticky dialog"
          description="Clicking the backdrop won't close this. You must use the button."
          :close-on-backdrop-click="false"
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Close explicitly</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 5. Nested dialogs -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">Nested dialogs</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open5"
          title="Outer dialog"
          description="Focus is trapped here. Open the inner dialog to pause this trap."
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open outer</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close">Close</button>
              <button :class="buttonPrimary" @click="open5Inner = true">Open inner</button>
            </div>
          </template>
        </Dialog>

        <Dialog
          v-model="open5Inner"
          title="Inner dialog"
          description="This is stacked on top. The outer dialog's focus trap is paused."
          :ui="{ overlay: dialogOverlayInner, content: dialogContentInner }"
        >
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Close inner</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 6. Fullscreen -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">fullscreen prop</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open6"
          title="Fullscreen dialog"
          description="This dialog takes up the entire viewport."
          :fullscreen="true"
          :ui="{ overlay: dialogOverlay, content: dialogContentFullscreen }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open fullscreen</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 7. Body-only (no header, no footer) -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">Body only (no header / footer)</span>
      <div :class="canvasRow">
        <Dialog v-model="open7" :ui="{ overlay: dialogOverlay, content: dialogContent }">
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #body="{ close }">
            <p class="mb-4 text-sm leading-relaxed text-muted-foreground">
              No header or footer — just a body slot. Dismiss by pressing Escape or clicking the
              backdrop.
            </p>
            <button :class="buttonGhost" @click="close">Close</button>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 8. No transition -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">No transition</span>
      <div :class="canvasRow">
        <Dialog
          v-model="open8"
          title="No animation"
          description="This dialog appears and disappears instantly — transition is disabled."
          :transition="false"
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>

    <!-- 9. @open-change event details -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">@open-change event details</span>
      <div :class="canvasCol">
        <Dialog
          v-model="open9"
          title="Event details demo"
          description="Close via backdrop, Escape, or the button — each reports a different reason."
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
          @open-change="onDialogChange"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonPrimary" @click="close">Close</button>
            </div>
          </template>
        </Dialog>
        <div v-if="eventLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in eventLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>

    <!-- 10. cancel() — unsaved changes guard -->
    <div class="mb-6">
      <span class="mb-2 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">cancel() — unsaved changes guard</span>
      <div :class="canvasCol">
        <label class="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input type="checkbox" v-model="hasUnsaved" />
          Simulate unsaved changes
        </label>
        <Dialog
          v-model="open10"
          title="Unsaved changes"
          description="Try closing via backdrop or Escape while 'unsaved changes' is checked — the close is prevented."
          :ui="{ overlay: dialogOverlay, content: dialogContent }"
          @open-change="onGuardedChange"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle">Open guarded dialog</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close('discard')">Discard</button>
              <button :class="buttonPrimary" @click="close('confirm')">Save &amp; close</button>
            </div>
          </template>
        </Dialog>
      </div>
    </div>
  </section>
</template>
