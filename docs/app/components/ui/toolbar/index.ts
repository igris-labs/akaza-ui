import type { ToolbarProps as PrimitiveToolbarProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const toolbarVariants = tv({
  slots: {
    root: "inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 data-[akaza-orientation=vertical]:flex-col data-[akaza-orientation=vertical]:flex-nowrap data-[akaza-orientation=vertical]:items-stretch",
    group:
      "inline-flex items-center gap-1 in-data-[akaza-orientation=vertical]:flex-col in-data-[akaza-orientation=vertical]:items-stretch",
    button:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 in-data-[akaza-orientation=vertical]:justify-start data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    link: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 in-data-[akaza-orientation=vertical]:justify-start data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    input:
      "w-40 max-w-full min-w-0 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    separator:
      "mx-1 h-5 w-px shrink-0 bg-border data-[akaza-orientation=horizontal]:my-1 data-[akaza-orientation=horizontal]:h-px data-[akaza-orientation=horizontal]:w-auto data-[akaza-orientation=horizontal]:self-stretch",
    label: "font-medium",
  },
  variants: {
    size: {
      xs: {
        root: "rounded-[calc(var(--radius)*0.5+4px)]",
        button:
          "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        link: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4 [&_svg]:size-3",
        input: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
      },
      sm: {
        root: "rounded-lg",
        button: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        link: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4 [&_svg]:size-3.5",
        input: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
      },
      md: {
        root: "rounded-[calc(var(--radius)*0.8+4px)]",
        button: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        link: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5 [&_svg]:size-4",
        input: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
      },
      lg: {
        root: "rounded-xl",
        button: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        link: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5 [&_svg]:size-4.5",
        input: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
      },
      xl: {
        root: "rounded-[calc(var(--radius)*1.2+4px)]",
        button:
          "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        link: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6 [&_svg]:size-5",
        input: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type ToolbarVariants = VariantProps<typeof toolbarVariants>;
export type ToolbarConfig = Pick<ToolbarVariants, "size">;
export type ToolbarSlots = InstanceType<typeof Akaza.Toolbar>["$slots"];
export interface ToolbarProps extends Omit<PrimitiveToolbarProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ToolbarUi;
  size?: ToolbarVariants["size"];
}
export function resolveToolbarVariants(props: ToolbarVariants, config: UiConfig): ToolbarVariants {
  return resolveVariants(
    props,
    config.components?.toolbar,
    config.defaults,
    toolbarVariants.variants,
  );
}
export { default as Toolbar } from "./Toolbar.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    toolbar?: ToolbarConfig;
  }
}
