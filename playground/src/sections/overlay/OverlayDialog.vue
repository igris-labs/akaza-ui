<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import {
  buttonGhost,
  buttonPrimary,
  dialogBodyText,
  dialogContent,
  dialogOverlay,
  footerActions,
} from "../styles";

const { title = "Overlay Dialog", message = "" } = defineProps<{
  title?: string;
  message?: string;
}>();

const model = defineModel<boolean>({ default: false });
const emit = defineEmits<{ close: [value: unknown] }>();

const contentRef = useTemplateRef<HTMLElement>("contentRef");

watch(model, async (val) => {
  if (val) {
    await nextTick();
    contentRef.value?.focus();
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="model"
        :class="[dialogOverlay, 'grid place-items-center']"
        @click.self="model = false"
      >
        <div
          ref="contentRef"
          role="dialog"
          aria-modal="true"
          :class="[dialogContent, 'outline-none']"
          tabindex="-1"
          @keydown.escape.prevent="model = false"
        >
          <div v-if="title" class="border-b border-border p-4">
            <div class="text-base font-semibold text-foreground">{{ title }}</div>
          </div>
          <div v-if="message" class="p-5">
            <p :class="dialogBodyText">{{ message }}</p>
          </div>
          <div class="border-t border-border p-4">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="emit('close', false)">Cancel</button>
              <button :class="buttonPrimary" @click="emit('close', true)">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
