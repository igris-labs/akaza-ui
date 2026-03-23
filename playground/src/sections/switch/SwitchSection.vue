<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "akaza-ui";

// 1. Basic
const basic = ref(false);

// 2. With label + description
const notifications = ref(true);
const marketing = ref(false);

// 3. Disabled
const disabledOn = ref(true);
const disabledOff = ref(false);

// 4. trueValue / falseValue (non-boolean model)
const status = ref<"active" | "inactive">("inactive");

// 5. #thumb slot (custom icon inside thumb)
const darkMode = ref(false);

// 6. value-change event (cancelable)
const guarded = ref(false);
const guardLog = ref("");

function handleGuardedChange(_val: boolean | string | number, details: { reason: string; cancel: () => void }) {
  if (guarded.value) {
    details.cancel();
    guardLog.value = "Cancelled — already on, cannot turn off.";
  } else {
    guardLog.value = "";
  }
}

// 7. Form integration
function handleFormSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement);
  alert(`notifications: ${data.get("notifications") ?? "(off)"}`);
}
</script>

<template>
  <section id="switch">
    <h2 class="text-lg font-semibold mb-1">Switch</h2>
    <p class="text-sm mb-6 text-muted-foreground">A toggle switch for boolean settings.</p>

    <div class="space-y-10">

      <!-- 1. Basic -->
      <div>
        <h3 class="text-sm font-medium mb-3">Basic</h3>
        <div class="rounded-lg border p-6 bg-accent flex items-center gap-4">
          <Switch v-model="basic" :ui="{ root: 'sw-track', thumb: 'sw-thumb' }" aria-label="Toggle feature" />
          <span class="text-sm text-muted-foreground">{{ basic ? "On" : "Off" }}</span>
        </div>
      </div>

      <!-- 2. Label + description -->
      <div>
        <h3 class="text-sm font-medium mb-3">Label + description</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-4">
          <Switch
            v-model="notifications"
            label="Push notifications"
            description="Receive alerts for important activity."
            :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label', description: 'sw-desc' }"
          />
          <Switch
            v-model="marketing"
            label="Marketing emails"
            description="Occasional product updates and offers."
            :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label', description: 'sw-desc' }"
          />
        </div>
      </div>

      <!-- 3. Disabled -->
      <div>
        <h3 class="text-sm font-medium mb-3">Disabled</h3>
        <div class="rounded-lg border p-6 bg-accent flex gap-6">
          <Switch
            v-model="disabledOn"
            disabled
            label="Enabled (locked on)"
            :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label' }"
          />
          <Switch
            v-model="disabledOff"
            disabled
            label="Disabled (locked off)"
            :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label' }"
          />
        </div>
      </div>

      <!-- 4. trueValue / falseValue -->
      <div>
        <h3 class="text-sm font-medium mb-3">trueValue / falseValue</h3>
        <div class="rounded-lg border p-6 bg-accent flex items-center gap-4">
          <Switch
            v-model="status"
            true-value="active"
            false-value="inactive"
            :ui="{ root: 'sw-track', thumb: 'sw-thumb' }"
            aria-label="Service status"
          />
          <span class="text-sm text-muted-foreground">
            Model value: <span class="font-medium text-foreground">{{ status }}</span>
          </span>
        </div>
      </div>

      <!-- 5. #thumb slot -->
      <div>
        <h3 class="text-sm font-medium mb-3">#thumb slot</h3>
        <div class="rounded-lg border p-6 bg-accent flex items-center gap-4">
          <Switch v-model="darkMode" :ui="{ root: 'sw-track sw-track--wide', thumb: 'sw-thumb' }" aria-label="Dark mode">
            <template #thumb="{ checked }">
              <span class="sw-thumb-icon">{{ checked ? "🌙" : "☀️" }}</span>
            </template>
          </Switch>
          <span class="text-sm text-muted-foreground">{{ darkMode ? "Dark" : "Light" }} mode</span>
        </div>
      </div>

      <!-- 6. value-change (cancelable) -->
      <div>
        <h3 class="text-sm font-medium mb-3">value-change event (cancelable)</h3>
        <div class="rounded-lg border p-6 bg-accent space-y-3">
          <Switch
            v-model="guarded"
            label="One-way latch"
            description="Can be turned on but not off."
            :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label', description: 'sw-desc' }"
            @value-change="handleGuardedChange"
          />
          <p v-if="guardLog" class="text-xs text-destructive">{{ guardLog }}</p>
        </div>
      </div>

      <!-- 7. Form integration -->
      <div>
        <h3 class="text-sm font-medium mb-3">Form integration</h3>
        <div class="rounded-lg border p-6 bg-accent">
          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <Switch
              v-model="notifications"
              name="notifications"
              label="Push notifications"
              :ui="{ root: 'sw-track', thumb: 'sw-thumb', label: 'sw-label' }"
            />
            <button type="submit" class="sw-submit-btn">Submit</button>
          </form>
          <p class="text-xs text-muted-foreground mt-2">
            A hidden <code>&lt;input type="checkbox" name="notifications"&gt;</code> carries the value on submit.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<style>
/* ── Track ─────────────────────────────────────────────────────── */
.sw-track {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  /* In dark mode --border == --accent (canvas), so use a blend that stays
     visibly distinct from the canvas background in both colour schemes. */
  background: color-mix(in oklch, var(--muted-foreground) 28%, var(--muted));
  border: none;
  padding: 2px;
  cursor: pointer;
  transition: background 0.2s;
}
.sw-track[data-akaza-state="checked"] {
  background: var(--primary);
}
.sw-track[data-akaza-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.sw-track:focus-visible {
  outline: 2px solid var(--ring, oklch(0.6 0.15 250));
  outline-offset: 2px;
}
.sw-track--wide {
  width: 52px;
}

/* ── Thumb ─────────────────────────────────────────────────────── */
.sw-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: var(--background);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  transform: translateX(0);
}
.sw-track[data-akaza-state="checked"] .sw-thumb {
  transform: translateX(20px);
}
.sw-track--wide[data-akaza-state="checked"] .sw-thumb {
  transform: translateX(28px);
}

.sw-thumb-icon {
  font-size: 12px;
  line-height: 1;
  user-select: none;
}

/* ── Label / description ───────────────────────────────────────── */
.sw-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  line-height: 1.4;
  cursor: default;
}
.sw-desc {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  line-height: 1.4;
}

/* ── Submit button ─────────────────────────────────────────────── */
.sw-submit-btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--primary);
  color: var(--primary-foreground, #fff);
  border: none;
  cursor: pointer;
}
.sw-submit-btn:hover {
  opacity: 0.9;
}
</style>
