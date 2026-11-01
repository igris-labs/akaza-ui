import type { Ref } from "vue";
import type { ColorChannel, ColorSpace } from "./types";
import type { UseColorReturn } from "./useColor";
import { computed, watch } from "vue";
import { channelInfo, clamp, convertColor, parseColor, writeChannels } from "./engine";

/** Cache the plane by its fixed channels, so dragging within it does not repaint it. */
export function useColorCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  color: UseColorReturn,
  options: () => { space: ColorSpace; x: ColorChannel; y: ColorChannel; rtl: boolean },
) {
  const plane = computed(() => {
    const { space, x, y, rtl } = options();
    const xInfo = channelInfo(space, x);
    const yInfo = channelInfo(space, y);
    const base = writeChannels(parseColor(color.cssColor.value || "#ff0000")!, space, {
      hue: color.getChannel(space, "hue"),
      ...([x, y].includes("alpha") ? {} : { alpha: 100 }),
    });
    return JSON.stringify({
      base: writeChannels(base, space, { [x]: xInfo?.min ?? 0, [y]: yInfo?.min ?? 0 }),
      space,
      x,
      y,
      rtl,
    });
  });
  watch(
    [canvas, plane],
    () => {
      if (!canvas.value || typeof CanvasRenderingContext2D === "undefined") return;
      const context = canvas.value.getContext("2d");
      if (!context) return;
      const { base, space, x, y, rtl } = JSON.parse(plane.value);
      const xInfo = channelInfo(space, x);
      const yInfo = channelInfo(space, y);
      if (!xInfo || !yInfo || x === y) return;
      const size = 64;
      canvas.value.width = canvas.value.height = size;
      const image = context.createImageData(size, size);
      for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
          const ratio = rtl ? 1 - column / (size - 1) : column / (size - 1);
          const value = writeChannels(base, space, {
            [x]: xInfo.min + ratio * (xInfo.max - xInfo.min),
            [y]: yInfo.min + (1 - row / (size - 1)) * (yInfo.max - yInfo.min),
          });
          const rgb = convertColor(value, "rgb");
          const offset = (row * size + column) * 4;
          ["r", "g", "b", "alpha"].forEach((key, index) => {
            image.data[offset + index] = Math.round(
              clamp(Number(rgb[key] ?? (key === "alpha" ? 1 : 0))) * 255,
            );
          });
        }
      }
      context.putImageData(image, 0, 0);
    },
    { flush: "post", immediate: true },
  );
}
