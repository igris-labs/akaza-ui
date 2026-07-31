<script setup lang="ts">
import { Pagination } from "akaza-ui";
import { ref } from "vue";
import {
  canvasCol,
  canvasGrid,
  codePill,
  exampleStack,
  exampleTitle,
  paginationUi,
  sectionDescription,
  sectionTitle,
} from "../styles";

const page = ref(7);
const compactPage = ref(2);
</script>

<template>
  <section id="pagination">
    <h2 :class="sectionTitle">Pagination</h2>
    <p :class="sectionDescription">
      Page navigation with computed ranges, ellipses, boundary controls, links, and cancelable updates.
    </p>

    <div :class="exampleStack">
      <div>
        <h3 :class="exampleTitle">Edges + boundary controls</h3>
        <div :class="canvasCol">
          <Pagination v-model="page" :total="240" :items-per-page="10" show-edges show-first-last :ui="paginationUi" />
          <code :class="codePill">page: {{ page }} / 24</code>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Compact range</h3>
        <div :class="canvasCol">
          <Pagination v-model="compactPage" :total="48" :items-per-page="10" :sibling-count="1" :ui="paginationUi" />
          <p class="text-xs text-muted-foreground">Without edges, the visible window follows the current page.</p>
        </div>
      </div>

      <div>
        <h3 :class="exampleTitle">Link and disabled states</h3>
        <div :class="[canvasGrid, 'gap-6']">
          <Pagination
            :model-value="2"
            :total="50"
            :get-page-href="(value) => `?page=${value}`"
            aria-label="Linked pages"
            :ui="paginationUi"
          />
          <Pagination :model-value="2" :total="50" disabled aria-label="Disabled pagination" :ui="paginationUi" />
        </div>
      </div>
    </div>
  </section>
</template>
