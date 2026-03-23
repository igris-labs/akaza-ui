<script setup lang="ts">
import { ref } from "vue";
import { RadioGroup } from "akaza-ui";

// 1. Basic (string options, vertical)
const basicValue = ref("md");
const sizeOptions = ["xs", "sm", "md", "lg", "xl"];

// 2. Horizontal
const themeValue = ref("system");
const themeOptions = ["system", "light", "dark"];

// 3. Object options with label + description
const planValue = ref("pro");
const planOptions = [
  { value: "free", label: "Free", description: "Up to 3 projects, 1 GB storage." },
  { value: "pro", label: "Pro", description: "Unlimited projects, 50 GB storage." },
  { value: "team", label: "Team", description: "Everything in Pro + team collaboration." },
];

// 4. Per-item disabled
const diskValue = ref("ssd");
const diskOptions = [
  { value: "ssd", label: "SSD" },
  { value: "hdd", label: "HDD" },
  { value: "nvme", label: "NVMe", disabled: true },
];

// 5. Group disabled
const regionValue = ref("us-east");
const regionOptions = ["us-east", "us-west", "eu-central"];

// 6. Legend
const notifValue = ref("all");
const notifOptions = [
  { value: "all", label: "All notifications" },
  { value: "mentions", label: "Mentions only" },
  { value: "none", label: "None" },
];

// 7. Form integration (name + required)
const roleValue = ref("");
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];
function handleFormSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement);
  alert(`Submitted role: ${data.get("role")}`);
}
</script>

<template>
  <section id="radio-group">
    <h2 class="text-lg font-semibold mb-1">Radio Group</h2>
    <p class="text-sm mb-6 text-muted-foreground">Single selection from a group of options.</p>

    <div class="space-y-10">

      <!-- 1. Basic (vertical, string options) -->
      <div>
        <h3 class="text-sm font-medium mb-3">Basic</h3>
        <div class="rounded-lg border p-6 bg-accent flex gap-8 items-start">
          <RadioGroup v-model="basicValue" :options="sizeOptions">
            <template #item="{ value, isChecked }">
              <span class="rg-item" :class="isChecked ? 'rg-item--checked' : ''">
                <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                {{ value }}
              </span>
            </template>
          </RadioGroup>
          <p class="text-sm text-muted-foreground self-center">
            Selected: <span class="text-foreground font-medium">{{ basicValue }}</span>
          </p>
        </div>
      </div>

      <!-- 2. Horizontal -->
      <div>
        <h3 class="text-sm font-medium mb-3">Horizontal</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <RadioGroup v-model="themeValue" :options="themeOptions" orientation="horizontal" :ui="{ item: 'rg-chip' }">
            <template #item="{ value, isChecked }">
              {{ value }}
            </template>
          </RadioGroup>
          <p class="text-sm text-muted-foreground">
            Selected: <span class="text-foreground font-medium">{{ themeValue }}</span>
          </p>
        </div>
      </div>

      <!-- 3. Object options with label + description -->
      <div>
        <h3 class="text-sm font-medium mb-3">Object items — label + description</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <RadioGroup v-model="planValue" :options="planOptions" value-key="value">
            <template #item="{ label, description, isChecked }">
              <span class="rg-item rg-item--card" :class="isChecked ? 'rg-item--checked' : ''">
                <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                <span class="flex flex-col text-left">
                  <span class="text-sm font-medium">{{ label }}</span>
                  <span class="text-xs text-muted-foreground">{{ description }}</span>
                </span>
              </span>
            </template>
          </RadioGroup>
          <p class="text-sm text-muted-foreground">
            Selected: <span class="text-foreground font-medium">{{ planValue }}</span>
          </p>
        </div>
      </div>

      <!-- 4. Per-item disabled -->
      <div>
        <h3 class="text-sm font-medium mb-3">Per-item disabled</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <RadioGroup v-model="diskValue" :options="diskOptions" orientation="horizontal">
            <template #item="{ label, isChecked, isDisabled }">
              <span class="rg-item" :class="[isChecked ? 'rg-item--checked' : '', isDisabled ? 'rg-item--disabled' : '']">
                <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                {{ label }}
              </span>
            </template>
          </RadioGroup>
          <p class="text-xs text-muted-foreground">
            NVMe is disabled — arrow keys skip it.
          </p>
        </div>
      </div>

      <!-- 5. Group disabled -->
      <div>
        <h3 class="text-sm font-medium mb-3">Group disabled</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <RadioGroup v-model="regionValue" :options="regionOptions" orientation="horizontal" disabled>
            <template #item="{ value, isChecked, isDisabled }">
              <span class="rg-item" :class="[isChecked ? 'rg-item--checked' : '', isDisabled ? 'rg-item--disabled' : '']">
                <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                {{ value }}
              </span>
            </template>
          </RadioGroup>
        </div>
      </div>

      <!-- 6. Legend -->
      <div>
        <h3 class="text-sm font-medium mb-3">Legend</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <RadioGroup
            v-model="notifValue"
            :options="notifOptions"
            legend="Notifications"
            value-key="value"
            :ui="{ legend: 'rg-legend' }"
          >
            <template #item="{ label, isChecked }">
              <span class="rg-item" :class="isChecked ? 'rg-item--checked' : ''">
                <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                {{ label }}
              </span>
            </template>
          </RadioGroup>
          <p class="text-sm text-muted-foreground">
            Selected: <span class="text-foreground font-medium">{{ notifValue }}</span>
          </p>
        </div>
      </div>

      <!-- 7. Form integration -->
      <div>
        <h3 class="text-sm font-medium mb-3">Form integration</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <RadioGroup
              v-model="roleValue"
              :options="roleOptions"
              value-key="value"
              name="role"
              required
            >
              <template #item="{ label, isChecked }">
                <span class="rg-item" :class="isChecked ? 'rg-item--checked' : ''">
                  <span class="rg-dot" :class="isChecked ? 'rg-dot--checked' : ''" />
                  {{ label }}
                </span>
              </template>
            </RadioGroup>
            <button type="submit" class="rg-submit-btn">Submit</button>
          </form>
          <p class="text-xs text-muted-foreground mt-2">
            A hidden <code>&lt;input name="role"&gt;</code> carries the value on form submit.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<style>
/* ── Radio item base ───────────────────────────────────────────── */
.akaza-radio-group-item {
  all: unset;
  cursor: pointer;
  display: block;
}
.akaza-radio-group-item:focus-visible .rg-item {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: 2px;
  border-radius: 6px;
}
.akaza-radio-group-item[disabled] {
  cursor: not-allowed;
}

/* ── Item layout ───────────────────────────────────────────────── */
.rg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--foreground);
  transition: background 0.15s;
}
.rg-item:hover:not(.rg-item--disabled) {
  /* var(--muted) == canvas in dark mode; use muted-foreground at low opacity instead */
  background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
}
.rg-item--checked {
  color: var(--primary);
}
.rg-item--card {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--background);
  margin-bottom: 4px;
}
.rg-item--card.rg-item--checked {
  border-color: var(--primary);
  background: color-mix(in oklch, var(--primary) 8%, var(--background));
}
.rg-item--disabled {
  opacity: 0.4;
}

/* ── Dot indicator ─────────────────────────────────────────────── */
.rg-dot {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
}
.rg-dot--checked {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 3px var(--primary);
}

/* ── Chip variant (horizontal demo) ───────────────────────────── */
.rg-chip {
  all: unset;
  cursor: pointer;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  background: var(--background);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.rg-chip[aria-checked="true"] {
  background: var(--primary);
  color: var(--primary-foreground, #fff);
  border-color: var(--primary);
}
.rg-chip:focus-visible {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: 2px;
}

/* ── Legend ────────────────────────────────────────────────────── */
.rg-legend {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  margin-bottom: 8px;
}

/* ── Submit button ─────────────────────────────────────────────── */
.rg-submit-btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--primary);
  color: var(--primary-foreground, #fff);
  border: none;
  cursor: pointer;
}
.rg-submit-btn:hover {
  opacity: 0.9;
}
</style>
