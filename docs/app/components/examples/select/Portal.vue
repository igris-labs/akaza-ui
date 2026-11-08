<script setup lang="ts">
import { ref } from "vue";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { Select } from "../../ui/select";

const open = ref(false);
const project = ref("project-1");
const submitted = ref("Not submitted");
const projects = Array.from({ length: 12 }, (_, index) => ({
  value: `project-${index + 1}`,
  label: `Project ${index + 1}`,
}));
function submit(event: Event) {
  submitted.value = String(new FormData(event.currentTarget as HTMLFormElement).get("project"));
}
</script>

<template>
  <Dialog
    v-model="open"
    title="Project details"
    width="sm"
    :ui="{ content: 'overflow-hidden', body: 'max-h-48 overflow-y-auto' }"
  >
    <template #trigger="{ toggle }">
      <Button
        variant="outline"
        @click="toggle"
      >
        Open project dialog
      </Button>
    </template>
    <template #body>
      <form
        class="grid gap-3"
        @submit.prevent="submit"
      >
        <label
          for="docs-portal-project"
          class="text-sm font-medium text-foreground"
        >
          Project
        </label>
        <Select
          id="docs-portal-project"
          v-model="project"
          :options="projects"
          name="project"
          teleport="body"
          autocomplete
          search-placeholder="Search projects"
        />
        <Button type="submit">Save project</Button>
        <output class="text-xs text-muted-foreground">{{ submitted }}</output>
        <p class="text-sm text-muted-foreground">
          The options can extend outside this scrolling body without changing its overflow.
        </p>
      </form>
    </template>
    <template #footer="{ close }">
      <Button
        variant="outline"
        @click="close"
      >
        Close project dialog
      </Button>
    </template>
  </Dialog>
</template>
