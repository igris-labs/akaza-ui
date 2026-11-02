import type { SelectProps as PrimitiveSelectProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const selectVariants = tv({
  slots: {
    root: "relative inline-flex min-w-0 flex-col",
    nativeSelect: "sr-only",
    trigger:
      "flex w-full items-center justify-between gap-2 border border-input bg-background text-left text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    value: "min-w-0 flex-1 truncate",
    placeholder: "text-muted-foreground",
    icon: "shrink-0 text-muted-foreground",
    searchInput:
      "m-1 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    content:
      "z-50 max-w-[calc(100vw-2rem)] min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg motion-reduce:transition-none",
    viewport: "max-h-72 overflow-auto",
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
  },
  variants: {
    size: {
      xs: {
        trigger: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        searchInput: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        option: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        icon: "size-3",
        indicator: "size-3",
      },
      sm: {
        trigger: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        searchInput: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        option: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        icon: "size-3.5",
        indicator: "size-3.5",
      },
      md: {
        trigger: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        searchInput: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        option: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        icon: "size-4",
        indicator: "size-4",
      },
      lg: {
        trigger: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        searchInput: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        option: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        icon: "size-4.5",
        indicator: "size-4.5",
      },
      xl: {
        trigger: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        searchInput: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        option: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        icon: "size-5",
        indicator: "size-5",
      },
    },
    variant: {
      outline: {
        trigger: "border-input bg-background",
        searchInput: "border-input bg-background",
      },
      soft: {
        trigger: "border-transparent bg-muted",
        searchInput: "border-transparent bg-muted",
      },
      bare: {
        trigger: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
        searchInput:
          "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type SelectVariants = VariantProps<typeof selectVariants>;
export type SelectConfig = Pick<SelectVariants, "size" | "variant">;
export type SelectSlots = InstanceType<typeof Akaza.Select>["$slots"];
export interface SelectProps extends Omit<
  PrimitiveSelectProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.SelectUi;
  size?: SelectVariants["size"];
  variant?: SelectVariants["variant"];
  modelValue?: Akaza.SelectModelValue;
  open?: boolean;
  search?: string;
}
export function resolveSelectVariants(props: SelectVariants, config: UiConfig): SelectVariants {
  return resolveVariants(
    props,
    config.components?.select,
    config.defaults,
    selectVariants.variants,
  );
}
export { default as Select } from "./Select.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    select?: SelectConfig;
  }
}
