<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { ToastProps, ToastSlots } from "./index";
import { Toast as Primitive } from "akaza-ui";

import { computed, nextTick, onBeforeUnmount, onMounted, reactive, useAttrs } from "vue";
import { cn } from "../../../utils/ui";
import uiConfig from "../ui.config";
import { resolveToastVariants, toastVariants } from "./index";

defineOptions({ inheritAttrs: false });
// Preserve Akaza defaults when optional props, including Boolean aliases, are omitted.
const props = withDefaults(defineProps<ToastProps>(), {
  position: undefined,
  limit: undefined,
  stack: undefined,
  gap: undefined,
  peek: undefined,
  scaleStep: undefined,
  hotkey: undefined,
  hotkeyLabel: undefined,
  closeLabel: undefined,
  swipeDirection: undefined,
  swipeThreshold: undefined,
  pauseOnHover: undefined,
  pauseOnFocus: undefined,
  pauseOnWindowBlur: undefined,
  teleport: undefined,
  manager: undefined,
  ui: undefined,
});
defineSlots<ToastSlots>();
const attrs = useAttrs();
// Explicit intrinsic heights keep Akaza's height transition without clipping new content.
const layouts = new Map<string, HTMLElement>();
let observer: ResizeObserver | undefined;
function measureLayout(layout: HTMLElement) {
  const toast = layout.closest<HTMLElement>(".akaza-toast");
  if (!toast || !layout.isConnected) return;
  const style = getComputedStyle(toast);
  const inset = [
    style.paddingTop,
    style.paddingBottom,
    style.borderTopWidth,
    style.borderBottomWidth,
  ].reduce((total, value) => total + Number.parseFloat(value), 0);
  const height = `${layout.offsetHeight + inset}px`;
  if (toast.style.getPropertyValue("--ipex-toast-height") !== height)
    toast.style.setProperty("--ipex-toast-height", height);
}
function setLayout(key: string, element: Element | ComponentPublicInstance | null) {
  const previous = layouts.get(key);
  if (previous === element) return;
  if (previous) observer?.unobserve(previous);
  if (!(element instanceof HTMLElement)) {
    layouts.delete(key);
    return;
  }
  layouts.set(key, element);
  observer?.observe(element);
  void nextTick(() => measureLayout(element));
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    for (const entry of entries)
      if (entry.target instanceof HTMLElement) measureLayout(entry.target);
  });
  for (const layout of layouts.values()) observer.observe(layout);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  layouts.clear();
});
const pendingActions = reactive(new Set<string>());
async function performAction(id: string, action: (event: Event) => unknown, event: Event) {
  if (pendingActions.has(id)) return;
  pendingActions.add(id);
  try {
    await action(event);
  } finally {
    pendingActions.delete(id);
  }
}
function isPending(data: unknown) {
  return data !== null && typeof data === "object" && "pending" in data && data.pending === true;
}
const circle = "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z";
const iconPaths = {
  status: `${circle} M12 8h.01M12 11v5`,
  info: `${circle} M12 8h.01M12 11v5`,
  success: `${circle} m-13 0 2 2 4-4`,
  error: `${circle} M9 9l6 6m0-6-6 6`,
  warning:
    "M10.3 3.9 1.8 18.1A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01",
  alert: `${circle} M12 7v6m0 4h.01`,
};

const styles = computed(() => toastVariants(resolveToastVariants(props, uiConfig)));
const mergedUi = computed(() => {
  const overrides = props.ui as Record<string, string | undefined> | undefined;
  return Object.fromEntries(
    Object.entries(styles.value).map(([part, style]) => [
      part,
      cn(style(), overrides?.[part], part === "toast" ? props.class : undefined),
    ]),
  );
});
const primitiveProps = computed(() => {
  const { class: _class, ui: _ui, size: _size, ...native } = props;
  return native;
});
</script>
<template>
  <component
    :is="Primitive"
    v-bind="{ ...primitiveProps, ...attrs }"
    :ui="mergedUi"
  >
    <template
      v-if="!$slots.toast"
      #toast="scope"
    >
      <div
        :ref="
          (element: Element | ComponentPublicInstance | null) =>
            setLayout(`${scope.toast.id}:${scope.toast.updateKey}`, element)
        "
        :class="mergedUi.layout"
      >
        <svg
          :class="[mergedUi.icon, isPending(scope.toast.data) && 'motion-safe:animate-spin']"
          :data-type="scope.type"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="isPending(scope.toast.data) ? 'M12 3a9 9 0 1 0 9 9' : iconPaths[scope.type]" />
        </svg>
        <div :class="mergedUi.content">
          <div
            v-if="scope.toast.title || $slots.title"
            class="akaza-toast-title"
            :class="mergedUi.title"
          >
            <slot
              name="title"
              :toast="scope.toast"
            >
              {{ scope.toast.title }}
            </slot>
          </div>
          <div
            v-if="scope.toast.description || $slots.description"
            class="akaza-toast-description"
            :class="mergedUi.description"
          >
            <slot
              name="description"
              :toast="scope.toast"
            >
              {{ scope.toast.description }}
            </slot>
          </div>
        </div>
        <button
          type="button"
          class="akaza-toast-close"
          :class="mergedUi.close"
          :aria-label="closeLabel ?? 'Dismiss notification'"
          @click="scope.close('close-button')"
        >
          <slot
            name="close"
            :toast="scope.toast"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </slot>
        </button>
        <button
          v-if="scope.action"
          type="button"
          class="akaza-toast-action"
          :class="mergedUi.action"
          :aria-label="scope.action.altText"
          :aria-busy="pendingActions.has(scope.toast.id) || undefined"
          :disabled="pendingActions.has(scope.toast.id)"
          @click="performAction(scope.toast.id, scope.performAction, $event)"
        >
          <svg
            v-if="pendingActions.has(scope.toast.id)"
            class="shrink-0 motion-safe:animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
          {{ scope.action.label }}
        </button>
      </div>
    </template>
    <template
      v-for="(_, name) in $slots"
      #[name]="scope"
    >
      <slot
        :name="name as keyof ToastSlots"
        v-bind="scope ?? {}"
      />
    </template>
  </component>
</template>
