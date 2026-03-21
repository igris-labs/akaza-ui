<script setup lang="ts">
import type { AvatarProps } from ".";
import type { AvatarImageStatus } from "../../composables/avatar/useAvatar";
import { onMounted, ref } from "vue";

const { as = "span", src, alt = "" } = defineProps<AvatarProps>();

const imageStatus = ref<AvatarImageStatus>("idle");

onMounted(() => {
  if (!src) {
    imageStatus.value = "error";
    return;
  }

  imageStatus.value = "loading";
  const img = new Image();
  img.addEventListener("load", () => {
    imageStatus.value = "loaded";
  });
  img.addEventListener("error", () => {
    imageStatus.value = "error";
  });
  img.src = src;
});
</script>

<template>
  <component
    :is="as"
    :data-akaza-status="imageStatus"
    class="akaza-avatar"
  >
    <img
      v-show="imageStatus === 'loaded'"
      :src="src"
      :alt="alt"
      class="akaza-avatar-image"
    />

    <span
      v-if="imageStatus !== 'loaded'"
      aria-hidden="true"
      :data-akaza-status="imageStatus"
      class="akaza-avatar-fallback"
    >
      <slot
        name="fallback"
        :status="imageStatus"
      />
    </span>
  </component>
</template>
