<script setup lang="ts">
import { ref } from "vue";
import { Menu, MenuItem, MenuSeparator } from "akaza-ui";

const open = ref(false);
</script>

<template>
  <section id="menu">
    <h2 class="text-lg font-semibold mb-1">Menu</h2>
    <p class="text-sm mb-6 text-muted-foreground">A dropdown menu with keyboard navigation.</p>
    <div class="rounded-lg border p-6 bg-accent">
      <Menu v-model="open" :ui="{ content: 'demo-menu' }">
        <template #trigger="{ toggle, isOpen }">
          <button
            class="demo-menu-trigger"
            @click="toggle"
          >
            Open Menu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              :style="isOpen ? 'transform: rotate(180deg)' : ''"
              style="transition: transform 0.15s ease; flex-shrink: 0;"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </template>
        <template #content="{ close }">
          <MenuItem class="demo-menu-item" @select="close">Profile</MenuItem>
          <MenuItem class="demo-menu-item" @select="close">Settings</MenuItem>
          <MenuSeparator class="demo-menu-separator" />
          <MenuItem class="demo-menu-item demo-menu-item--danger" @select="close">Sign out</MenuItem>
        </template>
      </Menu>
    </div>
  </section>
</template>

<style>
.demo-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s;
}
.demo-menu-trigger:hover {
  background: var(--muted);
}
.demo-menu {
  position: absolute;
  z-index: 50;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
}
.demo-menu-separator {
  height: 1px;
  background: var(--border);
  margin: 4px 2px;
}
.demo-menu-item {
  display: block;
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  background: transparent;
  border: none;
  color: inherit;
  outline: none;
}
.demo-menu-item:hover,
.demo-menu-item:focus {
  background: var(--accent);
}
.demo-menu-item--danger {
  color: var(--destructive, #ef4444);
}
</style>
