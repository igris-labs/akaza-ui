import type { PaginationProps as PrimitivePaginationProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

const paginationControl =
  "cursor-pointer select-none inline-flex min-h-(--pagination-size) min-w-(--pagination-size) shrink-0 items-center justify-center rounded-(--pagination-radius) px-1 py-1 text-muted-foreground transition-colors duration-150 ease-interaction outline-none hover:bg-foreground/5 hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-40 motion-reduce:transition-none pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-(--pagination-icon) [&_svg]:shrink-0";

export const paginationVariants = tv({
  slots: {
    root: "relative isolate max-w-full overflow-x-auto",
    list: "relative flex w-max items-center gap-1 p-1 pointer-coarse:gap-0.5",
    item: "relative z-10 flex shrink-0",
    first: paginationControl,
    previous: paginationControl,
    next: paginationControl,
    last: paginationControl,
    page: `${paginationControl} w-[max(var(--pagination-size),calc(var(--pagination-digits,1)*1ch+0.5rem))] tabular-nums data-[akaza-state=active]:bg-foreground/10 data-[akaza-state=active]:text-highlighted data-[akaza-state=active]:transition-none pointer-coarse:w-[max(2.75rem,calc(var(--pagination-digits,1)*1ch+0.5rem))]`,
    ellipsis:
      "inline-flex min-h-(--pagination-size) w-[max(var(--pagination-size),calc(var(--pagination-digits,1)*1ch+0.5rem))] items-center justify-center text-dimmed pointer-coarse:min-h-11 pointer-coarse:min-w-11",
    indicator:
      "pointer-events-none absolute top-0 left-0 rounded-(--pagination-radius) bg-foreground/10 transition-[transform,width,height] duration-180 ease-interaction motion-reduce:transition-none",
  },
  variants: {
    variant: {
      soft: {},
      solid: {
        page: "data-[akaza-state=active]:bg-primary data-[akaza-state=active]:text-primary-foreground",
        indicator: "bg-primary",
      },
      subtle: {
        page: "data-[akaza-state=active]:bg-foreground/5",
        indicator: "border border-foreground/20 bg-foreground/5",
      },
      outline: {
        page: "data-[akaza-state=active]:bg-transparent",
        indicator: "border border-foreground/30 bg-transparent",
      },
    },
    size: {
      xs: {
        root: "text-xs leading-4 [--pagination-icon:0.75rem] [--pagination-radius:calc(var(--radius)*0.5)] [--pagination-size:1.5rem]",
      },
      sm: {
        root: "text-[13px] leading-4 [--pagination-icon:0.875rem] [--pagination-radius:var(--radius-sm)] [--pagination-size:1.75rem]",
      },
      md: {
        root: "text-sm leading-5 [--pagination-icon:1rem] [--pagination-radius:var(--radius-md)] [--pagination-size:2rem]",
      },
      lg: {
        root: "text-sm leading-5 [--pagination-icon:1.125rem] [--pagination-radius:var(--radius-lg)] [--pagination-size:2.25rem]",
      },
      xl: {
        root: "text-base leading-6 [--pagination-icon:1.25rem] [--pagination-radius:calc(var(--radius)*1.2)] [--pagination-size:2.5rem]",
      },
    },
  },
  defaultVariants: { size: "sm", variant: "soft" },
});
export type PaginationVariants = VariantProps<typeof paginationVariants>;
export type PaginationConfig = Pick<PaginationVariants, "size" | "variant">;
export type PaginationSlots = InstanceType<typeof Akaza.Pagination>["$slots"];
export interface PaginationProps extends Omit<PrimitivePaginationProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.PaginationUi & { indicator?: string };
  size?: PaginationVariants["size"];
  variant?: PaginationVariants["variant"];
  modelValue?: number;
  "onValue-change"?: (page: number, details: Akaza.AkazaChangeEventDetails) => void;
  "onUpdate:modelValue"?: (page: number) => void;
}
export function resolvePaginationVariants(
  props: PaginationVariants,
  config: UiConfig,
): PaginationVariants {
  return resolveVariants(
    props,
    config.components?.pagination,
    config.defaults,
    paginationVariants.variants,
  );
}
export { default as Pagination } from "./Pagination.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    pagination?: PaginationConfig;
  }
}
