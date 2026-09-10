<script setup lang="ts">
import type { ComboboxModelValue } from 'akaza-ui'
import { ref } from 'vue'
import { Combobox, OverlayProvider, Separator } from 'akaza-ui'
import ButtonSection from './sections/button/ButtonSection.vue'
import ToggleSection from './sections/toggle/ToggleSection.vue'
import SwitchSection from './sections/switch/SwitchSection.vue'
import CheckboxSection from './sections/checkbox/CheckboxSection.vue'
import CheckboxGroupSection from './sections/checkbox-group/CheckboxGroupSection.vue'
import RadioGroupSection from './sections/radio-group/RadioGroupSection.vue'
import FieldSection from './sections/field/FieldSection.vue'
import FieldsetSection from './sections/fieldset/FieldsetSection.vue'
import FormSection from './sections/form/FormSection.vue'
import InputSection from './sections/input/InputSection.vue'
import SelectSection from './sections/select/SelectSection.vue'
import ListboxSection from './sections/listbox/ListboxSection.vue'
import MonthPickerSection from './sections/month-picker/MonthPickerSection.vue'
import MonthRangePickerSection from './sections/month-range-picker/MonthRangePickerSection.vue'
import ComboboxSection from './sections/combobox/ComboboxSection.vue'
import PinInputSection from './sections/pin-input/PinInputSection.vue'
import TagsInputSection from './sections/tags-input/TagsInputSection.vue'
import EditableSection from './sections/editable/EditableSection.vue'
import RatingSection from './sections/rating/RatingSection.vue'
import StepperSection from './sections/stepper/StepperSection.vue'
import NumberFieldSection from './sections/number-field/NumberFieldSection.vue'
import CalendarSection from './sections/calendar/CalendarSection.vue'
import DataTableSection from './sections/data-table/DataTableSection.vue'
import DateFieldSection from './sections/date-field/DateFieldSection.vue'
import DateRangeFieldSection from './sections/date-range-field/DateRangeFieldSection.vue'
import DateRangePickerSection from './sections/date-range-picker/DateRangePickerSection.vue'
import SliderSection from './sections/slider/SliderSection.vue'
import AvatarSection from './sections/avatar/AvatarSection.vue'
import SeparatorSection from './sections/separator/SeparatorSection.vue'
import MeterSection from './sections/meter/MeterSection.vue'
import ProgressSection from './sections/progress/ProgressSection.vue'
import CollapsibleSection from './sections/collapsible/CollapsibleSection.vue'
import AccordionSection from './sections/accordion/AccordionSection.vue'
import TooltipSection from './sections/tooltip/TooltipSection.vue'
import PopoverSection from './sections/popover/PopoverSection.vue'
import DialogSection from './sections/dialog/DialogSection.vue'
import AlertDialogSection from './sections/alert-dialog/AlertDialogSection.vue'
import DrawerSection from './sections/drawer/DrawerSection.vue'
import MenuSection from './sections/menu/MenuSection.vue'
import ContextMenuSection from './sections/context-menu/ContextMenuSection.vue'
import MenubarSection from './sections/menubar/MenubarSection.vue'
import NavigationMenuSection from './sections/navigation-menu/NavigationMenuSection.vue'
import TabsSection from './sections/tabs/TabsSection.vue'
import ToggleGroupSection from './sections/toggle-group/ToggleGroupSection.vue'
import ToolbarSection from './sections/toolbar/ToolbarSection.vue'
import ToastSection from './sections/toast/ToastSection.vue'
import TimeFieldSection from './sections/time-field/TimeFieldSection.vue'
import TimeRangeFieldSection from './sections/time-range-field/TimeRangeFieldSection.vue'
import HoverPreviewCardSection from './sections/hover-preview-card/HoverPreviewCardSection.vue'
import PaginationSection from './sections/pagination/PaginationSection.vue'
import OverlaySection from './sections/overlay/OverlaySection.vue'
import YearPickerSection from './sections/year-picker/YearPickerSection.vue'
import YearRangePickerSection from './sections/year-range-picker/YearRangePickerSection.vue'

const isDark = ref(false)
const selectedComponent = ref(window.location.hash.slice(1))
const searchQuery = ref('')

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const sections = [
  { id: 'disclosure', label: 'Disclosure', items: ['accordion', 'collapsible'] },
  {
    id: 'display',
    label: 'Display',
    items: ['avatar', 'data-table', 'meter', 'progress', 'separator', 'toast'],
  },
  {
    id: 'inputs',
    label: 'Inputs',
    items: [
      'button',
      'calendar',
      'checkbox',
      'checkbox-group',
      'combobox',
      'date-field',
      'date-range-field',
      'date-range-picker',
      'editable',
      'field',
      'fieldset',
      'form',
      'input',
      'listbox',
      'month-picker',
      'month-range-picker',
      'number-field',
      'pin-input',
      'radio-group',
      'rating',
      'select',
      'slider',
      'stepper',
      'switch',
      'tags-input',
      'time-field',
      'time-range-field',
      'toggle',
      'toggle-group',
      'year-picker',
      'year-range-picker',
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: ['menubar', 'navigation-menu', 'pagination', 'tabs', 'toolbar'],
  },
  {
    id: 'overlay',
    label: 'Overlay',
    items: [
      'alert-dialog',
      'context-menu',
      'dialog',
      'drawer',
      'hover-preview-card',
      'menu',
      'popover',
      'tooltip',
    ],
  },
  { id: 'programmatic', label: 'Programmatic', items: ['overlay'] },
]

const pageSections = [
  { id: 'accordion', component: AccordionSection },
  { id: 'alert-dialog', component: AlertDialogSection },
  { id: 'avatar', component: AvatarSection },
  { id: 'button', component: ButtonSection },
  { id: 'calendar', component: CalendarSection },
  { id: 'checkbox', component: CheckboxSection },
  { id: 'checkbox-group', component: CheckboxGroupSection },
  { id: 'collapsible', component: CollapsibleSection },
  { id: 'combobox', component: ComboboxSection },
  { id: 'context-menu', component: ContextMenuSection },
  { id: 'data-table', component: DataTableSection },
  { id: 'date-field', component: DateFieldSection },
  { id: 'date-range-field', component: DateRangeFieldSection },
  { id: 'date-range-picker', component: DateRangePickerSection },
  { id: 'dialog', component: DialogSection },
  { id: 'drawer', component: DrawerSection },
  { id: 'editable', component: EditableSection },
  { id: 'field', component: FieldSection },
  { id: 'fieldset', component: FieldsetSection },
  { id: 'form', component: FormSection },
  { id: 'hover-preview-card', component: HoverPreviewCardSection },
  { id: 'input', component: InputSection },
  { id: 'listbox', component: ListboxSection },
  { id: 'menu', component: MenuSection },
  { id: 'menubar', component: MenubarSection },
  { id: 'meter', component: MeterSection },
  { id: 'month-picker', component: MonthPickerSection },
  { id: 'month-range-picker', component: MonthRangePickerSection },
  { id: 'navigation-menu', component: NavigationMenuSection },
  { id: 'number-field', component: NumberFieldSection },
  { id: 'overlay', component: OverlaySection },
  { id: 'pagination', component: PaginationSection },
  { id: 'pin-input', component: PinInputSection },
  { id: 'popover', component: PopoverSection },
  { id: 'progress', component: ProgressSection },
  { id: 'radio-group', component: RadioGroupSection },
  { id: 'rating', component: RatingSection },
  { id: 'select', component: SelectSection },
  { id: 'separator', component: SeparatorSection },
  { id: 'slider', component: SliderSection },
  { id: 'stepper', component: StepperSection },
  { id: 'switch', component: SwitchSection },
  { id: 'tabs', component: TabsSection },
  { id: 'tags-input', component: TagsInputSection },
  { id: 'time-field', component: TimeFieldSection },
  { id: 'time-range-field', component: TimeRangeFieldSection },
  { id: 'toast', component: ToastSection },
  { id: 'toggle', component: ToggleSection },
  { id: 'toggle-group', component: ToggleGroupSection },
  { id: 'toolbar', component: ToolbarSection },
  { id: 'tooltip', component: TooltipSection },
  { id: 'year-picker', component: YearPickerSection },
  { id: 'year-range-picker', component: YearRangePickerSection },
]

const componentOptions = pageSections.map(({ id }) => ({
  value: id,
  label: id.split('-').join(' '),
}))

const componentSearchUi = {
  root: 'block w-36 sm:w-56',
  input:
    'h-10 w-full rounded-md border border-input bg-background px-8 text-[13px] text-foreground capitalize outline-none transition-[border-color,box-shadow] duration-150 placeholder:normal-case placeholder:text-muted-foreground hover:border-border focus-visible:ring-2 focus-visible:ring-ring sm:h-8',
  content: 'rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg',
  viewport: 'max-h-72 overflow-auto',
  empty: 'px-2 py-1.5 text-xs text-muted-foreground',
  option:
    'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors data-[akaza-highlighted]:bg-accent',
  indicator: 'hidden',
  optionLabel: 'font-medium capitalize text-foreground',
}

function openComponent(value: ComboboxModelValue) {
  if (typeof value === 'string' && value) window.location.hash = value
}
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-workspace" :class="{ dark: isDark }">
    <a
      href="#playground-content"
      class="fixed top-2 left-2 z-[60] -translate-y-16 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground focus:translate-y-0"
    >
      Skip to components
    </a>
    <header
      class="fixed inset-x-0 top-0 z-50 flex h-[52px] w-full max-w-[100dvw] items-center justify-between border-b border-border bg-background px-3 sm:px-4"
    >
      <div class="flex min-w-0 items-center gap-3">
        <a href="/" class="cursor-pointer text-[14px] font-semibold text-foreground"> Akaza UI </a>
        <span class="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:inline"
          >Playground</span
        >
      </div>
      <div class="flex items-center gap-2">
        <div class="relative h-10 sm:h-8" role="search">
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
          class="inline-flex size-10 items-center justify-center rounded-md border border-black/15 bg-[linear-gradient(to_bottom,#303030,#202020)] text-white shadow-[0_1px_1px_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.10)] transition-[background,box-shadow,transform] duration-150 hover:bg-[linear-gradient(to_bottom,#3a3a3a,#252525)] hover:shadow-[0_1px_1px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.12)] active:translate-y-px active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:w-auto sm:px-3 dark:border-white/20 dark:bg-[linear-gradient(to_bottom,#ffffff,#e7e7e9)] dark:text-[#202020] dark:hover:bg-[linear-gradient(to_bottom,#ffffff,#f3f3f4)]"
          :aria-label="isDark ? 'Use light theme' : 'Use dark theme'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"
            />
          </svg>
          <svg
            v-else
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
          </svg>
          <span class="hidden sm:inline">{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>
      </div>
    </header>

    <div class="mt-[52px] flex min-h-[calc(100dvh-52px)]">
      <aside
        class="sticky top-[52px] hidden h-[calc(100dvh-52px)] w-58 shrink-0 flex-col overflow-y-auto border-r border-border bg-shell px-3 py-4 md:flex"
      >
        <nav class="flex flex-col gap-4" aria-label="Component groups">
          <div v-for="section in sections" :key="section.id">
            <p
              class="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70"
            >
              {{ section.label }}
            </p>
            <ul class="flex flex-col gap-px">
              <li v-for="item in section.items" :key="item">
                <a
                  :href="`#${item}`"
                  class="block min-h-8 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground capitalize transition-colors duration-150 hover:bg-background hover:text-foreground aria-[current=location]:bg-background aria-[current=location]:font-medium aria-[current=location]:text-foreground dark:hover:bg-accent dark:aria-[current=location]:bg-accent"
                  :aria-current="selectedComponent === item ? 'location' : undefined"
                  @click="selectedComponent = item"
                >
                  {{ item.replace('-', ' ') }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main
        id="playground-content"
        tabindex="-1"
        class="mx-auto min-w-0 w-full max-w-6xl flex-1 space-y-12 px-4 py-8 outline-none sm:px-6 lg:px-10 lg:py-10"
      >
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
