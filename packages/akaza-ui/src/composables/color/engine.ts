import type { Color, Mode } from "culori";
import type { ColorChannel, ColorChannelInfo, ColorFormat, ColorSpace } from "./types";
import {
  converter,
  formatCss,
  formatHex,
  formatHex8,
  inGamut,
  modeA98,
  modeHsl,
  modeHsv,
  modeHwb,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeP3,
  modeProphoto,
  modeRec2020,
  modeRgb,
  modeXyz50,
  modeXyz65,
  parse,
  useMode,
} from "culori/fn";

// Keep registration removable when an application imports no color primitives.
const engine = /* @__PURE__ */ (() => {
  for (const mode of [
    modeRgb,
    modeLrgb,
    modeHsl,
    modeHsv,
    modeHwb,
    modeLab,
    modeLch,
    modeOklab,
    modeOklch,
    modeP3,
    modeA98,
    modeProphoto,
    modeRec2020,
    modeXyz50,
    modeXyz65,
  ])
    useMode(mode);
  return { parse, converter, formatCss, formatHex, formatHex8, inGamut };
})();

export type ColorData = Color;
const converters = new Map<Mode, ReturnType<typeof converter>>();
const channelCache = new Map<string, ColorChannelInfo | null>();
interface ChannelData {
  mode: Mode;
  alpha?: number;
  [channel: string]: number | string | undefined;
}
const modes: Record<string, Mode> = {
  hsb: "hsv",
  hexa: "rgb",
  hex: "rgb",
  rgba: "rgb",
  hsla: "hsl",
  "display-p3": "p3",
  "a98-rgb": "a98",
  "prophoto-rgb": "prophoto",
  "xyz-d50": "xyz50",
  "xyz-d65": "xyz65",
};
export const colorMode = (space: ColorSpace | ColorFormat): Mode => modes[space] ?? (space as Mode);
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
// Stable DOM/CSS output across server and browser math implementations; retain raw state precision.
export const round = (value: number) => Number(value.toFixed(6));

/** CSS literals only: unresolved variables, currentColor, relative colors, and URLs are rejected. */
export function parseColor(value: string): ColorData | null {
  const color = engine.parse(value.trim());
  if (
    !color ||
    Object.values(color).some((value) => typeof value === "number" && !Number.isFinite(value))
  )
    return null;
  return { ...color, alpha: clamp(color.alpha ?? 1) };
}

export function convertColor(color: ColorData, space: ColorSpace | ColorFormat): ChannelData {
  const mode = colorMode(space);
  if (!converters.has(mode)) converters.set(mode, engine.converter(mode));
  return { ...converters.get(mode)!(color) } as ChannelData;
}

export function serializeColor(color: ColorData | null, format: ColorFormat): string {
  if (!color) return "";
  if (format === "hex" || format === "hexa")
    return (
      format === "hexa" || (color.alpha ?? 1) < 1
        ? engine.formatHex8(color)
        : engine.formatHex(color)
    )!;
  const converted = convertColor(color, format);
  const alpha = round(clamp(color.alpha ?? 1));
  const suffix = alpha < 1 || format === "rgba" || format === "hsla" ? ` / ${alpha}` : "";
  if (format === "rgb" || format === "rgba")
    return `rgb(${["r", "g", "b"].map((key) => round(clamp(Number(converted[key]) || 0) * 255)).join(" ")}${suffix})`;
  if (format === "hsl" || format === "hsla")
    return `hsl(${round(Number(converted.h) || 0)} ${round(Number(converted.s) * 100)}% ${round(Number(converted.l) * 100)}%${suffix})`;
  for (const key of Object.keys(converted))
    if (typeof converted[key] === "number") converted[key] = round(converted[key]);
  return engine.formatCss(converted as unknown as ColorData)!;
}

export function colorEquals(a: string, b: string): boolean {
  const first = parseColor(a);
  const second = parseColor(b);
  if (!first || !second) return a === b;
  const x = convertColor(first, "oklab");
  const y = convertColor(second, "oklab");
  return ["l", "a", "b", "alpha"].every(
    (key) => Math.abs(Number(x[key] ?? 1) - Number(y[key] ?? 1)) < 0.0001,
  );
}

export const isSrgb = (color: ColorData | null) => !color || engine.inGamut("rgb")(color);

/** Channel ranges use conventional units: RGB 0..255, percentages 0..100, hue degrees. */
export function channelInfo(space: ColorSpace, channel: ColorChannel): ColorChannelInfo | null {
  const key = `${space}:${channel}`;
  if (!channelCache.has(key)) channelCache.set(key, createChannelInfo(space, channel));
  return channelCache.get(key)!;
}

function createChannelInfo(space: ColorSpace, channel: ColorChannel): ColorChannelInfo | null {
  if (channel === "alpha") return { key: "alpha", label: "Opacity", min: 0, max: 100, step: 1 };
  const keys: Partial<Record<ColorSpace, Partial<Record<ColorChannel, string>>>> = {
    rgb: { red: "r", green: "g", blue: "b" },
    hsl: { hue: "h", saturation: "s", lightness: "l" },
    hsb: { hue: "h", saturation: "s", brightness: "v" },
    hwb: { hue: "h", whiteness: "w", blackness: "b" },
    lab: { lightness: "l", a: "a", b: "b" },
    lch: { lightness: "l", chroma: "c", hue: "h" },
    oklab: { lightness: "l", a: "a", b: "b" },
    oklch: { lightness: "l", chroma: "c", hue: "h" },
  };
  const key = keys[space]?.[channel];
  if (!key) return null;
  const label = channel[0]!.toUpperCase() + channel.slice(1);
  if (channel === "hue") return { key, label, min: 0, max: 360, step: 1 };
  if (space === "rgb") return { key, label, min: 0, max: 255, step: 1 };
  if (channel === "chroma")
    return {
      key,
      label,
      min: 0,
      max: space === "oklch" ? 0.4 : 150,
      step: space === "oklch" ? 0.001 : 1,
    };
  if (channel === "a" || channel === "b")
    return {
      key,
      label,
      min: space === "oklab" ? -0.4 : -125,
      max: space === "oklab" ? 0.4 : 125,
      step: space === "oklab" ? 0.001 : 1,
    };
  return { key, label, min: 0, max: 100, step: 1 };
}

function channelScale(space: ColorSpace, channel: ColorChannel) {
  if (channel === "alpha") return 100;
  if (space === "rgb") return 255;
  if (
    ["saturation", "brightness", "whiteness", "blackness"].includes(channel) ||
    (channel === "lightness" && !["lab", "lch"].includes(space))
  )
    return 100;
  return 1;
}
export function readChannel(
  color: ColorData,
  space: ColorSpace,
  channel: ColorChannel,
  hue = 0,
): number {
  const info = channelInfo(space, channel);
  if (!info) return 0;
  const converted = convertColor(color, space);
  const fallback = channel === "alpha" ? 1 : channel === "hue" ? hue : 0;
  return Number(converted[info.key] ?? fallback) * channelScale(space, channel);
}
export function writeChannels(
  color: ColorData,
  space: ColorSpace,
  changes: Partial<Record<ColorChannel, number>>,
  hue = 0,
): ColorData {
  const converted = convertColor(color, space);
  if (converted.h === undefined && channelInfo(space, "hue")) converted.h = hue;
  for (const [channel, value] of Object.entries(changes)) {
    const info = channelInfo(space, channel as ColorChannel);
    if (!info || !Number.isFinite(value)) continue;
    converted[info.key] =
      clamp(value, info.min, info.max) / channelScale(space, channel as ColorChannel);
  }
  return converted as unknown as ColorData;
}

export function gradient(
  color: ColorData,
  space: ColorSpace,
  channel: ColorChannel,
  direction: string,
  hue = 0,
): string {
  const info = channelInfo(space, channel);
  if (!info) return "none";
  let base = channel === "alpha" ? color : writeChannels(color, space, { alpha: 100 }, hue);
  if (channel === "hue") {
    base = writeChannels(
      base,
      space,
      space === "hsb"
        ? { saturation: 100, brightness: 100 }
        : space === "hsl"
          ? { saturation: 100, lightness: 50 }
          : { chroma: space === "oklch" ? 0.15 : 60, lightness: 65 },
      hue,
    );
  }
  const stops = Array.from({ length: 17 }, (_, index) =>
    serializeColor(
      writeChannels(
        base,
        space,
        { [channel]: info.min + ((info.max - info.min) * index) / 16 },
        hue,
      ),
      "rgb",
    ),
  );
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}
