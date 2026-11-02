import type { TagsInputProps as PrimitiveTagsInputProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const tagsInputVariants = tv({
  slots: {
    root: "flex w-full min-w-0 flex-wrap items-center gap-1.5 border border-input bg-background text-foreground shadow-none transition-colors duration-150 ease-interaction outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 data-akaza-focused:ring-1 data-akaza-focused:ring-ring aria-invalid:data-akaza-focused:ring-destructive/25 data-akaza-invalid:border-destructive data-akaza-invalid:focus-visible:ring-destructive/25 data-akaza-invalid:data-akaza-focused:ring-destructive/25 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
    hiddenInput: "sr-only",
    item: "inline-flex max-w-full min-w-0 items-center border border-border bg-muted",
    itemText: "min-w-0 truncate",
    delete:
      "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
    input: "min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
    clear:
      "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-muted hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
  },
  variants: {
    size: {
      xs: {
        root: "min-h-6 gap-0.5 rounded-[calc(var(--radius)*0.5)] p-px text-xs leading-4 [--tag-icon-size:12px]",
        item: "min-h-5 gap-0.5 rounded-[max(2px,calc(var(--radius)*0.5-2px))] p-px ps-1 text-xs leading-4",
        delete: "size-3 rounded-sm",
        clear: "size-3 rounded-sm",
      },
      sm: {
        root: "min-h-7 gap-0.75 rounded-sm p-0.5 text-[13px] leading-4 [--tag-icon-size:14px]",
        item: "min-h-5.5 gap-0.75 rounded-[max(2px,calc(var(--radius)*0.6-3px))] p-0.5 ps-1.5 text-[13px] leading-4",
        delete: "size-3.5 rounded-sm",
        clear: "size-3.5 rounded-sm",
      },
      md: {
        root: "min-h-8 gap-1 rounded-md p-0.75 text-sm leading-5 [--tag-icon-size:16px]",
        item: "min-h-6 gap-1 rounded-[max(2px,calc(var(--radius)*0.8-4px))] p-px ps-1.5 text-sm leading-5",
        delete: "size-4 rounded-sm",
        clear: "size-4 rounded-sm",
      },
      lg: {
        root: "min-h-9 gap-1 rounded-lg p-0.75 text-sm leading-5 [--tag-icon-size:18px]",
        item: "min-h-7 gap-1 rounded-[max(2px,calc(var(--radius)-4px))] p-0.75 ps-2 text-sm leading-5",
        delete: "size-4.5 rounded-md",
        clear: "size-4.5 rounded-md",
      },
      xl: {
        root: "min-h-10 gap-1.5 rounded-[calc(var(--radius)*1.2)] p-0.75 text-base leading-6 [--tag-icon-size:20px]",
        item: "min-h-8 gap-1.5 rounded-[max(2px,calc(var(--radius)*1.2-4px))] p-0.75 ps-2 text-base leading-6",
        delete: "size-5 rounded-md",
        clear: "size-5 rounded-md",
      },
    },
    variant: {
      outline: {
        root: "border-input bg-background",
      },
      soft: {
        root: "border-transparent bg-muted",
      },
      bare: {
        root: "border-transparent bg-transparent focus-visible:ring-0 data-akaza-focused:ring-0",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "outline",
  },
});
export type TagsInputVariants = VariantProps<typeof tagsInputVariants>;
export type TagsInputConfig = Pick<TagsInputVariants, "size" | "variant">;
export type TagsInputSlots = InstanceType<typeof Akaza.TagsInput>["$slots"];
export interface TagsInputProps extends Omit<
  PrimitiveTagsInputProps,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TagsInputUi;
  size?: TagsInputVariants["size"];
  variant?: TagsInputVariants["variant"];
  modelValue?: Akaza.TagsInputValue[];
  input?: string;
}
export function resolveTagsInputVariants(
  props: TagsInputVariants,
  config: UiConfig,
): TagsInputVariants {
  return resolveVariants(
    props,
    config.components?.tagsInput,
    config.defaults,
    tagsInputVariants.variants,
  );
}
export { default as TagsInput } from "./TagsInput.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    tagsInput?: TagsInputConfig;
  }
}
