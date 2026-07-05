<script setup lang="ts">
import { computed, ref } from "vue";
import { Progress } from "akaza-ui";
import {
  buttonGhost,
  canvasCol,
  canvasRow,
  exampleStack,
  exampleTitle,
  inlineCode,
  progressBar,
  progressBarVertical,
  progressTrack,
  progressTrackVertical,
  sectionDescriptionTight,
  sectionTitle,
} from "../styles";

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
    <h2 :class="sectionTitle">Progress</h2>
    <p :class="sectionDescriptionTight">Shows completion of a task or operation.</p>

    <div :class="exampleStack">

      <!-- 1. Basic -->
      <div>
        <h3 :class="exampleTitle">Basic</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="basicValue"
            aria-label="File upload"
            :ui="{ root: progressTrack, indicator: progressBar }"
          />
          <div class="flex gap-2">
            <button :class="buttonGhost" @click="basicValue = Math.max(0, basicValue - 10)">-10</button>
            <button :class="buttonGhost" @click="basicValue = Math.min(100, basicValue + 10)">+10</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ basicValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 2. Controlled (explicit v-model) -->
      <div>
        <h3 :class="exampleTitle">Controlled</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="controlledValue"
            aria-label="Upload progress"
            :ui="{ root: progressTrack, indicator: progressBar }"
          />
          <div class="flex gap-2">
            <button :class="buttonGhost" @click="controlledValue = Math.max(0, controlledValue - 10)">-10</button>
            <button :class="buttonGhost" @click="controlledValue = Math.min(100, controlledValue + 10)">+10</button>
            <button :class="buttonGhost" @click="controlledValue = 0">Reset</button>
            <button :class="buttonGhost" @click="controlledValue = 100">Complete</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ controlledValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 3. Indeterminate -->
      <div>
        <h3 :class="exampleTitle">Indeterminate</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="indeterminateModel"
            aria-label="Loading"
            :ui="{ root: progressTrack, indicator: isIndeterminate ? '!h-full !w-2/5 animate-pulse rounded-full bg-primary' : progressBar }"
          />
          <div class="flex gap-2 flex-wrap">
            <button :class="buttonGhost" @click="isIndeterminate = !isIndeterminate">
              {{ isIndeterminate ? 'Set determinate' : 'Set indeterminate' }}
            </button>
            <template v-if="!isIndeterminate">
              <button :class="buttonGhost" @click="determinateValue = Math.max(0, determinateValue - 10)">-10</button>
              <button :class="buttonGhost" @click="determinateValue = Math.min(100, determinateValue + 10)">+10</button>
              <span class="text-sm text-muted-foreground self-center ml-auto">{{ determinateValue }}%</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 4. Complete state -->
      <div>
        <h3 :class="exampleTitle">Complete state</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="completeValue"
            aria-label="Installation complete"
            :ui="{ root: progressTrack, indicator: progressBar }"
          />
          <p class="text-xs text-muted-foreground mt-2">
            <code :class="inlineCode">data-akaza-state="complete"</code> when value &ge; max
          </p>
        </div>
      </div>

      <!-- 5. Vertical orientation -->
      <div>
        <h3 :class="exampleTitle">Vertical orientation</h3>
        <div :class="[canvasRow, 'items-end gap-6']">
          <Progress
            v-model="verticalValue"
            orientation="vertical"
            aria-label="Storage used"
            :ui="{ root: progressTrackVertical, indicator: progressBarVertical }"
          />
          <div class="flex flex-col gap-2">
            <button :class="buttonGhost" @click="verticalValue = Math.min(100, verticalValue + 10)">+10</button>
            <button :class="buttonGhost" @click="verticalValue = Math.max(0, verticalValue - 10)">-10</button>
            <span class="text-sm text-muted-foreground text-center">{{ verticalValue }}%</span>
          </div>
        </div>
      </div>

      <!-- 6. Custom min/max -->
      <div>
        <h3 :class="exampleTitle">Custom min / max</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="customValue"
            :min="customMin"
            :max="customMax"
            aria-label="Download speed"
            :ui="{ root: progressTrack, indicator: progressBar }"
          />
          <div class="flex gap-2">
            <button :class="buttonGhost" @click="customValue = Math.max(customMin, customValue - 100)">-100</button>
            <button :class="buttonGhost" @click="customValue = Math.min(customMax, customValue + 100)">+100</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ customValue }} / {{ customMax }}</span>
          </div>
          <p class="text-xs text-muted-foreground">min={{ customMin }}, max={{ customMax }} — {{ Math.round(((customValue - customMin) / (customMax - customMin)) * 100) }}%</p>
        </div>
      </div>

      <!-- 7. getValueLabel -->
      <div>
        <h3 :class="exampleTitle">getValueLabel (aria-valuetext)</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="stepsValue"
            :max="stepsMax"
            aria-label="Onboarding steps"
            :get-value-label="(v, m) => v !== null ? `Step ${v} of ${m}` : 'Not started'"
            :ui="{ root: progressTrack, indicator: progressBar }"
          />
          <div class="flex gap-2">
            <button :class="buttonGhost" @click="stepsValue = Math.max(0, stepsValue - 1)">Prev</button>
            <button :class="buttonGhost" @click="stepsValue = Math.min(stepsMax, stepsValue + 1)">Next</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">Step {{ stepsValue }} of {{ stepsMax }}</span>
          </div>
          <p class="text-xs text-muted-foreground">Screen reader reads: "Step {{ stepsValue }} of {{ stepsMax }}"</p>
        </div>
      </div>

      <!-- 8. #indicator slot override -->
      <div>
        <h3 :class="exampleTitle">#indicator slot</h3>
        <div :class="[canvasCol, 'max-w-sm']">
          <Progress
            v-model="slotValue"
            aria-label="Custom render"
            :ui="{ root: progressTrack }"
          >
            <template #indicator="{ percentage, state }">
              <div
                class="h-full rounded-full bg-primary/80 transition-[width] duration-200"
                :style="{ width: `${percentage}%` }"
                :data-state="state"
              />
            </template>
          </Progress>
          <div class="flex gap-2">
            <button :class="buttonGhost" @click="slotValue = Math.max(0, slotValue - 10)">-10</button>
            <button :class="buttonGhost" @click="slotValue = Math.min(100, slotValue + 10)">+10</button>
            <span class="text-sm text-muted-foreground self-center ml-auto">{{ slotValue }}%</span>
          </div>
          <p class="text-xs text-muted-foreground">Slot sets <code :class="inlineCode">width</code> directly — bypasses CSS variable.</p>
        </div>
      </div>

    </div>
  </section>
</template>
