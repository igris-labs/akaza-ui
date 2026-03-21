import { readonly, ref } from "vue";

export type AvatarImageStatus = "idle" | "loading" | "loaded" | "error";

export interface UseAvatarReturn {
  imageStatus: Readonly<ReturnType<typeof ref<AvatarImageStatus>>>;
}

/**
 * Tracks avatar image load state externally — useful when you need to
 * react to load status outside the Avatar component itself.
 */
export function useAvatar(src: string): UseAvatarReturn {
  const imageStatus = ref<AvatarImageStatus>("idle");

  const img = new Image();
  imageStatus.value = "loading";
  img.addEventListener("load", () => {
    imageStatus.value = "loaded";
  });
  img.addEventListener("error", () => {
    imageStatus.value = "error";
  });
  img.src = src;

  return { imageStatus: readonly(imageStatus) };
}
