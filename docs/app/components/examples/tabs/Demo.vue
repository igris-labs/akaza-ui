<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "../../ui/tabs";

const tabs = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "notifications", label: "Notifications" },
];
const active = ref("account");
</script>

<template>
  <div class="w-full max-w-sm">
    <Tabs
      v-model="active"
      :items="tabs"
    >
      <template #panel-account>
        <div class="flex flex-col gap-2 rounded-xl border border-border bg-background p-4">
          <p class="text-sm font-medium text-foreground">Account settings</p>
          <p class="text-xs text-muted-foreground">Manage your name, email, and profile picture.</p>
        </div>
      </template>

      <template #panel-security>
        <div class="flex flex-col gap-2 rounded-xl border border-border bg-background p-4">
          <p class="text-sm font-medium text-foreground">Security settings</p>
          <p class="text-xs text-muted-foreground">
            Change your password and enable two-factor authentication.
          </p>
        </div>
      </template>

      <template #panel-notifications>
        <div class="flex flex-col gap-2 rounded-xl border border-border bg-background p-4">
          <p class="text-sm font-medium text-foreground">Notification preferences</p>
          <p class="text-xs text-muted-foreground">Choose what you want to be notified about.</p>
        </div>
      </template>
    </Tabs>
  </div>
</template>
