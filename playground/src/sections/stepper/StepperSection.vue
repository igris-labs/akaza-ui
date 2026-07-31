<script setup lang="ts">
import { Stepper } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  sectionDescription,
  sectionTitle,
  stepperUi,
  stepperVerticalUi,
} from "../styles";

const linearStep = ref(1);
const freeStep = ref("account");
const steps = [
  { value: 1, title: "Account", description: "Identity", content: "Collect account details." },
  { value: 2, title: "Workspace", description: "Configuration", content: "Configure workspace defaults." },
  { value: 3, title: "Review", description: "Confirm", content: "Review and submit the request." },
];
const verticalSteps = [
  { value: "account", title: "Account", description: "Complete", completed: true, content: "Account is ready." },
  { value: "profile", title: "Profile", description: "Optional", optional: true, content: "Add optional profile details." },
  { value: "security", title: "Security", description: "Locked", disabled: true, content: "Security is unavailable." },
];
</script>

<template>
  <section id="stepper">
    <h2 :class="sectionTitle">Stepper</h2>
    <p :class="sectionDescription">
      Multi-step progress and navigation with linear rules, roving focus, panels, controls, and item metadata.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Linear flow + panels</h3>
        <div :class="canvasCol">
          <Stepper v-model="linearStep" :items="steps" show-controls :ui="stepperUi" />
          <code :class="codePill">active step: {{ linearStep }}</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Non-linear automatic activation</h3>
        <div :class="canvasCol">
          <Stepper
            v-model="linearStep"
            :items="steps"
            :linear="false"
            activation-mode="automatic"
            loop
            :ui="stepperUi"
          />
          <p class="text-xs text-muted-foreground">Arrow focus also activates. Any enabled step can be selected.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Vertical + item states</h3>
        <div :class="[canvasGrid, 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]']">
          <Stepper v-model="freeStep" :items="verticalSteps" :linear="false" orientation="vertical" :ui="stepperVerticalUi" />
          <code :class="codePill">active: {{ freeStep }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
