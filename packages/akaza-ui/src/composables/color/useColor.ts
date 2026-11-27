import type { Ref } from "vue";
import type { ColorData } from "./engine";
import type { ColorChannel, ColorSpace, UseColorOptions } from "./types";
import { computed, ref, shallowRef, toValue, watch } from "vue";
import { createChangeDetails } from "../../utils/changeEvent";
import {
  channelInfo,
  convertColor,
  isSrgb,
  parseColor,
  readChannel,
  serializeColor,
  writeChannels,
} from "./engine";

/**
 * Read and change a color without rendering a picker.
 * Pass a writable Vue ref to share the color and a ref or getter for a format that changes.
 * Read `value` for CSS output, or call `setValue` and `setChannels` to edit it.
 * Invalid input or a canceled change leaves the color as it was.
 *
 * @example
 * ```ts
 * import { useColor } from "akaza-ui";
 * import { ref } from "vue";
 *
 * const accent = ref("#336699");
 * const { value, setValue } = useColor(accent, { format: "oklch" });
 * setValue("#445566");
 * ```
 */
export function useColor(model: Ref<string> = ref("#ff0000"), options: UseColorOptions = {}) {
  const color = shallowRef<ColorData | null>(parseColor(model.value));
  const initialColor = color.value;
  const format = computed(() => toValue(options.format) ?? "hex");
  const formattedValue = computed(() => serializeColor(color.value, format.value));
  const hueMemory: Partial<Record<ColorSpace, number>> = {};
  let ownOutput: string | undefined;
  function remember(value: ColorData | null) {
    if (!value) return;
    for (const space of ["hsl", "hsb", "hwb", "lch", "oklch"] as const) {
      const hue = convertColor(value, space).h;
      if (typeof hue === "number" && Number.isFinite(hue)) hueMemory[space] = hue;
    }
  }
  remember(color.value);
  watch(
    model,
    (value) => {
      if (value === ownOutput) return;
      ownOutput = undefined;
      color.value = parseColor(value);
      remember(color.value);
    },
    { flush: "sync" },
  );

  function update(value: ColorData | null, reason: string, event?: Event): boolean {
    const output = serializeColor(value, format.value);
    const change = createChangeDetails(reason, event);
    options.onChange?.(output, change.details);
    if (change.canceled()) return false;
    ownOutput = output;
    color.value = value;
    if (reason === "reset")
      for (const space of Object.keys(hueMemory)) delete hueMemory[space as ColorSpace];
    remember(value);
    model.value = output;
    return true;
  }
  function setValue(value: string, reason = "programmatic", event?: Event): boolean {
    const next = value.trim() ? parseColor(value) : null;
    return value.trim() && !next ? false : update(next, reason, event);
  }
  function getChannel(space: ColorSpace, channel: ColorChannel) {
    return readChannel(color.value ?? parseColor("#ff0000")!, space, channel, hueMemory[space]);
  }
  function setChannels(
    space: ColorSpace,
    changes: Partial<Record<ColorChannel, number>>,
    reason = "programmatic",
    event?: Event,
  ) {
    const next = writeChannels(
      color.value ?? parseColor("#ff0000")!,
      space,
      changes,
      hueMemory[space],
    );
    return update(next, reason, event);
  }
  function commit(reason = "programmatic", event?: Event) {
    options.onCommit?.(formattedValue.value, createChangeDetails(reason, event).details);
  }
  watch(format, () => {
    if (color.value) update(color.value, "format");
  });
  return {
    value: computed(() => formattedValue.value),
    format,
    isEmpty: computed(() => model.value === ""),
    isValid: computed(() => !model.value || color.value !== null),
    isOutOfGamut: computed(() => !isSrgb(color.value)),
    cssColor: computed(() => serializeColor(color.value, "oklch")),
    getChannel,
    getChannelInfo: (space: ColorSpace, channel: ColorChannel) => {
      const info = channelInfo(space, channel);
      return info ? { ...info } : null;
    },
    setChannels,
    setValue,
    commit,
    reset: () => update(initialColor, "reset"),
    /** A plain CSS string in any supported output format; no engine types escape. */
    toString: (outputFormat = format.value) => serializeColor(color.value, outputFormat),
  };
}

export type UseColorReturn = ReturnType<typeof useColor>;
