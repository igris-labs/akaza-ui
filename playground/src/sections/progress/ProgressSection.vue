<script setup lang="ts">
import { computed, ref } from "vue";
import { Progress } from "akaza-ui";

// 1. Basic
const basicValue = ref(40);

// 2. Controlled
const controlledValue = ref(65);

// 3. Indeterminate
const isIndeterminate = ref(true);
const determinateValue = ref(50);
const indeterminateModel = computed({
  get: () => isIndeterminate.value ? null : determinateValue.value,
  set: (v) => { if (v !== null) determinateValue.value = v; },
});

// 4. Complete state
const completeValue = ref(100);

// 5. Orientation — vertical
const verticalValue = ref(60);

// 6. Custom min/max
const customMin = 200;
const customMax = 1000;
const customValue = ref(500);

// 7. getValueLabel (aria-valuetext)
const stepsValue = ref(3);
const stepsMax = 5;

// 8. Indicator slot override
const slotValue = ref(72);
</script>

<template>
  <section id="progress">
    <h2 class="text-lg font-semibold mb-1">Progress</h2>
    <p class="text-sm mb-6 text-muted-foreground">Shows completion of a task or operation.</p>

    <div class="space-y-10">

      <!-- 1. Basic -->
      <div>
        <h3 class="text-sm font-medium mb-3">Basic</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="basicValue"
            aria-label="File upload"
            :ui="{ root: 'pg-track', indicator: 'pg-bar' }"
          />
          <div class="flex gap-2">
            <button class="pg-btn" @click="basicValue = Math.max(0, basicValue - 10)">-10</button>
            <button class="pg-btn" @click="basicValue = Math.min(100, basicValue + 10)">+10</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ basicValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 2. Controlled (explicit v-model) -->
      <div>
        <h3 class="text-sm font-medium mb-3">Controlled</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="controlledValue"
            aria-label="Upload progress"
            :ui="{ root: 'pg-track', indicator: 'pg-bar' }"
          />
          <div class="flex gap-2">
            <button class="pg-btn" @click="controlledValue = Math.max(0, controlledValue - 10)">-10</button>
            <button class="pg-btn" @click="controlledValue = Math.min(100, controlledValue + 10)">+10</button>
            <button class="pg-btn" @click="controlledValue = 0">Reset</button>
            <button class="pg-btn" @click="controlledValue = 100">Complete</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ controlledValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 3. Indeterminate -->
      <div>
        <h3 class="text-sm font-medium mb-3">Indeterminate</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="indeterminateModel"
            aria-label="Loading"
            :ui="{ root: 'pg-track', indicator: isIndeterminate ? 'pg-bar pg-bar--indeterminate' : 'pg-bar' }"
          />
          <div class="flex gap-2 flex-wrap">
            <button class="pg-btn" @click="isIndeterminate = !isIndeterminate">
              {{ isIndeterminate ? 'Set determinate' : 'Set indeterminate' }}
            </button>
            <template v-if="!isIndeterminate">
              <button class="pg-btn" @click="determinateValue = Math.max(0, determinateValue - 10)">-10</button>
              <button class="pg-btn" @click="determinateValue = Math.min(100, determinateValue + 10)">+10</button>
              <span class="text-sm text-muted-foreground self-center ml-auto">{{ determinateValue }}%</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 4. Complete state -->
      <div>
        <h3 class="text-sm font-medium mb-3">Complete state</h3>
        <div class="rounded-lg border p-6 bg-accent max-w-sm">
          <Progress
            v-model="completeValue"
            aria-label="Installation complete"
            :ui="{ root: 'pg-track', indicator: 'pg-bar pg-bar--complete' }"
          />
          <p class="text-xs text-muted-foreground mt-2">
            <code>data-akaza-state="complete"</code> when value &ge; max
          </p>
        </div>
      </div>

      <!-- 5. Vertical orientation -->
      <div>
        <h3 class="text-sm font-medium mb-3">Vertical orientation</h3>
        <div class="rounded-lg border p-6 bg-accent flex items-end gap-6">
          <Progress
            v-model="verticalValue"
            orientation="vertical"
            aria-label="Storage used"
            :ui="{ root: 'pg-track-v', indicator: 'pg-bar-v' }"
          />
          <div class="flex flex-col gap-2">
            <button class="pg-btn" @click="verticalValue = Math.min(100, verticalValue + 10)">+10</button>
            <button class="pg-btn" @click="verticalValue = Math.max(0, verticalValue - 10)">-10</button>
            <span class="text-sm text-muted-foreground text-center">{{ verticalValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 6. Custom min/max -->
      <div>
        <h3 class="text-sm font-medium mb-3">Custom min / max</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="customValue"
            :min="customMin"
            :max="customMax"
            aria-label="Download speed"
            :ui="{ root: 'pg-track', indicator: 'pg-bar' }"
          />
          <div class="flex gap-2">
            <button class="pg-btn" @click="customValue = Math.max(customMin, customValue - 100)">-100</button>
            <button class="pg-btn" @click="customValue = Math.min(customMax, customValue + 100)">+100</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ customValue }} / {{ customMax }}</span>
          </div>
          <p class="text-xs text-muted-foreground">min={{ customMin }}, max={{ customMax }} — {{ Math.round(((customValue - customMin) / (customMax - customMin)) * 100) }}%</p>
        </div>
      </div>

      <!-- 7. getValueLabel -->
      <div>
        <h3 class="text-sm font-medium mb-3">getValueLabel (aria-valuetext)</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="stepsValue"
            :max="stepsMax"
            aria-label="Onboarding steps"
            :get-value-label="(v, m) => v !== null ? `Step ${v} of ${m}` : 'Not started'"
            :ui="{ root: 'pg-track', indicator: 'pg-bar' }"
          />
          <div class="flex gap-2">
            <button class="pg-btn" @click="stepsValue = Math.max(0, stepsValue - 1)">Prev</button>
            <button class="pg-btn" @click="stepsValue = Math.min(stepsMax, stepsValue + 1)">Next</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">Step {{ stepsValue }} of {{ stepsMax }}</span>
          </div>
          <p class="text-xs text-muted-foreground">Screen reader reads: "Step {{ stepsValue }} of {{ stepsMax }}"</p>
        </div>
      </div>

      <!-- 8. #indicator slot override -->
      <div>
        <h3 class="text-sm font-medium mb-3">#indicator slot</h3>
        <div class="rounded-lg border p-6 space-y-4 bg-accent max-w-sm">
          <Progress
            v-model="slotValue"
            aria-label="Custom render"
            :ui="{ root: 'pg-track pg-track--striped' }"
          >
            <template #indicator="{ percentage, state }">
              <div
                class="pg-bar pg-bar--striped"
                :style="{ width: `${percentage}%` }"
                :data-state="state"
              />
            </template>
          </Progress>
          <div class="flex gap-2">
            <button class="pg-btn" @click="slotValue = Math.max(0, slotValue - 10)">-10</button>
            <button class="pg-btn" @click="slotValue = Math.min(100, slotValue + 10)">+10</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ slotValue }}%</span>
          </div>
          <p class="text-xs text-muted-foreground">Slot sets <code>width</code> directly — bypasses CSS variable.</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style>
/* Track (horizontal) */
.pg-track {
  width: 100%;
  height: 8px;
  border-radius: 9999px;
  background: var(--muted);
  overflow: hidden;
}

/* Bar (horizontal) — uses CSS variable set by component */
.pg-bar {
  height: 100%;
  border-radius: 9999px;
  background: var(--primary);
  width: var(--akaza-progress-percentage, 0%);
  transition: width 0.3s ease;
}

.pg-bar--indeterminate {
  width: 40% !important;
  animation: pg-indeterminate 1.4s ease-in-out infinite;
}

.pg-bar--complete {
  background: var(--success, oklch(0.6 0.18 150));
}

/* Track (vertical) */
.pg-track-v {
  width: 8px;
  height: 80px;
  border-radius: 9999px;
  background: var(--muted);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* Bar (vertical) — uses same CSS variable but for height */
.pg-bar-v {
  width: 100%;
  border-radius: 9999px;
  background: var(--primary);
  height: var(--akaza-progress-percentage, 0%);
  transition: height 0.3s ease;
}

/* Striped variant (slot demo) */
.pg-track--striped {
  background: var(--muted);
}

.pg-bar--striped {
  height: 100%;
  border-radius: 9999px;
  background: repeating-linear-gradient(
    -45deg,
    var(--primary),
    var(--primary) 6px,
    color-mix(in oklch, var(--primary) 70%, transparent) 6px,
    color-mix(in oklch, var(--primary) 70%, transparent) 12px
  );
  transition: width 0.3s ease;
}

@keyframes pg-indeterminate {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

.pg-btn {
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid var(--border);
  background: var(--background);
  cursor: pointer;
}
.pg-btn:hover {
  background: var(--muted);
}
</style>
