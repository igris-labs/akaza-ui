<script setup lang="ts">
import type { AppLayoutConfig, AppLayoutScroll, AppLayoutSideMode, AppLayoutSpan, SidebarCollapsible } from "akaza-ui";
import { computed, ref } from "vue";
import GeneratedCodePre from "../../GeneratedCodePre.vue";
import BuilderPreview from "./BuilderPreview.vue";
import BuilderSelect from "./BuilderSelect.vue";

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
const leftCollapsible = ref<SidebarCollapsible>("icon");
const rightCollapsible = ref<SidebarCollapsible>("icon");
const stickyLeft = ref(false);
const stickyRight = ref(false);
const previewMode = ref("auto");
const previewKey = ref(0);
const mobile = computed(() => previewMode.value === "auto" ? undefined : previewMode.value === "mobile");
const layout = computed<AppLayoutConfig>(() => ({ header: headerSpan.value, footer: footerSpan.value, left: leftMode.value, right: rightMode.value }));
const spans = [
  { value: "full", label: "Across both sidebars" },
  { value: "content", label: "Between sidebars" },
  { value: "left", label: "Above left sidebar" },
  { value: "right", label: "Above right sidebar" },
] satisfies { value: AppLayoutSpan; label: string }[];
const footerSpans = spans.map(option => ({ ...option, label: option.label.replace("Above", "Below") }));
const placementOptions = [{ value: "inline", label: "Take space beside main" }, { value: "overlay", label: "Overlay main content" }] satisfies { value: AppLayoutSideMode; label: string }[];
const collapseOptions = [{ value: "icon", label: "Keep a compact rail" }, { value: "offcanvas", label: "Hide completely" }, { value: false, label: "Do not collapse" }] satisfies { value: SidebarCollapsible; label: string }[];
const arrangements = [
  { label: "Bars across", header: "full", footer: "full" },
  { label: "Full-height sidebars", header: "content", footer: "content" },
  { label: "Full-height right", header: "left", footer: "left" },
  { label: "Opposite corners", header: "right", footer: "left" },
] satisfies { label: string; header: AppLayoutSpan; footer: AppLayoutSpan }[];
function arrange(header: AppLayoutSpan, footer: AppLayoutSpan) {
  showHeader.value = showFooter.value = showLeft.value = showRight.value = true;
  headerSpan.value = header;
  footerSpan.value = footer;
  leftMode.value = rightMode.value = "inline";
  previewKey.value += 1;
}
const spanHint = (span: AppLayoutSpan, bar: "Header" | "Footer") => {
  const direction = bar === "Header" ? "below" : "above";
  if (span === "full") return `Both sidebars stop ${direction} the ${bar.toLowerCase()}.`;
  if (span === "content") return `Both sidebars extend alongside the ${bar.toLowerCase()}.`;
  return `The ${span} sidebar stops ${direction} the ${bar.toLowerCase()}; the other extends alongside it.`;
};

function reset() {
  showHeader.value = showFooter.value = showLeft.value = true;
  showRight.value = false;
  headerSpan.value = footerSpan.value = "full";
  leftMode.value = rightMode.value = "inline";
  leftSize.value = 168;
  rightSize.value = 160;
  scroll.value = "content";
  stickyHeader.value = stickyFooter.value = false;
  leftCollapsible.value = rightCollapsible.value = "icon";
  stickyLeft.value = stickyRight.value = false;
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
  const toggle = (side: "left" | "right") => `<button type="button"${(side === "left" ? leftCollapsible.value : rightCollapsible.value) === false ? ` :disabled="!${side}.isMobile.value"` : ''} :aria-expanded="${side}.isMobile.value ? ${side}.open.value : !${side}.collapsed.value" @click="${side}.toggle">${side === "left" ? "Navigation" : "Inspector"}</button>`;
  const collapseProp = (name: "left" | "right") => {
    const value = name === "left" ? leftCollapsible.value : rightCollapsible.value;
    return value === false ? ':collapsible="false"' : `collapsible="${value}"`;
  };
  const side = (name: "left" | "right") => `
      <template #${name}>
        <Sidebar ref="${name}Sidebar"${name === "right" ? ' side="right"' : ''}
          :default-size="${name === "left" ? leftSize.value : rightSize.value}" :min-size="128" :max-size="240"
          ${collapseProp(name)}${mobile.value === undefined ? '' : ` :mobile="${mobile.value}"`} resizable
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
  <div style="height: 24rem; overflow: auto; --akaza-app-layout-viewport-height: 24rem">
    <AppLayout :viewport="false" :layout="layout" scroll="${scroll.value}"${scroll.value === "page" && showHeader.value && stickyHeader.value ? ' sticky-header' : ''}${scroll.value === "page" && showFooter.value && stickyFooter.value ? ' sticky-footer' : ''}${scroll.value === "page" && showLeft.value && leftMode.value === "inline" && stickyLeft.value ? ' sticky-left' : ''}${scroll.value === "page" && showRight.value && rightMode.value === "inline" && stickyRight.value ? ' sticky-right' : ''}>${showHeader.value ? `
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
  <div class="not-prose w-full min-w-0" data-layout-builder>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-base font-semibold">Configure your layout</h3>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-rotate-ccw" label="Reset" @click="reset" />
    </div>
    <fieldset class="mb-4 flex flex-wrap gap-2">
      <legend class="mb-2 text-xs font-medium">Try an arrangement</legend>
      <button v-for="arrangement in arrangements" :key="arrangement.label" type="button" :aria-pressed="showHeader && showFooter && showLeft && showRight && headerSpan === arrangement.header && footerSpan === arrangement.footer && leftMode === 'inline' && rightMode === 'inline'" class="min-h-11 border border-neutral-300 bg-white px-3 text-xs text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 aria-pressed:border-neutral-900 aria-pressed:bg-neutral-100 aria-pressed:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:aria-pressed:border-neutral-400 dark:aria-pressed:bg-neutral-900 dark:aria-pressed:text-white" @click="arrange(arrangement.header, arrangement.footer)">{{ arrangement.label }}</button>
    </fieldset>
    <div class="min-w-0 border border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <section aria-label="Layout options" class="grid min-w-0 items-start gap-x-6 gap-y-5 border-b border-neutral-300 p-4 dark:border-neutral-800 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <h4 class="text-sm font-semibold">Layout options</h4>
          <p class="mt-2 text-xs leading-5 text-neutral-600 dark:text-neutral-400">Choose which regions are visible, then decide how they share space. Colors match the preview.</p>
        </div>
        <fieldset class="grid min-w-0 gap-3 border border-neutral-300 p-4 dark:border-neutral-700">
          <legend class="sr-only">Header options</legend>
          <label class="-mx-4 -mt-4 flex min-h-11 items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900"><span class="size-2.5 shrink-0 bg-sky-500" aria-hidden="true" /><span class="flex-1">Header</span><input v-model="showHeader" type="checkbox" class="size-4 accent-sky-600"></label>
          <fieldset :disabled="!showHeader" class="grid min-w-0 gap-3 disabled:opacity-50">
            <legend class="sr-only">Header settings</legend>
            <BuilderSelect v-model="headerSpan" label="Header width" :options="spans" :hint="spanHint(headerSpan, 'Header')" />
            <label v-if="scroll === 'page'" class="flex min-h-11 items-center gap-2 text-xs"><input v-model="stickyHeader" type="checkbox" class="size-4 accent-sky-600">Sticky header</label>
          </fieldset>
        </fieldset>
        <fieldset class="grid min-w-0 gap-3 border border-neutral-300 p-4 dark:border-neutral-700">
          <legend class="sr-only">Footer options</legend>
          <label class="-mx-4 -mt-4 flex min-h-11 items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900"><span class="size-2.5 shrink-0 bg-rose-500" aria-hidden="true" /><span class="flex-1">Footer</span><input v-model="showFooter" type="checkbox" class="size-4 accent-rose-600"></label>
          <fieldset :disabled="!showFooter" class="grid min-w-0 gap-3 disabled:opacity-50">
            <legend class="sr-only">Footer settings</legend>
            <BuilderSelect v-model="footerSpan" label="Footer width" :options="footerSpans" :hint="spanHint(footerSpan, 'Footer')" />
            <label v-if="scroll === 'page'" class="flex min-h-11 items-center gap-2 text-xs"><input v-model="stickyFooter" type="checkbox" class="size-4 accent-rose-600">Sticky footer</label>
          </fieldset>
        </fieldset>
        <fieldset class="grid min-w-0 gap-3 border border-neutral-300 p-4 dark:border-neutral-700">
          <legend class="sr-only">Left sidebar options</legend>
          <label class="-mx-4 -mt-4 flex min-h-11 items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900"><span class="size-2.5 shrink-0 bg-emerald-500" aria-hidden="true" /><span class="flex-1">Left sidebar</span><input v-model="showLeft" type="checkbox" class="size-4 accent-emerald-600"></label>
          <fieldset :disabled="!showLeft" class="grid min-w-0 gap-3 disabled:opacity-50">
            <legend class="sr-only">Left sidebar settings</legend>
            <BuilderSelect v-model="leftMode" label="Left placement" :options="placementOptions" :hint="leftMode === 'inline' ? 'Main becomes narrower. No content is covered.' : 'The sidebar covers main without changing its width.'" />
            <label class="grid gap-1.5 text-xs">Left width: {{ leftSize }} px<input v-model.number="leftSize" type="range" min="128" max="240" step="8" class="min-h-11 w-full accent-emerald-600"></label>
            <BuilderSelect v-model="leftCollapsible" label="Left collapse" :options="collapseOptions" hint="Use the Left sidebar button in the preview to try this." />
            <label v-if="scroll === 'page'" class="flex min-h-11 items-center gap-2 text-xs has-disabled:opacity-50"><input v-model="stickyLeft" :disabled="leftMode !== 'inline'" type="checkbox" class="size-4 accent-emerald-600">Sticky left sidebar</label>
          </fieldset>
        </fieldset>
        <fieldset class="grid min-w-0 gap-3 border border-neutral-300 p-4 dark:border-neutral-700">
          <legend class="sr-only">Right sidebar options</legend>
          <label class="-mx-4 -mt-4 flex min-h-11 items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900"><span class="size-2.5 shrink-0 bg-amber-500" aria-hidden="true" /><span class="flex-1">Right sidebar</span><input v-model="showRight" type="checkbox" class="size-4 accent-amber-600"></label>
          <fieldset :disabled="!showRight" class="grid min-w-0 gap-3 disabled:opacity-50">
            <legend class="sr-only">Right sidebar settings</legend>
            <BuilderSelect v-model="rightMode" label="Right placement" :options="placementOptions" :hint="rightMode === 'inline' ? 'Main becomes narrower. No content is covered.' : 'The sidebar covers main without changing its width.'" />
            <label class="grid gap-1.5 text-xs">Right width: {{ rightSize }} px<input v-model.number="rightSize" type="range" min="128" max="240" step="8" class="min-h-11 w-full accent-amber-600"></label>
            <BuilderSelect v-model="rightCollapsible" label="Right collapse" :options="collapseOptions" hint="Use the Right sidebar button in the preview to try this." />
            <label v-if="scroll === 'page'" class="flex min-h-11 items-center gap-2 text-xs has-disabled:opacity-50"><input v-model="stickyRight" :disabled="rightMode !== 'inline'" type="checkbox" class="size-4 accent-amber-600">Sticky right sidebar</label>
          </fieldset>
        </fieldset>
        <fieldset class="grid min-w-0 items-start gap-x-6 gap-y-3 border border-neutral-300 p-4 dark:border-neutral-700 sm:col-span-2 sm:grid-cols-2">
          <legend class="sr-only">Layout behavior</legend>
          <span class="-mx-4 -mt-4 flex min-h-11 items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900 sm:col-span-2"><span class="size-2.5 bg-indigo-500" aria-hidden="true" />Main &amp; behavior</span>
          <BuilderSelect v-model="scroll" label="Scrolling" :options="[{ value: 'content', label: 'Scroll main only' }, { value: 'page', label: 'Scroll whole layout' }]" :hint="scroll === 'content' ? 'Header, footer, and sidebars stay visible. Only main scrolls.' : 'Regions move with the page. Enable Sticky to keep an individual region visible.'" />
          <fieldset :disabled="!showLeft && !showRight" class="min-w-0 disabled:opacity-50">
            <legend class="sr-only">Sidebar preview settings</legend>
            <BuilderSelect v-model="previewMode" label="Responsive preview" :options="[{ value: 'auto', label: 'Follow browser width' }, { value: 'desktop', label: 'Desktop sidebars' }, { value: 'mobile', label: 'Mobile dialogs' }]" hint="Browser width uses the window, not the preview width. Mobile dialogs open using the sidebar buttons." />
          </fieldset>
        </fieldset>
      </section>
      <section aria-label="Layout preview" class="min-w-0 p-4">
        <h3 class="mb-2 text-sm font-semibold">Preview</h3>
        <p class="mb-4 text-xs leading-5 text-neutral-600 dark:text-neutral-400">Region colors show which part owns each corner. No application data or styles are added to your exported code.</p>
        <BuilderPreview :key="previewKey" v-model:left-size="leftSize" v-model:right-size="rightSize" :layout="layout" :scroll="scroll" :show-header="showHeader" :show-footer="showFooter" :show-left="showLeft" :show-right="showRight" :sticky-header="stickyHeader" :sticky-footer="stickyFooter" :sticky-left="stickyLeft" :sticky-right="stickyRight" :left-collapsible="leftCollapsible" :right-collapsible="rightCollapsible" :mobile="mobile" />
      </section>
    </div>

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
