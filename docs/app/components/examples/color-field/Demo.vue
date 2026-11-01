<script setup lang="ts">
import { ColorField, ColorSwatch, Field } from "akaza-ui";
import { ref } from "vue";
import { fieldUi, swatchUi } from "../color/styles";
const color = ref("#56d799");
const requiredColor = ref("");
const result = ref("");
function submit(event: Event) {
  result.value = String(new FormData(event.currentTarget as HTMLFormElement).get("brand"));
}
</script>
<template>
  <div class="grid min-w-0 gap-6 [--ui-radius:0.25rem]">
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">CSS color text</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Enter a CSS color. The swatch shows the last valid value while you type.
      </p>
      <Field
        label="Color"
        :ui="{ root: 'grid w-full max-w-64 gap-2', label: 'text-sm font-medium' }"
      >
        <div class="flex min-w-0 items-center gap-3">
          <ColorSwatch
            :color="color"
            decorative
            :ui="swatchUi"
          />
          <ColorField
            v-model="color"
            aria-label="CSS color"
            :ui="fieldUi"
          />
        </div>
      </Field>
    </section>
    <section class="grid min-w-0 gap-3">
      <h3 class="text-sm font-medium">Required field and form reset</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Enter a valid color to submit. Reset clears the field.
      </p>
      <form
        class="grid max-w-sm gap-3"
        @submit.prevent="submit"
      >
        <Field
          label="Brand color"
          name="brand"
          required
          :ui="{
            root: 'grid gap-1',
            label: 'text-sm font-medium',
            error: 'text-xs text-destructive',
          }"
        >
          <ColorField
            v-model="requiredColor"
            format="lch"
            placeholder="Enter a color"
            :ui="fieldUi"
          />
        </Field>
        <div class="flex gap-2">
          <button
            class="rounded-md border border-input px-3 py-1.5 text-sm"
            type="submit"
          >
            Submit color
          </button>
          <button
            class="rounded-md border border-input px-3 py-1.5 text-sm"
            type="reset"
          >
            Reset
          </button>
        </div>
        <output class="break-all font-mono text-xs">{{ result || "Not submitted" }}</output>
      </form>
    </section>
  </div>
</template>
