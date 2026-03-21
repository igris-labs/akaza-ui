<script setup lang="ts">
import type { MenuProps } from ".";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import { useId, useTemplateRef } from "vue";
import { useMenu } from "../../composables/menu";

const { as = "div", ui } = defineProps<MenuProps>();

const model = defineModel<boolean>({ default: false });
const { open, close, toggle } = useMenu(model);

const menuId = useId();
const rootRef = useTemplateRef<HTMLElement>("rootRef");
const contentRef = useTemplateRef<HTMLElement>("contentRef");

function getItems(): HTMLElement[] {
  return Array.from(
    contentRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled])') ?? [],
  );
}

onClickOutside(rootRef, () => {
  if (model.value) close();
});

onKeyStroke("Escape", (e) => {
  if (model.value) {
    e.preventDefault();
    close();
  }
});

onKeyStroke(["ArrowDown", "ArrowUp", "Home", "End"], (e) => {
  if (!model.value) return;
  e.preventDefault();
  const items = getItems();
  if (items.length === 0) return;
  const currentIdx = items.indexOf(document.activeElement as HTMLElement);
  let next = currentIdx;

  if (e.key === "ArrowDown") next = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
  else if (e.key === "ArrowUp") next = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = items.length - 1;

  items[next]?.focus();
});
</script>

<template>
  <div
    ref="rootRef"
    :data-akaza-state="model ? 'open' : 'closed'"
    class="akaza-menu-root"
  >
    <slot
      name="trigger"
      :is-open="model"
      :open="open"
      :close="close"
      :toggle="toggle"
    />
    <Transition name="akaza-menu">
      <component
        :is="as"
        v-if="model"
        :id="menuId"
        ref="contentRef"
        role="menu"
        aria-orientation="vertical"
        :class="ui?.content"
        data-akaza-state="open"
        class="akaza-menu-content"
      >
        <slot
          name="content"
          :close="close"
        />
      </component>
    </Transition>
  </div>
</template>

<style>
.akaza-menu-root {
  position: relative;
  display: inline-block;
}

.akaza-menu-enter-active,
.akaza-menu-leave-active {
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out;
}

.akaza-menu-enter-from,
.akaza-menu-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
