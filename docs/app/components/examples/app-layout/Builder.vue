<script setup lang="ts">
import type { AppLayoutConfig, AppLayoutScroll, AppLayoutSideMode, AppLayoutSpan, SidebarCollapsible } from "akaza-ui";
import { computed, ref } from "vue";
import GeneratedCodePre from "../../GeneratedCodePre.vue";
import Demo from "./Demo.vue";

const showHeader = ref(true);
const showFooter = ref(true);
const showLeft = ref(true);
const showRight = ref(false);
const headerSpan = ref<AppLayoutSpan>("full");
const footerSpan = ref<AppLayoutSpan>("full");
const leftMode = ref<AppLayoutSideMode>("inline");
const rightMode = ref<AppLayoutSideMode>("inline");
const leftSize = ref(168);
const rightSize = ref(160);
const scroll = ref<AppLayoutScroll>("content");
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const collapsible = ref<SidebarCollapsible>("icon");
const previewMode = ref("auto");
const previewKey = ref(0);
const mobile = computed(() => previewMode.value === "auto" ? undefined : previewMode.value === "mobile");
const layout = computed<AppLayoutConfig>(() => ({ header: headerSpan.value, footer: footerSpan.value, left: leftMode.value, right: rightMode.value }));
const control = "min-h-9 w-full min-w-0 border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

function reset() {
  showHeader.value = showFooter.value = showLeft.value = true;
  showRight.value = false;
  headerSpan.value = footerSpan.value = "full";
  leftMode.value = rightMode.value = "inline";
  leftSize.value = 168;
  rightSize.value = 160;
  scroll.value = "content";
  stickyHeader.value = stickyFooter.value = false;
  collapsible.value = "icon";
  previewMode.value = "auto";
  previewKey.value += 1;
}

const code = computed(() => {
  const hasSides = showLeft.value || showRight.value;
  const imports = hasSides ? "AppLayout, Sidebar, useSidebar" : "AppLayout";
  const setup = [
    ...(hasSides ? ['import type { SidebarController } from "akaza-ui";'] : []),
    `import { ${imports} } from "akaza-ui";`,
    ...(hasSides ? ['import { useTemplateRef } from "vue";'] : []),
    "",
    ...(showLeft.value ? ['const left = useSidebar(useTemplateRef<SidebarController>("leftSidebar"));'] : []),
    ...(showRight.value ? ['const right = useSidebar(useTemplateRef<SidebarController>("rightSidebar"));'] : []),
    `const layout = ${JSON.stringify(layout.value, null, 2)};`,
  ].join("\n");
  const toggle = (side: string) => `<button type="button" :aria-expanded="${side}.isMobile.value ? ${side}.open.value : !${side}.collapsed.value" @click="${side}.toggle">${side === "left" ? "Navigation" : "Inspector"}</button>`;
  const side = (name: "left" | "right") => `
      <template #${name}>
        <Sidebar ref="${name}Sidebar"${name === "right" ? ' side="right"' : ''}
          :default-size="${name === "left" ? leftSize.value : rightSize.value}" :min-size="128" :max-size="240"
          collapsible="${collapsible.value}"${mobile.value === undefined ? '' : ` :mobile="${mobile.value}"`} resizable
          aria-label="${name === "left" ? "Workspace navigation" : "Workspace inspector"}">
          <template #header="{ isMobile, closeMobile }">
            <button v-if="isMobile" type="button" @click="closeMobile">Close</button>
          </template>
          <template #default="{ collapsed }">
            ${name === "left" ? '<nav aria-label="Workspace sections">\n              <a href="/projects">{{ collapsed ? "P" : "Projects" }}</a>\n            </nav>' : '<span>{{ collapsed ? "I" : "Project details" }}</span>'}
          </template>
        </Sidebar>
      </template>`;
  return `<script setup lang="ts">
${setup}
</${"script"}>

<template>${!showHeader.value && hasSides ? `\n  ${[showLeft.value && toggle("left"), showRight.value && toggle("right")].filter(Boolean).join("\n  ")}` : ''}
  <div style="height: 24rem; overflow: auto">
    <AppLayout :viewport="false" :layout="layout" scroll="${scroll.value}"${scroll.value === "page" && showHeader.value && stickyHeader.value ? ' sticky-header' : ''}${scroll.value === "page" && showFooter.value && stickyFooter.value ? ' sticky-footer' : ''}>${showHeader.value ? `
      <template #header>
        ${[showLeft.value && toggle("left"), 'Workspace', showRight.value && toggle("right")].filter(Boolean).join("\n        ")}
      </template>` : ''}${showLeft.value ? side("left") : ''}
      <h1>Projects</h1>
      <p>Your application content goes here.</p>${showRight.value ? side("right") : ''}${showFooter.value ? '\n      <template #footer>All changes saved</template>' : ''}
    </AppLayout>
  </div>
</template>`;
});
const markdown = computed(() => `\`\`\`vue\n${code.value}\n\`\`\``);
</script>

<template>
  <div class="w-full min-w-0" data-layout-builder>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-base font-semibold">1. Choose regions</h3>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-rotate-ccw" label="Reset" @click="reset" />
    </div>
    <fieldset class="flex flex-wrap gap-x-6 gap-y-3 text-sm">
      <legend class="sr-only">Visible layout regions</legend>
      <label class="flex items-center gap-2"><input v-model="showHeader" type="checkbox">Header</label>
      <label class="flex items-center gap-2"><input v-model="showLeft" type="checkbox">Left sidebar</label>
      <label class="flex items-center gap-2"><input v-model="showRight" type="checkbox">Right sidebar</label>
      <label class="flex items-center gap-2"><input v-model="showFooter" type="checkbox">Footer</label>
    </fieldset>

    <h3 class="mt-6 border-t border-neutral-200 pt-5 text-base font-semibold dark:border-neutral-800">2. Arrange the layout</h3>
    <div class="mt-4 grid items-start gap-4 sm:grid-cols-2">
      <label v-if="showHeader" class="grid gap-1.5 text-sm">Header spans<select v-model="headerSpan" :class="control"><option value="full">Full layout</option><option value="content">Main column only</option></select></label>
      <label v-if="showFooter" class="grid gap-1.5 text-sm">Footer spans<select v-model="footerSpan" :class="control"><option value="full">Full layout</option><option value="content">Main column only</option></select></label>
      <fieldset v-if="showLeft" class="grid gap-3">
        <legend class="mb-2 text-sm font-medium">Left sidebar</legend>
        <label class="grid gap-1.5 text-xs">Placement<select v-model="leftMode" :class="control"><option value="inline">Beside main (reserves space)</option><option value="overlay">Over main (no reserved space)</option></select></label>
        <label class="grid gap-1.5 text-xs">Width: {{ leftSize }} px<input v-model.number="leftSize" type="range" min="128" max="240" step="8" class="w-full accent-neutral-900 dark:accent-white"></label>
      </fieldset>
      <fieldset v-if="showRight" class="grid gap-3">
        <legend class="mb-2 text-sm font-medium">Right sidebar</legend>
        <label class="grid gap-1.5 text-xs">Placement<select v-model="rightMode" :class="control"><option value="inline">Beside main (reserves space)</option><option value="overlay">Over main (no reserved space)</option></select></label>
        <label class="grid gap-1.5 text-xs">Width: {{ rightSize }} px<input v-model.number="rightSize" type="range" min="128" max="240" step="8" class="w-full accent-neutral-900 dark:accent-white"></label>
      </fieldset>
      <label class="grid gap-1.5 text-sm">Scrolling<select v-model="scroll" :class="control"><option value="content">Main only; other regions stay in place</option><option value="page">Whole layout</option></select></label>
      <label v-if="showLeft || showRight" class="grid gap-1.5 text-sm">Collapse behavior<select v-model="collapsible" :class="control"><option value="icon">Keep an icon rail</option><option value="offcanvas">Hide the sidebar</option></select></label>
    </div>
    <fieldset v-if="scroll === 'page' && (showHeader || showFooter)" class="mt-4 flex flex-wrap gap-4 text-sm">
      <legend class="mb-2 text-xs text-neutral-500 dark:text-neutral-400">Keep bars visible while the layout scrolls</legend>
      <label v-if="showHeader" class="flex items-center gap-2"><input v-model="stickyHeader" type="checkbox">Sticky header</label>
      <label v-if="showFooter" class="flex items-center gap-2"><input v-model="stickyFooter" type="checkbox">Sticky footer</label>
    </fieldset>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5 dark:border-neutral-800">
      <h3 class="text-base font-semibold">3. Try the preview</h3>
      <label v-if="showLeft || showRight" class="flex min-w-0 items-center gap-2 text-xs">Sidebar mode<select v-model="previewMode" :class="control"><option value="auto">Browser breakpoint</option><option value="desktop">Desktop</option><option value="mobile">Mobile dialog</option></select></label>
    </div>
    <p class="my-3 text-xs leading-5 text-neutral-600 dark:text-neutral-400">Use Navigation or Inspector to collapse a sidebar or open its mobile dialog. Drag a sidebar edge to resize it. The browser breakpoint uses your window width, not the preview width.</p>
    <Demo :key="previewKey" v-model:left-size="leftSize" v-model:right-size="rightSize" :layout="layout" :scroll="scroll" :show-header="showHeader" :show-footer="showFooter" :show-left="showLeft" :show-right="showRight" :sticky-header="stickyHeader" :sticky-footer="stickyFooter" :collapsible="collapsible" :mobile="mobile" />

    <h3 class="mt-6 text-base font-semibold">Your layout code</h3>
    <p class="my-3 text-xs leading-5 text-neutral-600 dark:text-neutral-400">Props and slots match your settings. Visual styles are omitted, as in the other component examples. The height keeps this example contained; remove the parent and use the default viewport sizing for an application.</p>
    <ComponentCode>
      <ClientOnly>
        <MDC v-slot="{ body, data }" :value="markdown" :parser-options="{ highlight: { theme: { light: 'github-light', dark: 'github-dark' } } }">
          <MDCRenderer v-if="body" :body="body" :data="data" :components="{ pre: GeneratedCodePre }" />
        </MDC>
      </ClientOnly>
    </ComponentCode>
  </div>
</template>
