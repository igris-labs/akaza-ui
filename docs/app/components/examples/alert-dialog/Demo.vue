<script setup lang="ts">
import { AlertDialog } from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
</script>
<template>
  <AlertDialog
    title="Delete account"
    description="This action is permanent and cannot be undone. All your data will be removed from our servers."
  >
    <template #trigger="{ toggle }">
      <Button
        color="destructive"
        @click="toggle"
      >
        Delete account
      </Button>
    </template>
    <template #footer="{ close }">
      <Button
        color="secondary"
        variant="outline"
        @click="close"
      >
        Cancel
      </Button><Button
        color="destructive"
        @click="close"
      >
        Delete
      </Button>
    </template>
  </AlertDialog>
</template>
