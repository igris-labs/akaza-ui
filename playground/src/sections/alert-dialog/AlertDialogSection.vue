<script setup lang="ts">
import { ref } from "vue";
import { AlertDialog } from "akaza-ui";

// 1. title + description props — zero slots needed
const open1 = ref(false);

// 2. #title slot — slot overrides prop (icon + text in title)
const open2 = ref(false);

// 3. #description slot — rich content (bullet list)
const open3 = ref(false);

// 4. data-akaza-cancel — initial focus lands on Cancel per WAI-ARIA
const open4 = ref(false);

// 5. Custom duration — slow-motion animation
const open5 = ref(false);

// 6. #header slot — legacy manual titleId wiring still works
const open6 = ref(false);

// 7. ui prop — custom classes on every part
const open7 = ref(false);

// 8. Body-only — no header at all, just description + actions
const open8 = ref(false);
</script>

<template>
  <section id="alert-dialog">
    <h2 class="text-lg font-semibold mb-1">Alert Dialog</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Non-dismissible dialog requiring explicit user action (WAI-ARIA
      <code class="font-mono text-xs bg-muted px-1 rounded">alertdialog</code>).
      Escape and backdrop click are intentionally disabled.
    </p>

    <!-- ── 1. title + description props ──────────────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">title + description props</span>
        <span class="ad-demo-label-desc">
          Pass <code>title</code> and <code>description</code> props for zero-slot usage.
          ARIA IDs are wired automatically.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open1"
          title="Delete account"
          description="This action is permanent and cannot be undone. All your data will be erased immediately."
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-destructive" @click="toggle">Delete account</button>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" @click="close">Cancel</button>
              <button class="ad-btn-destructive" @click="close">Yes, delete</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 2. #title slot — overrides prop ───────────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">#title slot</span>
        <span class="ad-demo-label-desc">
          The <code>#title</code> slot takes full control of the title area when provided,
          letting you add icons, badges, or any markup.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open2"
          title="This prop is overridden by the slot"
          description="Publishing this post will make it visible to all subscribers immediately."
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-primary" @click="toggle">Publish post</button>
          </template>
          <template #title>
            <div class="ad-title-with-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ad-title-icon" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Publish now?
            </div>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" @click="close">Not yet</button>
              <button class="ad-btn-primary" @click="close">Publish</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 3. #description slot — rich content ───────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">#description slot</span>
        <span class="ad-demo-label-desc">
          Use the <code>#description</code> slot when your description needs rich markup —
          lists, code, or formatted warnings.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open3"
          title="Reset workspace"
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-destructive" @click="toggle">Reset workspace</button>
          </template>
          <template #description>
            <p class="ad-desc-text">The following will be permanently removed:</p>
            <ul class="ad-desc-list">
              <li>All projects and their history</li>
              <li>Team members and permissions</li>
              <li>API keys and integrations</li>
              <li>Billing records and invoices</li>
            </ul>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" @click="close">Keep everything</button>
              <button class="ad-btn-destructive" @click="close">Reset workspace</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 4. data-akaza-cancel — initial focus ───────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">Initial focus on Cancel</span>
        <span class="ad-demo-label-desc">
          Add <code>data-akaza-cancel</code> to your Cancel button. Per WAI-ARIA, alert dialogs
          must open with focus on the least destructive action, not the first focusable element.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open4"
          title="Revoke API key"
          description="Any services using this key will stop working immediately. You cannot undo this."
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-destructive" @click="toggle">Revoke key</button>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <!-- data-akaza-cancel → focus lands here on open -->
              <button class="ad-btn-ghost" data-akaza-cancel @click="close">Keep key</button>
              <button class="ad-btn-destructive" @click="close">Revoke</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 5. Custom duration ─────────────────────────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">Custom transition duration</span>
        <span class="ad-demo-label-desc">
          Pass <code>:duration="600"</code> to slow down both the overlay fade and content scale.
          The CSS variable <code>--akaza-dialog-duration</code> is set automatically.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open5"
          title="Slow motion dialog"
          description="This dialog animates at 600ms so the transition is easy to observe."
          :duration="600"
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-primary" @click="toggle">Open (slow)</button>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" data-akaza-cancel @click="close">Close</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 6. #header slot — manual titleId wiring ────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">#header slot (manual titleId)</span>
        <span class="ad-demo-label-desc">
          The legacy <code>#header</code> slot is still supported. It receives <code>{ titleId }</code>
          so you can wire <code>aria-labelledby</code> manually for full header control.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open6"
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-primary" @click="toggle">Transfer funds</button>
          </template>
          <template #header="{ titleId }">
            <div class="ad-custom-header">
              <span class="ad-custom-header-badge">Irreversible</span>
              <h2 :id="titleId" class="ad-custom-header-title">Confirm wire transfer</h2>
            </div>
          </template>
          <template #body>
            <p class="ad-body-text">
              $12,400 will be sent to account ending in 4821. Bank transfers cannot be recalled.
            </p>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" data-akaza-cancel @click="close">Cancel</button>
              <button class="ad-btn-primary" @click="close">Confirm transfer</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 7. ui prop ─────────────────────────────────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">ui prop</span>
        <span class="ad-demo-label-desc">
          Pass extra classes to <code>overlay</code>, <code>content</code>, <code>header</code>,
          <code>title</code>, <code>description</code>, <code>body</code>, and <code>footer</code>
          without any slots.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open7"
          title="Log out everywhere"
          description="All active sessions on other devices will be terminated. You will stay logged in here."
          :ui="{
            overlay: 'ad-overlay ad-overlay--dark',
            content: 'ad-dialog ad-dialog--bordered',
            header: 'ad-header--branded',
            title: 'ad-title--branded',
            description: 'ad-description--muted',
            body: 'ad-body--padded',
            footer: 'ad-footer--branded',
          }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-primary" @click="toggle">Log out everywhere</button>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" data-akaza-cancel @click="close">Stay signed in</button>
              <button class="ad-btn-primary" @click="close">Log out</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>

    <!-- ── 8. No header — body only ───────────────────────────────────────── -->
    <div class="ad-demo-block">
      <div class="ad-demo-label">
        <span class="ad-demo-label-title">No header — body + footer only</span>
        <span class="ad-demo-label-desc">
          Omit <code>title</code>, <code>description</code>, and <code>#header</code> entirely.
          The header section is not rendered. Useful for compact confirmation prompts.
        </span>
      </div>
      <div class="ad-demo-canvas">
        <AlertDialog
          v-model="open8"
          :ui="{ overlay: 'ad-overlay', content: 'ad-dialog ad-dialog--compact' }"
        >
          <template #trigger="{ toggle }">
            <button class="ad-btn-destructive" @click="toggle">Remove member</button>
          </template>
          <template #body>
            <p class="ad-body-text ad-body-text--center">
              Remove <strong>jane@example.com</strong> from the workspace?
            </p>
          </template>
          <template #footer="{ close }">
            <div class="ad-footer-actions">
              <button class="ad-btn-ghost" data-akaza-cancel @click="close">Cancel</button>
              <button class="ad-btn-destructive" @click="close">Remove</button>
            </div>
          </template>
        </AlertDialog>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Shared overlay + dialog chrome ──────────────────────────────────────── */
.ad-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.ad-overlay--dark {
  background: rgba(0, 0, 0, 0.65);
}

.ad-dialog {
  position: fixed;
  z-index: 200;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 440px);
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ad-dialog--bordered {
  border: 2px solid var(--primary);
}

.ad-dialog--compact {
  width: min(90vw, 340px);
}

/* ── Auto-rendered title / description ───────────────────────────────────── */
.ad-dialog .akaza-alert-dialog-header {
  padding: 20px 20px 0;
}

.ad-dialog .akaza-alert-dialog-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--foreground);
}

.ad-dialog .akaza-alert-dialog-body {
  padding: 12px 20px 20px;
}

.ad-dialog .akaza-alert-dialog-description {
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.55;
  margin-bottom: 0;
}

.ad-dialog .akaza-alert-dialog-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}

/* ── ui prop variants ────────────────────────────────────────────────────── */
.ad-header--branded {
  padding: 20px 20px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
  padding-bottom: 14px;
  margin-bottom: 0;
}

.ad-title--branded {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
}

.ad-description--muted {
  font-size: 13px;
  color: var(--muted-foreground);
  font-style: italic;
}

.ad-body--padded {
  padding: 16px 20px 20px;
}

.ad-footer--branded {
  background: color-mix(in srgb, var(--primary) 8%, var(--card));
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.ad-demo-block {
  margin-bottom: 32px;
}

.ad-demo-label {
  margin-bottom: 12px;
}

.ad-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.ad-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.ad-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.ad-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: flex-start;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.ad-btn-primary {
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

.ad-btn-primary:hover {
  opacity: 0.88;
}

.ad-btn-destructive {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--destructive);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.ad-btn-destructive:hover {
  opacity: 0.88;
}

.ad-btn-ghost {
  padding: 6px 16px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--foreground);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.ad-btn-ghost:hover {
  background: var(--muted);
}

/* ── Footer actions row ──────────────────────────────────────────────────── */
.ad-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ── Example: #title slot with icon ─────────────────────────────────────── */
.ad-title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--foreground);
}

.ad-title-icon {
  color: var(--primary);
  flex-shrink: 0;
}

/* ── Example: #description slot — list ──────────────────────────────────── */
.ad-desc-text {
  font-size: 13px;
  color: var(--muted-foreground);
  margin: 0 0 8px;
}

.ad-desc-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.7;
}

/* ── Example: body text ──────────────────────────────────────────────────── */
.ad-body-text {
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.55;
  margin: 0;
}

.ad-body-text--center {
  text-align: center;
}

/* ── Example: #header slot — custom header ───────────────────────────────── */
.ad-custom-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ad-custom-header-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--destructive);
  background: color-mix(in srgb, var(--destructive) 12%, transparent);
  padding: 2px 7px;
  border-radius: 99px;
  align-self: flex-start;
}

.ad-custom-header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--foreground);
  margin: 0;
}
</style>
