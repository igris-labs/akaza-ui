<script setup lang="ts">
import type { AvatarProps } from ".";
import type { AvatarImageStatus } from "../../composables/avatar/useAvatar";
import { onMounted, ref } from "vue";

const {
  as = "span",
  src,
  alt = "",
  text,
  delayMs = 0,
  ui,
} = defineProps<AvatarProps>();

const imageStatus = ref<AvatarImageStatus>("idle");
const showFallback = ref(false);

onMounted(() => {
  if (!src) {
    imageStatus.value = "error";
    showFallback.value = true;
    return;
  }

  imageStatus.value = "loading";

  if (delayMs > 0) {
    setTimeout(() => {
      if (imageStatus.value !== "loaded") {
        showFallback.value = true;
      }
    }, delayMs);
  } else {
    showFallback.value = true;
  }

  const img = new Image();
  img.addEventListener("load", () => {
    imageStatus.value = "loaded";
  });
  img.addEventListener("error", () => {
    imageStatus.value = "error";
    showFallback.value = true;
  });
  img.src = src;
});
</script>

<template>
  <component
    :is="as"
    :data-akaza-status="imageStatus"
    :class="ui?.root"
    class="akaza-avatar"
  >
    <slot name="image" :src="src" :alt="alt" :status="imageStatus">
      <img
        v-show="imageStatus === 'loaded'"
        :src="src"
        :alt="alt"
        :class="ui?.image"
        class="akaza-avatar-image"
      />
    </slot>

    <span
      v-if="showFallback && imageStatus !== 'loaded'"
      aria-hidden="true"
      :data-akaza-status="imageStatus"
      :class="ui?.fallback"
      class="akaza-avatar-fallback"
    >
      <slot name="fallback" :status="imageStatus">{{ text }}</slot>
    </span>
  </component>
</template>
