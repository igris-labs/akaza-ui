export const fieldUi = {
  root: "block min-w-0 flex-1",
  input:
    "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring data-[akaza-invalid]:border-destructive disabled:opacity-50",
};
export const areaUi = {
  root: "h-44 w-full max-w-sm rounded-md data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-ring data-[akaza-disabled]:opacity-50",
  area: "rounded-md",
  thumb: "size-5 rounded-full border-2 border-border bg-background shadow-sm",
};
export const hueAreaUi = {
  ...areaUi,
  root: "aspect-square w-full max-w-64 rounded-lg data-[akaza-focused]:ring-2 data-[akaza-focused]:ring-ring data-[akaza-disabled]:opacity-50",
  area: "rounded-lg",
};
export const sliderUi = {
  root: "h-6 w-full max-w-sm rounded-md data-[akaza-disabled]:opacity-50",
  axis: "peer outline-none",
  track: "h-3 w-full rounded-full bg-muted",
  thumb:
    "size-6 rounded-full border-2 border-border bg-background shadow-sm peer-data-[akaza-focus-visible]:ring-2 peer-data-[akaza-focus-visible]:ring-ring peer-data-[akaza-focus-visible]:ring-offset-2 peer-data-[akaza-focus-visible]:ring-offset-background",
};
export const swatchUi = { root: "block size-9 shrink-0 rounded-md border border-border" };
export const paletteUi = {
  root: "w-full rounded-md",
  viewport: "rounded-md outline-none",
  content: "flex flex-wrap gap-2",
  item: "relative rounded-md outline-none data-[akaza-highlighted]:ring-2 data-[akaza-highlighted]:ring-ring data-[akaza-state=checked]:ring-2 data-[akaza-state=checked]:ring-foreground/60 data-[akaza-disabled]:opacity-35",
  swatch: "block size-10 rounded-md border border-white/25",
  label: "sr-only",
  indicator: "pointer-events-none absolute inset-0 flex items-center justify-center text-white",
};
export const pickerUi = {
  root: "grid w-full max-w-sm gap-3",
  controls: "grid gap-1",
  fields: "flex min-w-0 items-center gap-2",
  area: areaUi,
  hue: sliderUi,
  alpha: sliderUi,
  field: fieldUi,
  preview: swatchUi,
  swatches: paletteUi,
};
export const palette = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#fde047", label: "Yellow" },
  { value: "#2a9d6f", label: "Green" },
  { value: "#0090ff", label: "Blue" },
  { value: "#4263eb", label: "Indigo" },
  { value: "#7950c7", label: "Purple" },
  { value: "#737373", label: "Unavailable gray", disabled: true },
];
