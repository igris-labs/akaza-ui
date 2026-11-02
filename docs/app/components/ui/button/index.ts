import type { ButtonProps as PrimitiveButtonProps } from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { tv } from "../../../utils/ui";

const tactile =
  "border-[oklch(from_var(--button-color)_clamp(0,calc(l_+_0.0292),1)_calc(c_*_0.82)_h)] border-t-[oklch(from_var(--button-color)_clamp(0,calc(l_+_0.1656),1)_calc(c_*_0.58)_h)] border-b-[oklch(from_var(--button-color)_clamp(0,calc(l_-_0.0659),1)_calc(c_*_0.88)_h)] bg-linear-to-b from-[oklch(from_var(--button-color)_clamp(0,calc(l_+_0.1165),1)_calc(c_*_0.82)_h)] to-[oklch(from_var(--button-color)_clamp(0,calc(l_-_0.0214),1)_calc(c_*_0.96)_h)] shadow-[0_1px_2px_oklch(0%_0_0/0.14),inset_0_1px_0_oklch(100%_0_0/0.14)] not-aria-disabled:hover:from-[oklch(from_var(--button-color)_clamp(0,calc(l_+_0.1432),1)_calc(c_*_0.78)_h)] not-aria-disabled:hover:to-[oklch(from_var(--button-color)_clamp(0,calc(l_+_0.0292),1)_calc(c_*_0.9)_h)] not-aria-disabled:hover:shadow-[0_2px_5px_oklch(0%_0_0/0.2),inset_0_1px_0_oklch(100%_0_0/0.2)]";

export const buttonVariants = tv({
  slots: {
    root: "group/button relative inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate] [transition-duration:150ms,200ms,150ms,150ms,100ms] ease-interaction outline-none select-none focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive data-akaza-loading:cursor-progress data-akaza-loading:opacity-100 motion-safe:not-aria-disabled:active:translate-y-px motion-reduce:transition-none pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    content: "inline-flex items-center justify-center [&_svg]:size-(--button-icon-size)",
    spinner: "size-(--button-icon-size) shrink-0 animate-spin motion-reduce:animate-none",
    loadingText: "sr-only",
  },
  variants: {
    color: {
      primary: {
        root: "[--button-color:var(--primary)] [--button-foreground:var(--primary-foreground)] [--button-text:var(--primary)]",
      },
      secondary: {
        root: "[--button-color:var(--secondary)] [--button-foreground:var(--secondary-foreground)] [--button-text:light-dark(oklch(from_var(--secondary)_min(l,0.48)_c_h),oklch(from_var(--secondary)_max(l,0.7)_c_h))]",
      },
      accent: {
        root: "[--button-color:var(--accent)] [--button-foreground:var(--accent-foreground)] [--button-text:light-dark(oklch(from_var(--accent)_min(l,0.48)_c_h),var(--accent))]",
      },
      info: {
        root: "[--button-color:var(--info)] [--button-foreground:var(--info-foreground)] [--button-text:light-dark(oklch(from_var(--info)_min(l,0.48)_c_h),oklch(from_var(--info)_max(l,0.7)_c_h))]",
      },
      success: {
        root: "[--button-color:var(--success)] [--button-foreground:var(--success-foreground)] [--button-text:light-dark(oklch(from_var(--success)_min(l,0.48)_c_h),var(--success))]",
      },
      warning: {
        root: "[--button-color:var(--warning)] [--button-foreground:var(--warning-foreground)] [--button-text:light-dark(oklch(from_var(--warning)_min(l,0.48)_c_h),var(--warning))]",
      },
      destructive: {
        root: "[--button-color:var(--destructive)] [--button-foreground:var(--destructive-foreground)] [--button-text:light-dark(oklch(from_var(--destructive)_min(l,0.48)_c_h),oklch(from_var(--destructive)_max(l,0.7)_c_h))]",
      },
    },
    variant: {
      solid: {
        root: "bg-(--button-color) text-(--button-foreground) not-aria-disabled:hover:bg-[color-mix(in_oklch,var(--button-color)_90%,var(--foreground))]",
      },
      soft: {
        root: "bg-(--button-text)/10 text-(--button-text) not-aria-disabled:hover:bg-(--button-text)/15",
      },
      subtle: {
        root: "border-(--button-text)/20 bg-(--button-text)/10 text-(--button-text) not-aria-disabled:hover:bg-(--button-text)/15",
      },
      outline: {
        root: "border-(--button-text)/20 bg-transparent text-(--button-text) not-aria-disabled:hover:bg-(--button-text)/10",
      },
      ghost: {
        root: "bg-transparent text-(--button-text) not-aria-disabled:hover:bg-(--button-text)/5 dark:not-aria-disabled:hover:bg-(--button-text)/8",
      },
      link: {
        root: "bg-transparent text-(--button-text) underline-offset-4 not-aria-disabled:hover:underline",
      },
    },
    size: {
      xs: {
        root: "h-6 rounded-[calc(var(--radius)*0.5)] px-2 py-0.5 text-xs leading-4 [--button-icon-size:0.75rem]",
        content: "gap-1",
      },
      sm: {
        root: "h-7 rounded-sm px-2.5 py-1 text-[0.8125rem] leading-4 [--button-icon-size:0.875rem]",
        content: "gap-1",
      },
      md: {
        root: "h-8 rounded-md px-3 py-1 text-sm leading-5 [--button-icon-size:1rem]",
        content: "gap-1.5",
      },
      lg: {
        root: "h-9 rounded-lg px-3.5 py-1.5 text-sm leading-5 [--button-icon-size:1.125rem]",
        content: "gap-2",
      },
      xl: {
        root: "h-10 rounded-[calc(var(--radius)*1.2)] px-4 py-1.5 text-base leading-6 [--button-icon-size:1.25rem]",
        content: "gap-2.5",
      },
    },
    shape: {
      default: {},
      icon: { root: "px-0" },
    },
  },
  compoundVariants: [
    { color: ["primary", "accent"], variant: "solid", class: { root: tactile } },
    // Keep white text readable at the lightest tactile gradient stop.
    {
      color: "accent",
      variant: "solid",
      class: {
        root: "[--button-color:light-dark(oklch(from_var(--accent)_min(l,0.42)_c_h),var(--accent))]",
      },
    },
    { shape: "icon", size: "xs", class: { root: "w-6" } },
    { shape: "icon", size: "sm", class: { root: "w-7" } },
    { shape: "icon", size: "md", class: { root: "w-8" } },
    { shape: "icon", size: "lg", class: { root: "w-9" } },
    { shape: "icon", size: "xl", class: { root: "w-10" } },
  ],
  defaultVariants: { color: "primary", variant: "solid", size: "sm", shape: "default" },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends Omit<PrimitiveButtonProps, "ui"> {
  color?: ButtonVariants["color"];
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  shape?: ButtonVariants["shape"];
  class?: HTMLAttributes["class"];
  ui?: {
    root?: string;
    content?: string;
    spinner?: string;
    loadingText?: string;
  };
}

export function resolveButtonVariants(props: ButtonVariants, config: UiConfig): ButtonVariants {
  const component = config.components?.button;
  const globalVariant = config.defaults?.variant;
  return {
    color: props.color ?? component?.color ?? config.defaults?.color ?? undefined,
    size: props.size ?? component?.size ?? config.defaults?.size ?? undefined,
    variant:
      props.variant ??
      component?.variant ??
      (globalVariant && globalVariant in buttonVariants.variants.variant
        ? (globalVariant as ButtonVariants["variant"])
        : undefined),
    shape: props.shape ?? component?.shape,
  };
}

export { default as Button } from "./Button.vue";

export type ButtonConfig = Pick<ButtonVariants, "size" | "variant" | "color" | "shape">;

declare module "../ui.types" {
  interface UiComponentConfig {
    button?: ButtonConfig;
  }
}
