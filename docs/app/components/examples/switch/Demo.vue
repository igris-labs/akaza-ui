<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "../../ui/switch";

const notifications = ref(true);
const darkMode = ref(false);
const sound = ref(false);
</script>

<template>
  <div class="flex flex-col gap-5">
    <Switch
      v-model="notifications"
      label="Email notifications"
      description="Receive updates about your account."
    />

    <Switch
      v-model="darkMode"
      label="Dark mode"
      description="Apply a dark theme to the interface."
    />

    <Switch
      v-model="sound"
      label="Sound effects"
      description="Play sounds for actions and alerts."
    />
  </div>
</template>
