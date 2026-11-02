import type { EditableProps as PrimitiveEditableProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const editableVariants = tv({
  slots: {
    root: "grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2",
    hiddenInput: "sr-only",
    area: "min-w-0",
    preview:
      "inline-flex w-full items-center border border-transparent bg-transparent text-left text-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-foreground/5 focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none pointer-coarse:min-h-11",
    input:
      "w-full border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    actions: "flex items-center gap-1.5",
    edit: "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    submit:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary text-muted-foreground text-primary-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    cancel:
      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        input: "h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
        preview: "min-h-6 gap-1 rounded-[calc(var(--radius)*0.5)] px-2 text-xs leading-4",
      },
      sm: {
        input: "h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
        preview: "min-h-7 gap-1 rounded-sm px-2.5 text-[13px] leading-4",
      },
      md: {
        input: "h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
        preview: "min-h-8 gap-1.5 rounded-md px-3 text-sm leading-5",
      },
      lg: {
        input: "h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
        preview: "min-h-9 gap-2 rounded-lg px-3.5 text-sm leading-5",
      },
      xl: {
        input: "h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
        preview: "min-h-10 gap-2.5 rounded-[calc(var(--radius)*1.2)] px-4 text-base leading-6",
      },
    },
    variant: {
      outline: {
        input: "border-input bg-background",
        preview: "border-input bg-background",
      },
      soft: {
        input: "border-transparent bg-muted",
        preview: "border-transparent bg-muted",
      },
      bare: {
        preview: "border-transparent bg-transparent",
        input: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type EditableVariants = VariantProps<typeof editableVariants>;
export type EditableConfig = Pick<EditableVariants, "size" | "variant">;
export type EditableSlots = InstanceType<typeof Akaza.Editable>["$slots"];
export interface EditableProps extends Omit<
  PrimitiveEditableProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.EditableUi;
  size?: EditableVariants["size"];
  variant?: EditableVariants["variant"];
  modelValue?: string | null;
}
export function resolveEditableVariants(
  props: EditableVariants,
  config: UiConfig,
): EditableVariants {
  return resolveVariants(
    props,
    config.components?.editable,
    config.defaults,
    editableVariants.variants,
  );
}
export { default as Editable } from "./Editable.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    editable?: EditableConfig;
  }
}
