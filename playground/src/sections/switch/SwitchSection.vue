<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "akaza-ui";
import {
  buttonPrimary,
  canvas,
  canvasCol,
  canvasRow,
  exampleStack,
  exampleTitle,
  inlineCode,
  sectionDescriptionTight,
  sectionTitle,
  switchUi,
  switchUiWide,
} from "../styles";

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
    <h2 :class="sectionTitle">Switch</h2>
    <p :class="sectionDescriptionTight">A toggle switch for boolean settings.</p>

    <div :class="exampleStack">

      <!-- 1. Basic -->
      <div>
        <h3 :class="exampleTitle">Basic</h3>
        <div :class="canvasRow">
          <Switch v-model="basic" :ui="switchUi" aria-label="Toggle feature" />
          <span class="text-sm text-muted-foreground">{{ basic ? "On" : "Off" }}</span>
        </div>
      </div>

      <!-- 2. Label + description -->
      <div>
        <h3 :class="exampleTitle">Label + description</h3>
        <div :class="canvasCol">
          <Switch
            v-model="notifications"
            label="Push notifications"
            description="Receive alerts for important activity."
            :ui="switchUi"
          />
          <Switch
            v-model="marketing"
            label="Marketing emails"
            description="Occasional product updates and offers."
            :ui="switchUi"
          />
        </div>
      </div>

      <!-- 3. Disabled -->
      <div>
        <h3 :class="exampleTitle">Disabled</h3>
        <div :class="canvasRow">
          <Switch
            v-model="disabledOn"
            disabled
            label="Enabled (locked on)"
            :ui="switchUi"
          />
          <Switch
            v-model="disabledOff"
            disabled
            label="Disabled (locked off)"
            :ui="switchUi"
          />
        </div>
      </div>

      <!-- 4. trueValue / falseValue -->
      <div>
        <h3 :class="exampleTitle">trueValue / falseValue</h3>
        <div :class="canvasRow">
          <Switch
            v-model="status"
            true-value="active"
            false-value="inactive"
            :ui="switchUi"
            aria-label="Service status"
          />
          <span class="text-sm text-muted-foreground">
            Model value: <span class="font-medium text-foreground">{{ status }}</span>
          </span>
        </div>
      </div>

      <!-- 5. #thumb slot -->
      <div>
        <h3 :class="exampleTitle">#thumb slot</h3>
        <div :class="canvasRow">
          <Switch v-model="darkMode" :ui="switchUiWide" aria-label="Dark mode">
            <template #thumb="{ checked }">
              <span class="select-none text-[11px] leading-none">{{ checked ? "🌙" : "☀️" }}</span>
            </template>
          </Switch>
          <span class="text-sm text-muted-foreground">{{ darkMode ? "Dark" : "Light" }} mode</span>
        </div>
      </div>

      <!-- 6. value-change (cancelable) -->
      <div>
        <h3 :class="exampleTitle">value-change event (cancelable)</h3>
        <div :class="canvasCol">
          <Switch
            v-model="guarded"
            label="One-way latch"
            description="Can be turned on but not off."
            :ui="switchUi"
            @value-change="handleGuardedChange"
          />
          <p v-if="guardLog" class="text-xs text-destructive">{{ guardLog }}</p>
        </div>
      </div>

      <!-- 7. Form integration -->
      <div>
        <h3 :class="exampleTitle">Form integration</h3>
        <div :class="canvas">
          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <Switch
              v-model="notifications"
              name="notifications"
              label="Push notifications"
              :ui="switchUi"
            />
            <button type="submit" :class="buttonPrimary">Submit</button>
          </form>
          <p class="text-xs text-muted-foreground mt-2">
            A hidden <code :class="inlineCode">&lt;input type="checkbox" name="notifications"&gt;</code> carries the value on submit.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>
