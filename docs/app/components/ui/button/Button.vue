<script setup lang="ts">
import type { ButtonProps } from "./index";
import { Button as ButtonPrimitive } from "akaza-ui";

import { computed, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { buttonVariants, resolveButtonVariants } from "./index";

defineOptions({ inheritAttrs: false });
const props = defineProps<ButtonProps>();
const attrs = useAttrs();

const styles = computed(() => buttonVariants(resolveButtonVariants(props, uiConfig)));

const primitiveProps = computed(() => {
  const {
    color: _color,
    variant: _variant,
    size: _size,
    shape: _shape,
    class: _class,
    ui: _ui,
    ...primitive
  } = props;
  return primitive;
});
</script>

<template>
  <ButtonPrimitive
    v-bind="{ ...primitiveProps, ...attrs }"
    data-slot="button"
    :class="cn(styles.root(), props.ui?.root, props.class)"
    :ui="{
      spinner: cn(styles.spinner(), props.ui?.spinner),
      loadingText: cn(styles.loadingText(), props.ui?.loadingText),
    }"
  >
    <span :class="cn(styles.content(), props.ui?.content)"><slot /></span>
    <template #loading>
      <span class="grid items-center justify-items-center">
        <span
          aria-hidden="true"
          :class="cn(styles.content(), 'invisible col-start-1 row-start-1', props.ui?.content)"
        ><slot /></span>
        <span class="col-start-1 row-start-1 inline-flex items-center justify-center">
          <slot name="loading">
            <svg
              :class="cn(styles.spinner(), props.ui?.spinner)"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span :class="cn(styles.loadingText(), props.ui?.loadingText)">Loading</span>
          </slot>
        </span>
      </span>
    </template>
  </ButtonPrimitive>
</template>
