<script setup lang="ts">
import { ref } from "vue";
import { RadioGroup } from "akaza-ui";
import {
  buttonPrimary,
  canvas,
  canvasCol,
  canvasRow,
  exampleStack,
  exampleTitle,
  inlineCode,
  radioCard,
  radioChip,
  radioDot,
  radioItem,
  sectionDescriptionTight,
  sectionTitle,
} from "../styles";

const radioUi = {
  item: radioItem,
  indicator: radioDot,
  label: "text-sm font-medium text-foreground",
  description: "mt-1 text-xs text-muted-foreground",
};

const radioCardUi = {
  item: radioCard,
  indicator: radioDot,
  label: "text-sm font-medium text-foreground",
  description: "mt-1 text-xs text-muted-foreground",
};

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
    <h2 :class="sectionTitle">Radio Group</h2>
    <p :class="sectionDescriptionTight">Single selection from a group of options.</p>

    <div :class="exampleStack">

      <!-- 1. Basic (vertical, string options) -->
      <div>
        <h3 :class="exampleTitle">Basic</h3>
        <div :class="[canvasRow, 'items-start gap-8']">
          <RadioGroup v-model="basicValue" :options="sizeOptions" class="grid gap-1" :ui="radioUi" />
          <p class="text-sm text-muted-foreground self-center">
            Selected: <span class="text-foreground font-medium">{{ basicValue }}</span>
          </p>
        </div>
      </div>

      <!-- 2. Horizontal -->
      <div>
        <h3 :class="exampleTitle">Horizontal</h3>
        <div :class="canvasCol">
          <RadioGroup v-model="themeValue" :options="themeOptions" orientation="horizontal" class="flex flex-wrap gap-2" :ui="{ item: radioChip }">
            <template #item="{ value }">
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
        <h3 :class="exampleTitle">Object items — label + description</h3>
        <div :class="canvasCol">
          <RadioGroup v-model="planValue" :options="planOptions" value-key="value" class="grid gap-2" :ui="radioCardUi" />
          <p class="text-sm text-muted-foreground">
            Selected: <span class="text-foreground font-medium">{{ planValue }}</span>
          </p>
        </div>
      </div>

      <!-- 4. Per-item disabled -->
      <div>
        <h3 :class="exampleTitle">Per-item disabled</h3>
        <div :class="canvasCol">
          <RadioGroup v-model="diskValue" :options="diskOptions" orientation="horizontal" class="flex flex-wrap gap-2" :ui="radioUi" />
          <p class="text-xs text-muted-foreground">
            NVMe is disabled — arrow keys skip it.
          </p>
        </div>
      </div>

      <!-- 5. Group disabled -->
      <div>
        <h3 :class="exampleTitle">Group disabled</h3>
        <div :class="canvasCol">
          <RadioGroup v-model="regionValue" :options="regionOptions" orientation="horizontal" disabled class="flex flex-wrap gap-2" :ui="radioUi" />
        </div>
      </div>

      <!-- 6. Legend -->
      <div>
        <h3 :class="exampleTitle">Legend</h3>
        <div :class="canvasCol">
          <RadioGroup
            v-model="notifValue"
            :options="notifOptions"
            legend="Notifications"
            value-key="value"
            class="grid gap-1"
            :ui="{ ...radioUi, legend: 'mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground' }"
          />
          <p class="text-sm text-muted-foreground">
            Selected: <span class="text-foreground font-medium">{{ notifValue }}</span>
          </p>
        </div>
      </div>

      <!-- 7. Form integration -->
      <div>
        <h3 :class="exampleTitle">Form integration</h3>
        <div :class="canvas">
          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <RadioGroup
              v-model="roleValue"
              :options="roleOptions"
              value-key="value"
              name="role"
              required
              class="grid gap-1"
              :ui="radioUi"
            />
            <button type="submit" :class="buttonPrimary">Submit</button>
          </form>
          <p class="text-xs text-muted-foreground mt-2">
            A hidden <code :class="inlineCode">&lt;input name="role"&gt;</code> carries the value on form submit.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>
