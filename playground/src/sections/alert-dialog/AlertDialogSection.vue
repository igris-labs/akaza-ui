<script setup lang="ts">
import { ref } from "vue";
import { AlertDialog } from "akaza-ui";
import {
  alertDialogCompactContent,
  alertDialogContent,
  buttonDestructive,
  buttonGhost,
  buttonPrimary,
  canvasRow,
  dialogBodyText,
  dialogOverlay,
  exampleBlock,
  exampleLabel,
  exampleLabelDescription,
  exampleLabelTitle,
  footerActions,
  inlineCode,
  sectionDescription,
  sectionTitle,
} from "../styles";

const open1 = ref(false);
const open2 = ref(false);
const open3 = ref(false);
const open4 = ref(false);
const open5 = ref(false);
const open6 = ref(false);
const open7 = ref(false);
const open8 = ref(false);

const alertUi = {
  overlay: dialogOverlay,
  content: alertDialogContent,
};

const compactUi = {
  overlay: dialogOverlay,
  content: alertDialogCompactContent,
};

const brandedUi = {
  overlay: `${dialogOverlay} bg-black/65`,
  content: `${alertDialogContent} border-2 border-primary`,
  header: "border-b border-primary/20 px-5 pb-3 pt-5",
  title: "text-base font-bold text-primary",
  description: "text-sm italic text-muted-foreground",
  body: "px-5 pb-5 pt-4",
  footer: "border-t border-border bg-primary/5 p-4",
};
</script>

<template>
  <section id="alert-dialog">
    <h2 :class="sectionTitle">Alert Dialog</h2>
    <p :class="sectionDescription">
      Non-dismissible dialog requiring explicit user action (WAI-ARIA
      <code :class="inlineCode">alertdialog</code>). Escape and backdrop click are intentionally
      disabled.
    </p>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">title + description props</span>
        <span :class="exampleLabelDescription">
          Pass <code>title</code> and <code>description</code> props for zero-slot usage. ARIA IDs
          are wired automatically.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog
          v-model="open1"
          title="Delete account"
          description="This action is permanent and cannot be undone. All your data will be erased immediately."
          :ui="alertUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonDestructive" @click="toggle()">Delete account</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close()">Cancel</button>
              <button :class="buttonDestructive" @click="close()">Yes, delete</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">#title slot</span>
        <span :class="exampleLabelDescription">
          The <code>#title</code> slot takes full control of the title area when provided.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog
          v-model="open2"
          title="This prop is overridden by the slot"
          description="Publishing this post will make it visible to all subscribers immediately."
          :ui="alertUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Publish post</button>
          </template>
          <template #title>
            <div class="flex items-center gap-2 text-base font-semibold text-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0 text-primary"
                aria-hidden="true"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Publish now?
            </div>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close()">Not yet</button>
              <button :class="buttonPrimary" @click="close()">Publish</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">#description slot</span>
        <span :class="exampleLabelDescription">
          Use the <code>#description</code> slot when your description needs rich markup.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog v-model="open3" title="Reset workspace" :ui="alertUi">
          <template #trigger="{ toggle }">
            <button :class="buttonDestructive" @click="toggle()">Reset workspace</button>
          </template>
          <template #description>
            <p class="m-0 mb-2 text-sm text-muted-foreground">The following will be permanently removed:</p>
            <ul class="m-0 list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>All projects and their history</li>
              <li>Team members and permissions</li>
              <li>API keys and integrations</li>
              <li>Billing records and invoices</li>
            </ul>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close()">Keep everything</button>
              <button :class="buttonDestructive" @click="close()">Reset workspace</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Initial focus on Cancel</span>
        <span :class="exampleLabelDescription">
          Add <code>data-akaza-cancel</code> to your Cancel button. Focus lands on the least
          destructive action.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog
          v-model="open4"
          title="Revoke API key"
          description="Any services using this key will stop working immediately. You cannot undo this."
          :ui="alertUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonDestructive" @click="toggle()">Revoke key</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" data-akaza-cancel @click="close()">Keep key</button>
              <button :class="buttonDestructive" @click="close()">Revoke</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Custom transition duration</span>
        <span :class="exampleLabelDescription">
          Pass <code>:duration="600"</code> to slow down both overlay fade and content scale.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog
          v-model="open5"
          title="Slow motion dialog"
          description="This dialog animates at 600ms so the transition is easy to observe."
          :duration="600"
          :ui="alertUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open (slow)</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" data-akaza-cancel @click="close()">Close</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">#header slot (manual titleId)</span>
        <span :class="exampleLabelDescription">
          The <code>#header</code> slot receives <code>{ titleId }</code> for custom title wiring.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog v-model="open6" :ui="alertUi">
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Transfer funds</button>
          </template>
          <template #header="{ titleId }">
            <div class="flex flex-col gap-1">
              <span class="w-max rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                Irreversible
              </span>
              <h2 :id="titleId" class="m-0 text-base font-semibold text-foreground">Confirm wire transfer</h2>
            </div>
          </template>
          <template #body>
            <p :class="dialogBodyText">
              $12,400 will be sent to account ending in 4821. Bank transfers cannot be recalled.
            </p>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" data-akaza-cancel @click="close()">Cancel</button>
              <button :class="buttonPrimary" @click="close()">Confirm transfer</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">ui prop</span>
        <span :class="exampleLabelDescription">
          Pass extra classes to <code>overlay</code>, <code>content</code>, <code>header</code>,
          <code>title</code>, <code>description</code>, <code>body</code>, and <code>footer</code>.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog
          v-model="open7"
          title="Log out everywhere"
          description="All active sessions on other devices will be terminated. You will stay logged in here."
          :ui="brandedUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Log out everywhere</button>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" data-akaza-cancel @click="close()">Stay signed in</button>
              <button :class="buttonPrimary" @click="close()">Log out</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">No header - body + footer only</span>
        <span :class="exampleLabelDescription">
          Omit title, description, and <code>#header</code>. The header section is not rendered.
        </span>
      </div>
      <div :class="canvasRow">
        <AlertDialog v-model="open8" :ui="compactUi">
          <template #trigger="{ toggle }">
            <button :class="buttonDestructive" @click="toggle()">Remove member</button>
          </template>
          <template #body>
            <p :class="[dialogBodyText, 'text-center']">
              Remove <strong>jane@example.com</strong> from the workspace?
            </p>
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" data-akaza-cancel @click="close()">Cancel</button>
              <button :class="buttonDestructive" @click="close()">Remove</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>
  </section>
</template>
