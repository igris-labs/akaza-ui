import { addComponent, defineNuxtModule } from "@nuxt/kit";

const COMPONENTS: Array<{ name: string; export: string }> = [
  { name: "Accordion", export: "Accordion" },
  { name: "AlertDialog", export: "AlertDialog" },
  { name: "Avatar", export: "Avatar" },
  { name: "Button", export: "Button" },
  { name: "Checkbox", export: "Checkbox" },
  { name: "CheckboxGroup", export: "CheckboxGroup" },
  { name: "Collapsible", export: "Collapsible" },
  { name: "Combobox", export: "Combobox" },
  { name: "ContextMenu", export: "ContextMenu" },
  { name: "Dialog", export: "Dialog" },
  { name: "Drawer", export: "Drawer" },
  { name: "Field", export: "Field" },
  { name: "Fieldset", export: "Fieldset" },
  { name: "Form", export: "Form" },
  { name: "HoverPreviewCard", export: "HoverPreviewCard" },
  { name: "Input", export: "Input" },
  { name: "Menubar", export: "Menubar" },
  { name: "Menu", export: "Menu" },
  { name: "Meter", export: "Meter" },
  { name: "NavigationMenu", export: "NavigationMenu" },
  { name: "NumberField", export: "NumberField" },
  { name: "OverlayProvider", export: "OverlayProvider" },
  { name: "Popover", export: "Popover" },
  { name: "Progress", export: "Progress" },
  { name: "RadioGroup", export: "RadioGroup" },
  { name: "Separator", export: "Separator" },
  { name: "Select", export: "Select" },
  { name: "Slider", export: "Slider" },
  { name: "Switch", export: "Switch" },
  { name: "Tabs", export: "Tabs" },
  { name: "Toggle", export: "Toggle" },
  { name: "ToggleGroup", export: "ToggleGroup" },
  { name: "Tooltip", export: "Tooltip" },
  { name: "Toast", export: "Toast" },
  { name: "Toolbar", export: "Toolbar" },
];

type AkazaNuxtModule = ReturnType<
  ReturnType<typeof defineNuxtModule<Record<string, unknown>>>["with"]
>;

const module: AkazaNuxtModule = defineNuxtModule<Record<string, unknown>>({
  meta: {
    name: "akaza-ui",
    configKey: "akazaUi",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },
  setup(_options, nuxt) {
    nuxt.options.css.push("akaza-ui/dist/akaza-ui.css");

    for (const component of COMPONENTS) {
      addComponent({
        name: component.name,
        export: component.export,
        filePath: "akaza-ui",
      });
    }
  },
});

export default module;
