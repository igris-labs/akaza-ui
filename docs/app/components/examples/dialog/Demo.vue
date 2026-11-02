<script setup lang="ts">
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { Field } from "../../ui/field";
import { Input } from "../../ui/input";
</script>
<template>
  <Dialog title="Edit profile">
    <template #trigger="{ toggle }"><Button @click="toggle">Edit profile</Button></template>
    <template #header="{ close, titleId }">
      <div class="flex items-center justify-between gap-4">
        <h2
          :id="titleId"
          class="text-base font-semibold"
        >
          Edit profile
        </h2>
        <Button
          variant="ghost"
          shape="icon"
          aria-label="Close"
          @click="close"
        >
          <Icon
            name="lucide:x"
            class="size-4"
            aria-hidden="true"
          />
        </Button>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4">
        <Field label="Display name"><Input placeholder="Jane Doe" /></Field><Field label="Email">
          <Input
            type="email"
            placeholder="jane@example.com"
          />
        </Field>
      </div>
    </template>
    <template #footer="{ close }">
      <Button
        color="secondary"
        variant="outline"
        @click="close"
      >
        Cancel
      </Button><Button @click="close">Save changes</Button>
    </template>
  </Dialog>
</template>
