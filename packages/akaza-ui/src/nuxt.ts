import { addComponent, defineNuxtModule } from "@nuxt/kit";

const COMPONENTS: Array<{ name: string; export: string }> = [
  { name: "Accordion", export: "Accordion" },
  { name: "AlertDialog", export: "AlertDialog" },
  { name: "Avatar", export: "Avatar" },
  { name: "Button", export: "Button" },
  { name: "Checkbox", export: "Checkbox" },
  { name: "Collapsible", export: "Collapsible" },
  { name: "Dialog", export: "Dialog" },
  { name: "Drawer", export: "Drawer" },
  { name: "Menu", export: "Menu" },
  { name: "OverlayProvider", export: "OverlayProvider" },
  { name: "Popover", export: "Popover" },
  { name: "Progress", export: "Progress" },
  { name: "RadioGroup", export: "RadioGroup" },
  { name: "Separator", export: "Separator" },
  { name: "Switch", export: "Switch" },
  { name: "Tabs", export: "Tabs" },
  { name: "Toggle", export: "Toggle" },
  { name: "Tooltip", export: "Tooltip" },
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
