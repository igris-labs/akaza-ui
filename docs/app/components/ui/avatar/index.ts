import type { AvatarProps as PrimitiveAvatarProps } from "akaza-ui";
import type * as Akaza from "akaza-ui";
import type { HTMLAttributes } from "vue";

import type { VariantProps } from "../../../utils/ui";
import type { UiConfig } from "../ui.types";
import { resolveVariants, tv } from "../../../utils/ui";

export const avatarVariants = tv({
  slots: {
    root: "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-foreground",
    image: "size-full object-cover",
    fallback: "flex size-full items-center justify-center font-medium",
  },
  variants: {
    size: {
      xs: {
        root: "size-7 text-xs leading-4",
      },
      sm: {
        root: "size-8 text-[13px] leading-4",
      },
      md: {
        root: "size-9 text-sm leading-5",
      },
      lg: {
        root: "size-10 text-sm leading-5",
      },
      xl: {
        root: "size-11 text-base leading-6",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type AvatarConfig = Pick<AvatarVariants, "size">;
export type AvatarSlots = InstanceType<typeof Akaza.Avatar>["$slots"];
export interface AvatarProps extends Omit<PrimitiveAvatarProps, "ui" | "class" | "size"> {
  class?: HTMLAttributes["class"];
  ui?: Akaza.AvatarUi;
  size?: AvatarVariants["size"];
}
export function resolveAvatarVariants(props: AvatarVariants, config: UiConfig): AvatarVariants {
  return resolveVariants(
    props,
    config.components?.avatar,
    config.defaults,
    avatarVariants.variants,
  );
}
export { default as Avatar } from "./Avatar.vue";

declare module "../ui.types" {
  interface UiComponentConfig {
    avatar?: AvatarConfig;
  }
}
