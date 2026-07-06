<script setup lang="ts">
import type { StyleValue } from "vue";
import type { ButtonProps } from ".";
import { computed, ref, useAttrs } from "vue";

defineOptions({ inheritAttrs: false });

const {
  as = "button",
  type = "button",
  disabled = false,
  focusableWhenDisabled = false,
  loading = false,
  loadingAuto = false,
  ui,
} = defineProps<ButtonProps>();

const attrs = useAttrs();
const autoLoading = ref(false);

const isLoading = computed(() => loading || autoLoading.value);
const isDisabled = computed(() => disabled || isLoading.value);
const rootStyle = computed(() => attrs.style as StyleValue);
const rootAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    onClick,
    ...rest
  } = attrs;

  if (!loadingAuto && !isDisabled.value && onClick) {
    return { ...rest, onClick };
  }

  return rest;
});

type ClickHandler = (event: MouseEvent) => unknown;

function callClickHandlers(handler: unknown, event: MouseEvent): unknown[] {
  if (!handler) return [];
  const handlers = Array.isArray(handler) ? handler : [handler];
  return handlers.map((item) => (typeof item === "function" ? (item as ClickHandler)(event) : undefined));
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof value === "object"
    && value !== null
    && "then" in value
    && typeof (value as PromiseLike<unknown>).then === "function";
}

async function handleClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (!loadingAuto) return;

  const promises = callClickHandlers(attrs.onClick, event).filter(isPromiseLike);
  if (promises.length === 0) return;

  autoLoading.value = true;
  try {
    await Promise.all(promises);
  } finally {
    autoLoading.value = false;
  }
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
    v-bind="rootAttrs"
    :type="as === 'button' ? type : undefined"
    :role="as === 'button' ? undefined : 'button'"
    :disabled="as === 'button' && isDisabled && !focusableWhenDisabled ? true : undefined"
    :aria-disabled="isDisabled ? true : undefined"
    :aria-busy="isLoading ? true : undefined"
    :tabindex="focusableWhenDisabled ? 0 : isDisabled ? -1 : as === 'button' ? undefined : 0"
    :data-akaza-disabled="disabled || undefined"
    :data-akaza-loading="isLoading || undefined"
    :data-akaza-state="isLoading ? 'loading' : disabled ? 'disabled' : 'enabled'"
    :class="[ui?.root, attrs.class]"
    :style="rootStyle"
    class="akaza-button"
    @click.capture="handleClick"
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
      <span :class="ui?.loadingText" class="akaza-button-loading-text sr-only">Loading…</span>
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

.akaza-button-spinner {
  animation: akaza-button-spin 1s linear infinite;
}

@keyframes akaza-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
