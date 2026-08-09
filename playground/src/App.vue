<script setup lang="ts">
import type { ComboboxModelValue } from "akaza-ui";
import { ref } from "vue";
import { Combobox, OverlayProvider, Separator } from "akaza-ui";
import ButtonSection from "./sections/button/ButtonSection.vue";
import ToggleSection from "./sections/toggle/ToggleSection.vue";
import SwitchSection from "./sections/switch/SwitchSection.vue";
import CheckboxSection from "./sections/checkbox/CheckboxSection.vue";
import CheckboxGroupSection from "./sections/checkbox-group/CheckboxGroupSection.vue";
import RadioGroupSection from "./sections/radio-group/RadioGroupSection.vue";
import FieldSection from "./sections/field/FieldSection.vue";
import FieldsetSection from "./sections/fieldset/FieldsetSection.vue";
import FormSection from "./sections/form/FormSection.vue";
import InputSection from "./sections/input/InputSection.vue";
import SelectSection from "./sections/select/SelectSection.vue";
import ListboxSection from "./sections/listbox/ListboxSection.vue";
import MonthPickerSection from "./sections/month-picker/MonthPickerSection.vue";
import MonthRangePickerSection from "./sections/month-range-picker/MonthRangePickerSection.vue";
import ComboboxSection from "./sections/combobox/ComboboxSection.vue";
import PinInputSection from "./sections/pin-input/PinInputSection.vue";
import TagsInputSection from "./sections/tags-input/TagsInputSection.vue";
import EditableSection from "./sections/editable/EditableSection.vue";
import RatingSection from "./sections/rating/RatingSection.vue";
import StepperSection from "./sections/stepper/StepperSection.vue";
import NumberFieldSection from "./sections/number-field/NumberFieldSection.vue";
import CalendarSection from "./sections/calendar/CalendarSection.vue";
import DateFieldSection from "./sections/date-field/DateFieldSection.vue";
import DateRangeFieldSection from "./sections/date-range-field/DateRangeFieldSection.vue";
import DateRangePickerSection from "./sections/date-range-picker/DateRangePickerSection.vue";
import SliderSection from "./sections/slider/SliderSection.vue";
import AvatarSection from "./sections/avatar/AvatarSection.vue";
import SeparatorSection from "./sections/separator/SeparatorSection.vue";
import MeterSection from "./sections/meter/MeterSection.vue";
import ProgressSection from "./sections/progress/ProgressSection.vue";
import CollapsibleSection from "./sections/collapsible/CollapsibleSection.vue";
import AccordionSection from "./sections/accordion/AccordionSection.vue";
import TooltipSection from "./sections/tooltip/TooltipSection.vue";
import PopoverSection from "./sections/popover/PopoverSection.vue";
import DialogSection from "./sections/dialog/DialogSection.vue";
import AlertDialogSection from "./sections/alert-dialog/AlertDialogSection.vue";
import DrawerSection from "./sections/drawer/DrawerSection.vue";
import MenuSection from "./sections/menu/MenuSection.vue";
import ContextMenuSection from "./sections/context-menu/ContextMenuSection.vue";
import MenubarSection from "./sections/menubar/MenubarSection.vue";
import NavigationMenuSection from "./sections/navigation-menu/NavigationMenuSection.vue";
import TabsSection from "./sections/tabs/TabsSection.vue";
import ToggleGroupSection from "./sections/toggle-group/ToggleGroupSection.vue";
import ToolbarSection from "./sections/toolbar/ToolbarSection.vue";
import ToastSection from "./sections/toast/ToastSection.vue";
import TimeFieldSection from "./sections/time-field/TimeFieldSection.vue";
import TimeRangeFieldSection from "./sections/time-range-field/TimeRangeFieldSection.vue";
import HoverPreviewCardSection from "./sections/hover-preview-card/HoverPreviewCardSection.vue";
import PaginationSection from "./sections/pagination/PaginationSection.vue";
import OverlaySection from "./sections/overlay/OverlaySection.vue";
import YearPickerSection from "./sections/year-picker/YearPickerSection.vue";
import YearRangePickerSection from "./sections/year-range-picker/YearRangePickerSection.vue";

const isDark = ref(false);
const selectedComponent = ref("");
const searchQuery = ref("");

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
}

const sections = [
  { id: "disclosure", label: "Disclosure", items: ["accordion", "collapsible"] },
  { id: "display", label: "Display", items: ["avatar", "meter", "progress", "separator", "toast"] },
  {
    id: "inputs",
    label: "Inputs",
    items: [
      "button",
      "calendar",
      "checkbox",
      "checkbox-group",
      "combobox",
      "date-field",
      "date-range-field",
      "date-range-picker",
      "editable",
      "field",
      "fieldset",
      "form",
      "input",
      "listbox",
      "month-picker",
      "month-range-picker",
      "number-field",
      "pin-input",
      "radio-group",
      "rating",
      "select",
      "slider",
      "stepper",
      "switch",
      "tags-input",
      "time-field",
      "time-range-field",
      "toggle",
      "toggle-group",
      "year-picker",
      "year-range-picker",
    ],
  },
  { id: "navigation", label: "Navigation", items: ["menubar", "navigation-menu", "pagination", "tabs", "toolbar"] },
  {
    id: "overlay",
    label: "Overlay",
    items: ["alert-dialog", "context-menu", "dialog", "drawer", "hover-preview-card", "menu", "popover", "tooltip"],
  },
  { id: "programmatic", label: "Programmatic", items: ["overlay"] },
];

const pageSections = [
  { id: "accordion", component: AccordionSection },
  { id: "alert-dialog", component: AlertDialogSection },
  { id: "avatar", component: AvatarSection },
  { id: "button", component: ButtonSection },
  { id: "calendar", component: CalendarSection },
  { id: "checkbox", component: CheckboxSection },
  { id: "checkbox-group", component: CheckboxGroupSection },
  { id: "collapsible", component: CollapsibleSection },
  { id: "combobox", component: ComboboxSection },
  { id: "context-menu", component: ContextMenuSection },
  { id: "date-field", component: DateFieldSection },
  { id: "date-range-field", component: DateRangeFieldSection },
  { id: "date-range-picker", component: DateRangePickerSection },
  { id: "dialog", component: DialogSection },
  { id: "drawer", component: DrawerSection },
  { id: "editable", component: EditableSection },
  { id: "field", component: FieldSection },
  { id: "fieldset", component: FieldsetSection },
  { id: "form", component: FormSection },
  { id: "hover-preview-card", component: HoverPreviewCardSection },
  { id: "input", component: InputSection },
  { id: "listbox", component: ListboxSection },
  { id: "menu", component: MenuSection },
  { id: "menubar", component: MenubarSection },
  { id: "meter", component: MeterSection },
  { id: "month-picker", component: MonthPickerSection },
  { id: "month-range-picker", component: MonthRangePickerSection },
  { id: "navigation-menu", component: NavigationMenuSection },
  { id: "number-field", component: NumberFieldSection },
  { id: "overlay", component: OverlaySection },
  { id: "pagination", component: PaginationSection },
  { id: "pin-input", component: PinInputSection },
  { id: "popover", component: PopoverSection },
  { id: "progress", component: ProgressSection },
  { id: "radio-group", component: RadioGroupSection },
  { id: "rating", component: RatingSection },
  { id: "select", component: SelectSection },
  { id: "separator", component: SeparatorSection },
  { id: "slider", component: SliderSection },
  { id: "stepper", component: StepperSection },
  { id: "switch", component: SwitchSection },
  { id: "tabs", component: TabsSection },
  { id: "tags-input", component: TagsInputSection },
  { id: "time-field", component: TimeFieldSection },
  { id: "time-range-field", component: TimeRangeFieldSection },
  { id: "toast", component: ToastSection },
  { id: "toggle", component: ToggleSection },
  { id: "toggle-group", component: ToggleGroupSection },
  { id: "toolbar", component: ToolbarSection },
  { id: "tooltip", component: TooltipSection },
  { id: "year-picker", component: YearPickerSection },
  { id: "year-range-picker", component: YearRangePickerSection },
];

const componentOptions = pageSections.map(({ id }) => ({
  value: id,
  label: id.split("-").join(" "),
}));

const componentSearchUi = {
  root: "block w-32 sm:w-48",
  input:
    "h-8 w-full rounded-md border border-border bg-muted px-8 text-xs font-medium text-foreground capitalize outline-none transition-colors placeholder:normal-case placeholder:text-muted-foreground hover:bg-accent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring",
  content: "rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg",
  viewport: "max-h-72 overflow-auto",
  empty: "px-2 py-1.5 text-xs text-muted-foreground",
  option:
    "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors data-[akaza-highlighted]:bg-accent",
  indicator: "hidden",
  optionLabel: "font-medium capitalize text-foreground",
};

function openComponent(value: ComboboxModelValue) {
  if (typeof value === "string" && value) window.location.hash = value;
}
</script>

<template>
  <div class="w-full min-h-screen flex flex-col" :class="{ dark: isDark }">
    <header
      class="fixed top-0 left-0 right-0 z-50 flex h-14 w-full max-w-[100dvw] items-center justify-between border-b border-border bg-background px-3 sm:px-6"
    >
      <div class="flex min-w-0 items-center gap-3">
        <a
          href="/"
          class="font-semibold tracking-tight text-foreground cursor-pointer"
          style="font-size: 15px"
        >
          Akaza UI
        </a>
        <span class="hidden text-xs text-muted-foreground sm:inline">Playground</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative h-8" role="search">
          <svg
            class="pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <Combobox
            v-model="selectedComponent"
            v-model:search="searchQuery"
            :options="componentOptions"
            aria-label="Search components"
            placeholder="Find component"
            reset-search-on-blur
            :ui="componentSearchUi"
            @value-change="openComponent"
          />
        </div>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-muted text-muted-foreground hover:bg-accent transition-colors"
          @click="toggleTheme"
        >
          {{ isDark ? "☀ Light" : "⏾ Dark" }}
        </button>
      </div>
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

      <main class="min-w-0 w-full flex-1 px-6 lg:px-12 py-10 max-w-3xl space-y-16">
        <template v-for="(section, index) in pageSections" :key="section.id">
          <component :is="section.component" />
          <Separator v-if="index < pageSections.length - 1" class="border-t border-border" />
        </template>
      </main>
      <OverlayProvider />
    </div>
  </div>
</template>

<style scoped></style>
