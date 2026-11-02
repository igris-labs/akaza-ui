export type PrimitiveSize = "xs" | "sm" | "md" | "lg" | "xl";
export type UiColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "destructive";

// Each copied component adds its own configuration from its index.ts.
export interface UiComponentConfig {}

export interface UiConfig {
  defaults?: {
    rangeColor?: "secondary" | "accent" | null;
    size?: PrimitiveSize | null;
    variant?:
      | "default"
      | "solid"
      | "soft"
      | "subtle"
      | "outline"
      | "ghost"
      | "link"
      | "bare"
      | "line"
      | null;
    color?: UiColor | null;
  };
  components?: UiComponentConfig;
}
