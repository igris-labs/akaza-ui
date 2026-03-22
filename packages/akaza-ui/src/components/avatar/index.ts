export { default as Avatar } from "./Avatar.vue";

export interface AvatarUi {
  root?: string;
  image?: string;
  fallback?: string;
}

export interface AvatarProps {
  as?: string;
  src?: string;
  alt?: string;
  /** Fallback text (e.g. initials) shown when image is absent or fails. Slot #fallback takes priority. */
  text?: string;
  /** Delay in ms before the fallback is shown. Avoids a flash for users with fast connections. Defaults to 0. */
  delayMs?: number;
  ui?: AvatarUi;
}
