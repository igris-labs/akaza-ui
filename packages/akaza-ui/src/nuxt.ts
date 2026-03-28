import { addComponent, defineNuxtModule } from "@nuxt/kit";

const COMPONENTS = [
  "Accordion",
  "AlertDialog",
  "Avatar",
  "Button",
  "Checkbox",
  "Collapsible",
  "Dialog",
  "Drawer",
  "Menu",
  "Overlay",
  "Popover",
  "Progress",
  "RadioGroup",
  "Separator",
  "Switch",
  "Tabs",
  "Toggle",
  "Tooltip",
];

export default defineNuxtModule({
  meta: {
    name: "akaza-ui",
    configKey: "akazaUi",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },
  setup(_options, nuxt) {
    nuxt.options.css.push("akaza-ui/dist/akaza-ui.css");

    for (const name of COMPONENTS) {
      addComponent({
        name,
        export: name,
        filePath: "akaza-ui",
      });
    }
  },
});
