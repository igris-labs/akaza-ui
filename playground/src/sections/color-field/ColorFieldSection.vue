<script setup lang="ts">
import { ColorField, ColorSwatch, Field } from "akaza-ui";
import { ref } from "vue";
import { fieldUi, swatchUi } from "../color/styles";
import { canvasCol, exampleStack, exampleTitle, sectionDescription, sectionTitle } from "../styles";
const color = ref("#56d799");
const requiredColor = ref("");
const result = ref("");
function submit(event: Event) {
  result.value = String(new FormData(event.currentTarget as HTMLFormElement).get("brand"));
}
</script>
<template>
  <section id="color-field">
    <h2 :class="sectionTitle">Color Field</h2>
    <p :class="sectionDescription">An input for CSS colors or a single color channel.</p>
    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">CSS color text</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Enter a CSS color. The swatch shows the last valid value while you type.
        </p>
        <div :class="canvasCol">
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
        </div>
      </div>
      <div>
        <h3 :class="exampleTitle">Required field and form reset</h3>
        <p class="mb-3 max-w-2xl text-xs leading-5 text-muted-foreground">
          Enter a valid color to submit. Reset clears the field.
        </p>
        <div :class="canvasCol">
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
        </div>
      </div>
    </div>
  </section>
</template>
