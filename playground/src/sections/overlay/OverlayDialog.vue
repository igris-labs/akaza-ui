<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";

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
    <Transition name="ov-dialog">
      <div
        v-if="model"
        class="ov-dlg-overlay"
        @click.self="model = false"
      >
        <div
          ref="contentRef"
          role="dialog"
          aria-modal="true"
          class="ov-dlg-content"
          tabindex="-1"
          @keydown.escape.prevent="model = false"
        >
          <div v-if="title" class="ov-dlg-header">
            <div class="ov-dlg-title">{{ title }}</div>
          </div>
          <div v-if="message" class="ov-dlg-body">
            <p class="ov-dlg-message">{{ message }}</p>
          </div>
          <div class="ov-dlg-footer-section">
            <div class="ov-dlg-footer">
              <button class="ov-btn-ghost" @click="emit('close', false)">Cancel</button>
              <button class="ov-btn-primary" @click="emit('close', true)">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
