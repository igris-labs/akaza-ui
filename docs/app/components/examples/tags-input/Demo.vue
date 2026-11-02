<script setup lang="ts">
import type { AkazaChangeEventDetails, TagsInputValue } from "akaza-ui";
import { ref } from "vue";
import { TagsInput } from "../../ui/tags-input";

const values = ref<TagsInputValue[]>(["Vue", "TypeScript"]);
const message = ref("Press Enter or comma to add a tag.");

function onInvalidValue(_value: TagsInputValue | string, details: AkazaChangeEventDetails) {
  message.value = `Not added: ${details.reason}`;
}
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm font-medium text-foreground">Technologies</p>
    <TagsInput
      v-model="values"
      add-on-paste
      clearable
      :max="5"
      placeholder="Add technology"
      @invalid-value="onInvalidValue"
    />
    <p class="text-xs text-muted-foreground">{{ message }} {{ values.length }}/5 tags.</p>
  </div>
</template>
