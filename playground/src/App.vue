<script setup lang="ts">
import { ref } from "vue";
import { Separator, OverlayProvider } from "akaza-ui";
import ButtonSection from "./sections/button/ButtonSection.vue";
import ToggleSection from "./sections/toggle/ToggleSection.vue";
import SwitchSection from "./sections/switch/SwitchSection.vue";
import CheckboxSection from "./sections/checkbox/CheckboxSection.vue";
import RadioGroupSection from "./sections/radio-group/RadioGroupSection.vue";
import AvatarSection from "./sections/avatar/AvatarSection.vue";
import SeparatorSection from "./sections/separator/SeparatorSection.vue";
import ProgressSection from "./sections/progress/ProgressSection.vue";
import CollapsibleSection from "./sections/collapsible/CollapsibleSection.vue";
import AccordionSection from "./sections/accordion/AccordionSection.vue";
import TooltipSection from "./sections/tooltip/TooltipSection.vue";
import PopoverSection from "./sections/popover/PopoverSection.vue";
import DialogSection from "./sections/dialog/DialogSection.vue";
import AlertDialogSection from "./sections/alert-dialog/AlertDialogSection.vue";
import DrawerSection from "./sections/drawer/DrawerSection.vue";
import MenuSection from "./sections/menu/MenuSection.vue";
import TabsSection from "./sections/tabs/TabsSection.vue";
import OverlaySection from "./sections/overlay/OverlaySection.vue";

const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
}

const sections = [
  {
    id: "inputs",
    label: "Inputs",
    items: ["button", "toggle", "switch", "checkbox", "radio-group"],
  },
  { id: "display", label: "Display", items: ["avatar", "separator", "progress"] },
  { id: "disclosure", label: "Disclosure", items: ["collapsible", "accordion"] },
  {
    id: "overlay",
    label: "Overlay",
    items: ["tooltip", "popover", "dialog", "alert-dialog", "drawer", "menu"],
  },
  { id: "navigation", label: "Navigation", items: ["tabs"] },
  { id: "programmatic", label: "Programmatic", items: ["overlay"] },
];
</script>

<template>
  <div class="w-full min-h-screen flex flex-col" :class="{ dark: isDark }">
    <header
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-background"
    >
      <div class="flex items-center gap-3">
        <a
          href="/"
          class="font-semibold tracking-tight text-foreground cursor-pointer"
          style="font-size: 15px"
        >
          Akaza UI
        </a>
        <span class="text-xs text-muted-foreground">Playground</span>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-muted text-muted-foreground hover:bg-accent transition-colors"
        @click="toggleTheme"
      >
        {{ isDark ? "☀ Light" : "⏾ Dark" }}
      </button>
    </header>

    <div class="flex mt-14">
      <aside
        class="hidden md:flex flex-col w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4 border-r border-border"
      >
        <nav class="flex flex-col gap-5">
          <div v-for="section in sections" :key="section.id">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {{ section.label }}
            </p>
            <ul class="flex flex-col gap-0.5">
              <li v-for="item in section.items" :key="item">
                <a
                  :href="`#${item}`"
                  class="block px-2 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors capitalize"
                >
                  {{ item.replace("-", " ") }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main class="flex-1 px-6 lg:px-12 py-10 max-w-3xl space-y-16">
        <ButtonSection />
        <Separator class="border-t border-border" />
        <ToggleSection />
        <Separator class="border-t border-border" />
        <SwitchSection />
        <Separator class="border-t border-border" />
        <CheckboxSection />
        <Separator class="border-t border-border" />
        <RadioGroupSection />
        <Separator class="border-t border-border" />
        <AvatarSection />
        <Separator class="border-t border-border" />
        <SeparatorSection />
        <Separator class="border-t border-border" />
        <ProgressSection />
        <Separator class="border-t border-border" />
        <CollapsibleSection />
        <Separator class="border-t border-border" />
        <AccordionSection />
        <Separator class="border-t border-border" />
        <TooltipSection />
        <Separator class="border-t border-border" />
        <PopoverSection />
        <Separator class="border-t border-border" />
        <DialogSection />
        <Separator class="border-t border-border" />
        <AlertDialogSection />
        <Separator class="border-t border-border" />
        <DrawerSection />
        <Separator class="border-t border-border" />
        <MenuSection />
        <Separator class="border-t border-border" />
        <TabsSection />
        <Separator class="border-t border-border" />
        <OverlaySection />
      </main>
      <OverlayProvider />
    </div>
  </div>
</template>

<style scoped></style>
