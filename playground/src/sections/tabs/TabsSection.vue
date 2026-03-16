<script setup lang="ts">
import { ref } from "vue";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "akaza-ui";

const active = ref("overview");
const tabs = ["overview", "analytics", "settings"];
</script>

<template>
  <section id="tabs">
    <h2 class="text-lg font-semibold mb-1">Tabs</h2>
    <p class="text-sm mb-6 text-muted-foreground">Tabbed navigation with keyboard support.</p>
    <div class="rounded-lg border p-6 bg-accent">
      <Tabs v-model="active" class="w-full max-w-sm">
        <TabList class="demo-tab-list">
          <Tab
            v-for="tab in tabs"
            :key="tab"
            :value="tab"
            class="demo-tab"
            :class="active === tab ? 'demo-tab--active' : ''"
          >
            {{ tab }}
          </Tab>
        </TabList>
        <TabPanels class="demo-tab-panels">
          <TabPanel value="overview">
            <p class="text-sm text-muted-foreground">Overview tab content. Shows a summary of your data.</p>
          </TabPanel>
          <TabPanel value="analytics">
            <p class="text-sm text-muted-foreground">Analytics tab content. Detailed metrics and charts.</p>
          </TabPanel>
          <TabPanel value="settings">
            <p class="text-sm text-muted-foreground">Settings tab content. Configure your preferences.</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </section>
</template>

<style>
.demo-tab-list {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  --akaza-tab-indicator-color: var(--primary);
}

.demo-tab {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted-foreground);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  outline: none;
  text-transform: capitalize;
}

.demo-tab:hover {
  color: var(--foreground);
}

.demo-tab--active {
  color: var(--foreground);
}

.demo-tab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
  border-radius: 4px;
}

.demo-tab-panels {
  display: block;
}
</style>
