import type { ListboxProps as PrimitiveListboxProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const listboxVariants = tv({
  slots: {
    root: "flex flex-col overflow-hidden rounded-lg border border-border bg-popover",
    hiddenInput: "sr-only",
    filter:
      "m-1 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    content: "max-h-72 overflow-auto p-1",
    virtualWrapper: "",
    empty: "px-3 py-6 text-center text-sm text-muted-foreground",
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
        option: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        filter: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 py-1 text-xs leading-4",
        indicator: "size-3",
      },
      sm: {
        option: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        filter: "min-h-7 gap-1 rounded-sm px-2.5 py-1 text-[13px] leading-4",
        indicator: "size-3.5",
      },
      md: {
        option: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        filter: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-sm leading-5",
        indicator: "size-4",
      },
      lg: {
        option: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        filter: "min-h-9 gap-2 rounded-lg px-3.5 py-1 text-sm leading-5",
        indicator: "size-4.5",
      },
      xl: {
        option: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        filter: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 py-1 text-base leading-6",
        indicator: "size-5",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type ListboxVariants = VariantProps<typeof listboxVariants>;
export type ListboxConfig = Pick<ListboxVariants, "size">;
export type ListboxSlots = InstanceType<typeof Akaza.Listbox>["$slots"];
export interface ListboxProps extends Omit<PrimitiveListboxProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.ListboxUi;
  size?: ListboxVariants["size"];
  modelValue?: Akaza.ListboxModelValue;
  search?: string;
}
export function resolveListboxVariants(props: ListboxVariants, config: UiConfig): ListboxVariants {
  return resolveVariants(
    props,
    config.components?.listbox,
    config.defaults,
    listboxVariants.variants,
  );
}
export { default as Listbox } from "./Listbox.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    listbox?: ListboxConfig;
  }
}
