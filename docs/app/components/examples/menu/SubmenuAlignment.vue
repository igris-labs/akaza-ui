<script setup lang="ts">
import type { MenuItem } from "akaza-ui";
import { Button } from "../../ui/button";
import { Menu } from "../../ui/menu";

const items: MenuItem[] = [
  {
    label: "Theme",
    value: "theme",
    submenu: { anchor: "trigger", align: "start", sideOffset: 9 },
    children: [{ label: "Light" }, { label: "Dark" }, { label: "System" }],
  },
  {
    label: "Help",
    value: "help",
    submenu: { anchor: "trigger", align: "start", sideOffset: 9 },
    children: [{ label: "Documentation" }, { label: "Support" }],
  },
  { label: "Profile" },
  { label: "Sign out" },
];
</script>

<template>
  <Menu
    :items="items"
    teleport="body"
    :ui="{ submenuContent: 'data-[akaza-side=left]:ml-0 data-[akaza-side=right]:ml-0' }"
  >
    <template #trigger="{ toggle, triggerProps }">
      <Button
        variant="outline"
        v-bind="triggerProps"
        @click="toggle"
      >
        Aligned account menu
      </Button>
    </template>
  </Menu>
</template>
