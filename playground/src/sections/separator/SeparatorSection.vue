<script setup lang="ts">
import { Separator } from "akaza-ui";
import {
  canvasCol,
  sectionDescriptionTight,
  sectionTitle,
} from "../styles";
</script>

<template>
  <section id="separator">
    <h2 :class="sectionTitle">Separator</h2>
    <p :class="sectionDescriptionTight">A visual divider, decorative or semantic.</p>
    <div :class="canvasCol">
      <div>
        <p class="text-xs text-muted-foreground mb-2">Horizontal</p>
        <Separator class="border-t border-border w-full" />
      </div>
      <div>
        <p class="text-xs text-muted-foreground mb-2">Vertical</p>
        <div class="flex items-center gap-4 h-8">
          <span class="text-sm text-muted-foreground">Left</span>
          <Separator orientation="vertical" class="border-l border-border h-full" />
          <span class="text-sm text-muted-foreground">Right</span>
        </div>
      </div>
    </div>
  </section>
</template>
