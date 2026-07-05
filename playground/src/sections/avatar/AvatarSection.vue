<script setup lang="ts">
import { Avatar } from "akaza-ui";
import {
  avatarFallback,
  avatarImage,
  avatarMuted,
  avatarPrimary,
  avatarRoot,
  canvas,
  canvasRow,
  inlineCode,
  sectionDescription,
  sectionTitle,
} from "../styles";

const avatarUi = { root: avatarRoot, image: avatarImage, fallback: avatarFallback };

// All examples use a real GitHub avatar URL for the "success" case
// and a deliberately broken URL for the "error / fallback" case.
const REAL_SRC = "https://avatars.githubusercontent.com/u/1000?v=4";
const BROKEN_SRC = "https://broken.example/404.png";
</script>

<template>
  <section id="avatar">
    <h2 :class="sectionTitle">Avatar</h2>
    <p :class="sectionDescription">
      Image with graceful fallback. Supports initials, delayed fallback to avoid flash,
      custom image slot, and ui-prop class overrides.
    </p>

    <!-- ── 1. Image loads successfully ───────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Image loads</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">src</code> and <code :class="inlineCode">alt</code>. Once loaded, the image is shown and the
          fallback is hidden.
        </span>
      </div>
      <div :class="canvas">
        <Avatar :src="REAL_SRC" alt="GitHub user" :ui="avatarUi">
          <template #fallback>
            <span>GH</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 2. Broken src — #fallback slot ────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Broken src — #fallback slot</span>
        <span class="text-xs text-muted-foreground">
          When the image fails to load, the <code :class="inlineCode">#fallback</code> slot is rendered.
          It receives <code :class="inlineCode">{ status }</code> so you can react to <code :class="inlineCode">'error'</code> vs <code :class="inlineCode">'loading'</code>.
        </span>
      </div>
      <div :class="canvas">
        <Avatar :src="BROKEN_SRC" alt="Broken" :ui="avatarUi">
          <template #fallback="{ status }">
            <span :class="status === 'error' ? 'text-destructive' : ''">AB</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 3. text prop — zero-slot initials ─────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">text prop</span>
        <span class="text-xs text-muted-foreground">
          Pass <code :class="inlineCode">text</code> for a zero-slot initials fallback. The <code :class="inlineCode">#fallback</code>
          slot takes priority when provided.
        </span>
      </div>
      <div :class="canvasRow">
        <Avatar :src="BROKEN_SRC" text="JD" :ui="{ root: avatarPrimary, fallback: avatarFallback }" />
        <Avatar :src="BROKEN_SRC" text="MK" :ui="{ root: `${avatarRoot} bg-destructive text-white`, fallback: avatarFallback }" />
        <Avatar :src="BROKEN_SRC" text="+3" :ui="{ root: avatarMuted, fallback: avatarFallback }" />
        <!-- no src at all — text is the only content -->
        <Avatar text="CX" :ui="{ root: `${avatarRoot} bg-background border border-border text-foreground`, fallback: avatarFallback }" />
      </div>
    </div>

    <!-- ── 4. No src — pure initials avatar ──────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">No src</span>
        <span class="text-xs text-muted-foreground">
          Omit <code :class="inlineCode">src</code> entirely. The component immediately enters the
          <code :class="inlineCode">error</code> state and shows the fallback — useful for users with no profile picture.
        </span>
      </div>
      <div :class="canvasRow">
        <Avatar :ui="{ root: avatarPrimary, fallback: avatarFallback }">
          <template #fallback>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </template>
        </Avatar>
        <Avatar text="?" :ui="{ root: avatarMuted, fallback: avatarFallback }" />
      </div>
    </div>

    <!-- ── 5. delayMs — no flash on fast connections ──────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">delayMs</span>
        <span class="text-xs text-muted-foreground">
          <code :class="inlineCode">:delay-ms="800"</code> suppresses the fallback for 800ms. If the image loads
          within that window, the fallback is never shown — eliminating the flash.
          The broken-src avatar below has no delay, so its fallback appears immediately.
        </span>
      </div>
      <div :class="canvasRow">
        <!-- Real image + delay: fallback suppressed while image loads -->
        <div class="flex flex-col items-center gap-1.5">
          <Avatar :src="REAL_SRC" alt="Delayed" :delay-ms="800" :ui="avatarUi">
            <template #fallback><span>DL</span></template>
          </Avatar>
          <span class="whitespace-nowrap text-[11px] text-muted-foreground">800ms delay (real src)</span>
        </div>
        <!-- Broken image + no delay: fallback appears immediately -->
        <div class="flex flex-col items-center gap-1.5">
          <Avatar :src="BROKEN_SRC" alt="No delay" :ui="avatarUi">
            <template #fallback><span class="text-destructive">ND</span></template>
          </Avatar>
          <span class="whitespace-nowrap text-[11px] text-muted-foreground">No delay (broken src)</span>
        </div>
      </div>
    </div>

    <!-- ── 6. #image slot — custom image element ──────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">#image slot</span>
        <span class="text-xs text-muted-foreground">
          Replace the default <code :class="inlineCode">&lt;img&gt;</code> with your own — useful for native lazy
          loading, a custom component, or an <code :class="inlineCode">&lt;object&gt;</code> element.
          Receives <code :class="inlineCode">{ src, alt, status }</code>.
        </span>
      </div>
      <div :class="canvas">
        <Avatar :src="REAL_SRC" alt="Lazy loaded" :ui="avatarUi">
          <template #image="{ src, alt }">
            <img :src="src" :alt="alt" loading="lazy" :class="avatarImage" />
          </template>
          <template #fallback>
            <span>LL</span>
          </template>
        </Avatar>
      </div>
    </div>

    <!-- ── 7. ui prop ─────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">ui prop</span>
        <span class="text-xs text-muted-foreground">
          Pass extra classes to <code :class="inlineCode">root</code>, <code :class="inlineCode">image</code>, and <code :class="inlineCode">fallback</code>
          parts without touching the slots.
        </span>
      </div>
      <div :class="canvasRow">
        <!-- Working image — ui.image adds a ring -->
        <Avatar
          :src="REAL_SRC"
          alt="With ring"
          :ui="{ root: avatarRoot, image: `${avatarImage} ring-2 ring-primary ring-offset-2 ring-offset-background`, fallback: avatarFallback }"
        >
          <template #fallback><span>UI</span></template>
        </Avatar>
        <!-- Broken — ui.fallback styles the fallback span -->
        <Avatar
          :src="BROKEN_SRC"
          text="UI"
          :ui="{ root: avatarPrimary, fallback: 'flex size-full select-none items-center justify-center text-base font-bold' }"
        />
      </div>
    </div>

    <!-- ── 8. Avatar group ────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="mb-3">
        <span class="block text-sm font-medium text-foreground">Avatar group</span>
        <span class="text-xs text-muted-foreground">
          Compose multiple avatars with CSS. The component provides no group wrapper —
          use a flex container with negative margin for overlap.
        </span>
      </div>
      <div :class="canvas">
        <div class="flex flex-row-reverse">
          <Avatar :src="REAL_SRC" alt="User 1" :ui="{ root: `${avatarRoot} -ml-2.5 border-2 border-card`, image: avatarImage, fallback: avatarFallback }" />
          <Avatar :src="BROKEN_SRC" text="AB" :ui="{ root: `${avatarRoot} -ml-2.5 border-2 border-card bg-destructive text-white`, fallback: avatarFallback }" />
          <Avatar text="CX" :ui="{ root: `${avatarRoot} -ml-2.5 border-2 border-card bg-primary text-primary-foreground`, fallback: avatarFallback }" />
          <Avatar text="+4" :ui="{ root: `${avatarRoot} border-2 border-card bg-muted text-muted-foreground`, fallback: avatarFallback }" />
        </div>
      </div>
    </div>
  </section>
</template>
