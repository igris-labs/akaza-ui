<script setup lang="ts">
import type { AvatarImageStatus, AvatarProps } from ".";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(defineProps<AvatarProps>(), {
  as: "span",
  alt: "",
  delayMs: 0,
});

const emit = defineEmits<{
  "status-change": [status: AvatarImageStatus];
}>();

const imageStatus = ref<AvatarImageStatus>("idle");
const showFallback = ref(false);
let cleanupLoad: (() => void) | undefined;
let loadedInSetup = false;

function setStatus(status: AvatarImageStatus) {
  if (imageStatus.value === status) return;
  imageStatus.value = status;
  emit("status-change", status);
}

function loadImage() {
  cleanupLoad?.();
  cleanupLoad = undefined;
  showFallback.value = false;

  if (!props.src) {
    setStatus("error");
    showFallback.value = true;
    return;
  }

  if (typeof Image === "undefined") {
    setStatus("loading");
    showFallback.value = props.delayMs <= 0;
    return;
  }

  loadedInSetup = true;
  setStatus("loading");

  const timer = props.delayMs > 0
    ? setTimeout(() => {
        if (imageStatus.value !== "loaded") showFallback.value = true;
      }, props.delayMs)
    : undefined;

  if (props.delayMs <= 0) showFallback.value = true;

  const img = new Image();
  const onLoad = () => {
    if (timer) clearTimeout(timer);
    showFallback.value = false;
    setStatus("loaded");
  };
  const onError = () => {
    if (timer) clearTimeout(timer);
    showFallback.value = true;
    setStatus("error");
  };

  img.addEventListener("load", onLoad);
  img.addEventListener("error", onError);
  img.src = props.src;

  cleanupLoad = () => {
    if (timer) clearTimeout(timer);
    img.removeEventListener("load", onLoad);
    img.removeEventListener("error", onError);
  };
}

watch(() => [props.src, props.delayMs] as const, loadImage, { immediate: true });
onMounted(() => {
  if (!loadedInSetup) loadImage();
});
onUnmounted(() => cleanupLoad?.());
</script>

<template>
  <component
    :is="props.as"
    :data-akaza-status="imageStatus"
    :class="props.ui?.root"
    class="akaza-avatar"
  >
    <slot name="image" :src="props.src" :alt="props.alt" :status="imageStatus">
      <img
        v-show="imageStatus === 'loaded'"
        :src="props.src"
        :alt="props.alt"
        :class="props.ui?.image"
        class="akaza-avatar-image"
      >
    </slot>

    <span
      v-if="showFallback && imageStatus !== 'loaded'"
      :data-akaza-status="imageStatus"
      :class="props.ui?.fallback"
      class="akaza-avatar-fallback"
    >
      <slot name="fallback" :status="imageStatus">{{ props.text }}</slot>
    </span>
  </component>
</template>
