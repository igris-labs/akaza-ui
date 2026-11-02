import type { TreeProps as PrimitiveTreeProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const treeGeometry = {
  xs: { rowHeight: 24, indent: 12 },
  sm: { rowHeight: 28, indent: 16 },
  md: { rowHeight: 32, indent: 20 },
  lg: { rowHeight: 36, indent: 24 },
  xl: { rowHeight: 40, indent: 28 },
} as const;

export const treeVariants = tv({
  slots: {
    root: "w-full cursor-default text-foreground outline-none select-none pointer-coarse:[--tree-toggle-size:2.75rem]",
    viewport:
      "relative isolate max-h-96 overflow-auto p-px before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-0 before:h-(--tree-hover-height) before:w-(--tree-hover-width) before:translate-x-(--tree-hover-x) before:translate-y-(--tree-hover-y) before:rounded-(--tree-hover-radius) before:bg-foreground/5 before:opacity-[var(--tree-hover-opacity,0)] before:transition-[translate,width,height,opacity] before:duration-180 before:ease-interaction motion-reduce:before:transition-none dark:before:bg-foreground/8",
    virtualWrapper: "relative z-10",
    item: "py-px duration-180 ease-interaction outline-none motion-reduce:transition-none",
    row: "group/tree-row relative flex cursor-pointer items-center gap-0 rounded-(--tree-radius) text-muted-foreground data-akaza-disabled:pointer-events-none data-akaza-disabled:opacity-50 pointer-coarse:min-h-11",
    indent: "shrink-0",
    content:
      "flex min-w-0 flex-1 items-center gap-(--tree-gap) self-stretch rounded-[inherit] data-[akaza-selection-highlight=indented]:-ms-(--tree-gap) data-[akaza-selection-highlight=indented]:ps-(--tree-gap)",
    selection:
      "transition-[background-color,color,box-shadow] duration-150 ease-interaction in-focus-visible:data-akaza-focused:ring-1 in-focus-visible:data-akaza-focused:ring-ring/50 data-akaza-selected:bg-foreground/10 data-akaza-selected:font-medium data-akaza-selected:text-highlighted motion-reduce:transition-none",
    toggle:
      "inline-flex size-(--tree-toggle-size) shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--tree-radius)-2px)] text-muted-foreground transition-colors duration-150 ease-interaction outline-none select-none hover:bg-foreground/5 hover:text-highlighted focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
    leafSpacer: "h-0 min-h-0 w-[calc(var(--tree-toggle-size)+var(--tree-gap))] shrink-0",
    toggleIcon:
      "size-(--tree-icon-size) shrink-0 rotate-0 transform-none transition-[rotate] duration-180 ease-interaction data-[akaza-state=expanded]:rotate-90 motion-reduce:transition-none rtl:rotate-180 rtl:data-[akaza-state=expanded]:rotate-90",
    indicator: "flex size-(--tree-icon-size) shrink-0 items-center justify-center",
    icon: "flex size-(--tree-icon-size) shrink-0 items-center justify-center text-muted-foreground [&:empty:not(.iconify)]:hidden [&>*]:size-full",
    text: "min-w-0 flex-1",
    label:
      "max-w-full truncate rounded-[calc(var(--tree-radius)-2px)] data-[akaza-selection-highlight=label]:px-1 data-[akaza-selection-highlight=label]:py-0.5",
    trailing: "ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground",
    selectionIndicator:
      "inline-flex size-(--tree-icon-size) shrink-0 items-center justify-center rounded-[3px] border border-input text-background transition-colors duration-150 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=mixed]:border-foreground data-[state=mixed]:bg-foreground motion-reduce:transition-none",
    loading:
      "py-2 [padding-inline-start:calc(var(--akaza-tree-indent-offset)+var(--tree-toggle-size)+var(--tree-gap))] pe-3 text-xs text-muted-foreground",
    empty:
      "flex min-h-36 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground",
  },
  variants: {
    size: {
      xs: {
        root: "text-xs leading-4 [--tree-gap:.25rem] [--tree-icon-size:.75rem] [--tree-radius:calc(var(--radius)*0.5)] [--tree-toggle-size:1.25rem]",
        row: "min-h-6 px-2",
      },
      sm: {
        root: "text-[13px] leading-4 [--tree-gap:.25rem] [--tree-icon-size:.875rem] [--tree-radius:calc(var(--radius)*0.6)] [--tree-toggle-size:1.5rem]",
        row: "min-h-7 px-2.5",
      },
      md: {
        root: "text-sm leading-5 [--tree-gap:.375rem] [--tree-icon-size:1rem] [--tree-radius:calc(var(--radius)*0.8)] [--tree-toggle-size:1.75rem]",
        row: "min-h-8 px-3",
      },
      lg: {
        root: "text-sm leading-5 [--tree-gap:.5rem] [--tree-icon-size:1.125rem] [--tree-radius:var(--radius)] [--tree-toggle-size:2rem]",
        row: "min-h-9 px-3.5",
      },
      xl: {
        root: "text-base leading-6 [--tree-gap:.625rem] [--tree-icon-size:1.25rem] [--tree-radius:calc(var(--radius)*1.2)] [--tree-toggle-size:2.25rem]",
        row: "min-h-10 px-4",
      },
    },
    variant: {
      soft: {},
      subtle: {
        selection: "data-akaza-selected:inset-ring data-akaza-selected:inset-ring-foreground/15",
      },
    },
  },
  defaultVariants: { size: "sm", variant: "soft" },
});
export type TreeVariants = VariantProps<typeof treeVariants>;
export type TreeConfig = Pick<TreeVariants, "size" | "variant">;
export type TreeSlots<T extends object = Record<string, unknown>> = Akaza.TreeSlots<T>;
export interface TreeProps<T extends object = Record<string, unknown>> extends Omit<
  PrimitiveTreeProps<T>,
  "ui" | "class" | "size" | "variant"
> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.TreeUi & { selectionIndicator?: string };
  size?: TreeVariants["size"];
  variant?: TreeVariants["variant"];
  modelValue?: Akaza.TreeSelection;
  expanded?: Akaza.TreeKey[];
  "onUpdate:modelValue"?: (value: Akaza.TreeSelection) => void;
  onActivate?: (item: T, details: Akaza.TreeChangeEventDetails<T>) => void;
  "onUpdate:expanded"?: (value: Akaza.TreeKey[]) => void;
  "onSelection-change"?: (
    value: Akaza.TreeSelection,
    details: Akaza.TreeChangeEventDetails<T>,
  ) => void;
  "onExpanded-change"?: (
    value: Akaza.TreeKey[],
    details: Akaza.TreeExpandedChangeEventDetails<T>,
  ) => void;
  "onFocus-change"?: (value: Akaza.TreeKey, details: Akaza.TreeChangeEventDetails<T>) => void;
}
export function resolveTreeVariants(props: TreeVariants, config: UiConfig): TreeVariants {
  return resolveVariants(props, config.components?.tree, config.defaults, treeVariants.variants);
}
export { default as Tree } from "./Tree.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    tree?: TreeConfig;
  }
}
