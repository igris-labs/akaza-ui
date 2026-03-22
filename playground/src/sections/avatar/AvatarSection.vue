<script setup lang="ts">
import { Avatar } from "akaza-ui";

// All examples use a real GitHub avatar URL for the "success" case
// and a deliberately broken URL for the "error / fallback" case.
const REAL_SRC = "https://avatars.githubusercontent.com/u/1000?v=4";
const BROKEN_SRC = "https://broken.example/404.png";
</script>

<template>
  <section id="avatar">
    <h2 class="text-lg font-semibold mb-1">Avatar</h2>
    <p class="text-sm mb-8 text-muted-foreground">
      Image with graceful fallback. Supports initials, delayed fallback to avoid flash,
      custom image slot, and ui-prop class overrides.
    </p>

    <!-- ── 1. Image loads successfully ───────────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">Image loads</span>
        <span class="av-demo-label-desc">
          Pass <code>src</code> and <code>alt</code>. Once loaded, the image is shown and the
          fallback is hidden.
        </span>
      </div>
      <div class="av-demo-canvas">
        <Avatar :src="REAL_SRC" alt="GitHub user" class="av-avatar">
          <template #fallback>
            <span class="av-initials">GH</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 2. Broken src — #fallback slot ────────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">Broken src — #fallback slot</span>
        <span class="av-demo-label-desc">
          When the image fails to load, the <code>#fallback</code> slot is rendered.
          It receives <code>{ status }</code> so you can react to <code>'error'</code> vs <code>'loading'</code>.
        </span>
      </div>
      <div class="av-demo-canvas">
        <Avatar :src="BROKEN_SRC" alt="Broken" class="av-avatar">
          <template #fallback="{ status }">
            <span class="av-initials" :class="status === 'error' ? 'av-initials--error' : ''">AB</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 3. text prop — zero-slot initials ─────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">text prop</span>
        <span class="av-demo-label-desc">
          Pass <code>text</code> for a zero-slot initials fallback. The <code>#fallback</code>
          slot takes priority when provided.
        </span>
      </div>
      <div class="av-demo-canvas av-demo-canvas--row">
        <Avatar :src="BROKEN_SRC" text="JD" class="av-avatar av-avatar--indigo" />
        <Avatar :src="BROKEN_SRC" text="MK" class="av-avatar av-avatar--rose" />
        <Avatar :src="BROKEN_SRC" text="+3" class="av-avatar av-avatar--amber" />
        <!-- no src at all — text is the only content -->
        <Avatar text="CX" class="av-avatar av-avatar--emerald" />
      </div>
    </div>

    <!-- ── 4. No src — pure initials avatar ──────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">No src</span>
        <span class="av-demo-label-desc">
          Omit <code>src</code> entirely. The component immediately enters the
          <code>error</code> state and shows the fallback — useful for users with no profile picture.
        </span>
      </div>
      <div class="av-demo-canvas av-demo-canvas--row">
        <Avatar class="av-avatar av-avatar--primary">
          <template #fallback>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </template>
        </Avatar>
        <Avatar text="?" class="av-avatar av-avatar--muted" />
      </div>
    </div>

    <!-- ── 5. delayMs — no flash on fast connections ──────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">delayMs</span>
        <span class="av-demo-label-desc">
          <code>:delay-ms="800"</code> suppresses the fallback for 800ms. If the image loads
          within that window, the fallback is never shown — eliminating the flash.
          The broken-src avatar below has no delay, so its fallback appears immediately.
        </span>
      </div>
      <div class="av-demo-canvas av-demo-canvas--row">
        <!-- Real image + delay: fallback suppressed while image loads -->
        <div class="av-labeled-avatar">
          <Avatar :src="REAL_SRC" alt="Delayed" :delay-ms="800" class="av-avatar">
            <template #fallback><span class="av-initials">DL</span></template>
          </Avatar>
          <span class="av-avatar-caption">800ms delay (real src)</span>
        </div>
        <!-- Broken image + no delay: fallback appears immediately -->
        <div class="av-labeled-avatar">
          <Avatar :src="BROKEN_SRC" alt="No delay" class="av-avatar">
            <template #fallback><span class="av-initials av-initials--error">ND</span></template>
          </Avatar>
          <span class="av-avatar-caption">No delay (broken src)</span>
        </div>
      </div>
    </div>

    <!-- ── 6. #image slot — custom image element ──────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">#image slot</span>
        <span class="av-demo-label-desc">
          Replace the default <code>&lt;img&gt;</code> with your own — useful for native lazy
          loading, a custom component, or an <code>&lt;object&gt;</code> element.
          Receives <code>{ src, alt, status }</code>.
        </span>
      </div>
      <div class="av-demo-canvas">
        <Avatar :src="REAL_SRC" alt="Lazy loaded" class="av-avatar">
          <template #image="{ src, alt }">
            <img :src="src" :alt="alt" loading="lazy" class="av-avatar-img" />
          </template>
          <template #fallback>
            <span class="av-initials">LL</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 7. ui prop ─────────────────────────────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">ui prop</span>
        <span class="av-demo-label-desc">
          Pass extra classes to <code>root</code>, <code>image</code>, and <code>fallback</code>
          parts without touching the slots.
        </span>
      </div>
      <div class="av-demo-canvas av-demo-canvas--row">
        <!-- Working image — ui.image adds a ring -->
        <Avatar
          :src="REAL_SRC"
          alt="With ring"
          :ui="{ root: 'av-avatar', image: 'av-img--ring' }"
        >
          <template #fallback><span class="av-initials">UI</span></template>
        </Avatar>
        <!-- Broken — ui.fallback styles the fallback span -->
        <Avatar
          :src="BROKEN_SRC"
          text="UI"
          :ui="{ root: 'av-avatar av-avatar--primary', fallback: 'av-fallback--large' }"
        />
      </div>
    </div>

    <!-- ── 8. Avatar group ────────────────────────────────────────────────── -->
    <div class="av-demo-block">
      <div class="av-demo-label">
        <span class="av-demo-label-title">Avatar group</span>
        <span class="av-demo-label-desc">
          Compose multiple avatars with CSS. The component provides no group wrapper —
          use a flex container with negative margin for overlap.
        </span>
      </div>
      <div class="av-demo-canvas">
        <div class="av-group">
          <Avatar :src="REAL_SRC" alt="User 1" class="av-avatar av-group-item" />
          <Avatar :src="BROKEN_SRC" text="AB" class="av-avatar av-avatar--rose av-group-item" />
          <Avatar text="CX" class="av-avatar av-avatar--indigo av-group-item" />
          <Avatar text="+4" class="av-avatar av-avatar--muted av-group-item" />
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Base avatar shell ───────────────────────────────────────────────────── */
.av-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--muted);
  flex-shrink: 0;
  position: relative;
}

.akaza-avatar-image,
.av-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.akaza-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* ── Initials ────────────────────────────────────────────────────────────── */
.av-initials {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-foreground);
  user-select: none;
}

.av-initials--error {
  color: var(--destructive);
}

/* ── Color variants ──────────────────────────────────────────────────────── */
.av-avatar--primary  { background: var(--primary);     color: var(--primary-foreground); }
.av-avatar--indigo   { background: #6366f1;             color: #fff; }
.av-avatar--rose     { background: #f43f5e;             color: #fff; }
.av-avatar--amber    { background: #f59e0b;             color: #fff; }
.av-avatar--emerald  { background: #10b981;             color: #fff; }
.av-avatar--muted    { background: var(--muted);        color: var(--muted-foreground); }

/* Initials inside color variants inherit color from the shell */
.av-avatar--primary  .av-initials,
.av-avatar--indigo   .av-initials,
.av-avatar--rose     .av-initials,
.av-avatar--amber    .av-initials,
.av-avatar--emerald  .av-initials {
  color: inherit;
}

/* ── ui prop examples ────────────────────────────────────────────────────── */
.av-img--ring {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.av-fallback--large {
  font-size: 16px;
  font-weight: 700;
}

/* ── Group ───────────────────────────────────────────────────────────────── */
.av-group {
  display: flex;
  flex-direction: row-reverse;
}

.av-group-item {
  margin-left: -10px;
  border: 2px solid var(--card);
}

.av-group-item:last-child {
  margin-left: 0;
}

/* ── Labeled avatar (delayMs demo) ───────────────────────────────────────── */
.av-labeled-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.av-avatar-caption {
  font-size: 11px;
  color: var(--muted-foreground);
  white-space: nowrap;
}

/* ── Demo layout ─────────────────────────────────────────────────────────── */
.av-demo-block {
  margin-bottom: 32px;
}

.av-demo-label {
  margin-bottom: 12px;
}

.av-demo-label-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2px;
}

.av-demo-label-desc {
  font-size: 12px;
  color: var(--muted-foreground);
}

.av-demo-label-desc code {
  font-family: monospace;
  font-size: 11px;
  background: var(--muted);
  color: var(--foreground);
  padding: 1px 4px;
  border-radius: 3px;
}

.av-demo-canvas {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  background: var(--accent);
  display: flex;
  align-items: center;
}

.av-demo-canvas--row {
  gap: 16px;
}
</style>
