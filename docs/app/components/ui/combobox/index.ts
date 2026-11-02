import type { ComboboxProps as PrimitiveComboboxProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const comboboxVariants = tv({
  slots: {
    root: "relative flex flex-wrap items-center gap-1.5",
    input:
      "min-w-0 flex-1 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    tags: "flex flex-wrap gap-1",
    tag: "inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-xs",
    tagLabel: "truncate",
    remove:
      "inline-flex size-4 shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    clear:
      "inline-flex size-6 shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    hiddenInput: "sr-only",
    content:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg motion-reduce:transition-none",
    viewport: "max-h-72 overflow-y-auto",
    empty: "px-3 py-6 text-center text-sm text-muted-foreground",
    loading: "px-3 py-4 text-sm text-muted-foreground",
    groupLabel: "px-2 py-1.5 text-xs font-medium text-muted-foreground",
    separator: "my-1 h-px bg-border",
    option:
      "relative isolate flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:-z-10 before:rounded-[inherit] before:transition-colors before:duration-150 before:ease-interaction hover:before:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:before:bg-muted data-[akaza-state=checked]:text-foreground data-[akaza-state=checked]:before:bg-muted motion-reduce:transition-none motion-reduce:before:transition-none [@media(pointer:coarse)]:min-h-11",
    indicator: "order-last ms-auto size-4 shrink-0 text-primary",
    optionText: "flex min-w-0 flex-1 flex-col",
    optionLabel: "truncate",
    optionDescription: "text-xs text-muted-foreground",
    create:
      "flex cursor-pointer items-center gap-2 rounded-md text-left text-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-highlighted:bg-muted data-[akaza-state=checked]:bg-muted data-[akaza-state=checked]:text-foreground motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
  },
  variants: {
    size: {
      xs: {
        input: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        option: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        create: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        indicator: "size-3",
      },
      sm: {
        input: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        option: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        create: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        indicator: "size-3.5",
      },
      md: {
        input: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        option: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        create: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        indicator: "size-4",
      },
      lg: {
        input: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        option: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        create: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        indicator: "size-4.5",
      },
      xl: {
        input: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        option: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        create: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        indicator: "size-5",
      },
    },
    variant: {
      outline: {
        input: "border-input bg-background",
      },
      soft: {
        input: "border-transparent bg-muted",
      },
      bare: {
        input: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type ComboboxVariants = VariantProps<typeof comboboxVariants>;
export type ComboboxConfig = Pick<ComboboxVariants, "size" | "variant">;
export type ComboboxSlots = InstanceType<typeof Akaza.Combobox>["$slots"];
export interface ComboboxProps extends Omit<
  PrimitiveComboboxProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ComboboxUi;
  size?: ComboboxVariants["size"];
  variant?: ComboboxVariants["variant"];
  modelValue?: Akaza.ComboboxModelValue;
  open?: boolean;
  search?: string;
}
export function resolveComboboxVariants(
  props: ComboboxVariants,
  config: UiConfig,
): ComboboxVariants {
  return resolveVariants(
    props,
    config.components?.combobox,
    config.defaults,
    comboboxVariants.variants,
  );
}
export { default as Combobox } from "./Combobox.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    combobox?: ComboboxConfig;
  }
}
