<script setup lang="ts">
import type { ButtonProps } from ".";
import { computed, ref } from "vue";

const {
  as = "button",
  type = "button",
  disabled = false,
  focusableWhenDisabled = false,
  loading = false,
  loadingAuto = false,
  onClick: onClickProp,
  ui,
} = defineProps<ButtonProps>();

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const autoLoading = ref(false);

const isLoading = computed(() => loading || autoLoading.value);
const isDisabled = computed(() => disabled || isLoading.value);

async function handleClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (loadingAuto && onClickProp) {
    const result = onClickProp(event);
    if (result instanceof Promise) {
      autoLoading.value = true;
      try {
        await result;
      } finally {
        autoLoading.value = false;
      }
    }
    return;
  }

  emit("click", event);
}

function handleKeydown(event: KeyboardEvent) {
  if (as === "button") return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  (event.currentTarget as HTMLElement).click();
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :role="as === 'button' ? undefined : 'button'"
    :disabled="as === 'button' && isDisabled && !focusableWhenDisabled ? true : undefined"
    :aria-disabled="isDisabled ? true : undefined"
    :aria-busy="isLoading ? true : undefined"
    :tabindex="focusableWhenDisabled ? 0 : isDisabled ? -1 : as === 'button' ? undefined : 0"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-loading="isLoading || undefined"
    :data-akaza-state="isLoading ? 'loading' : disabled ? 'disabled' : 'enabled'"
    :class="ui?.root"
    class="akaza-button"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot v-if="!isLoading" />
    <slot
      v-else
      name="loading"
    >
      <svg
        :class="ui?.spinner"
        class="akaza-button-spinner"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span :class="ui?.loadingText" class="sr-only">Loading…</span>
    </slot>
  </component>
</template>

<style>
.akaza-button .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
