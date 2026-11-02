<script setup lang="ts">
import type {
  AppLayoutConfig,
  AppLayoutScroll,
  AppLayoutSideMode,
  AppLayoutSpan,
  SidebarCollapsible,
} from "akaza-ui";
import { computed, ref } from "vue";
import DocsCode from "../../content/DocsCode.vue";
import { Button as UiButton } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Field } from "../../ui/field";
import { Fieldset } from "../../ui/fieldset";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import BuilderPreview from "./BuilderPreview.vue";
import BuilderSelect from "./BuilderSelect.vue";
import { regionColors } from "./region-colors";

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
const mobile = computed(() =>
  previewMode.value === "auto" ? undefined : previewMode.value === "mobile",
);
const layout = computed<AppLayoutConfig>(() => ({
  header: headerSpan.value,
  footer: footerSpan.value,
  left: leftMode.value,
  right: rightMode.value,
}));
const spans = [
  { value: "full", label: "Across both sidebars" },
  { value: "content", label: "Between sidebars" },
  { value: "left", label: "Above left sidebar" },
  { value: "right", label: "Above right sidebar" },
] satisfies { value: AppLayoutSpan; label: string }[];
const footerSpans = spans.map((option) => ({
  ...option,
  label: option.label.replace("Above", "Below"),
}));
const placementOptions = [
  { value: "inline", label: "Take space beside main" },
  { value: "overlay", label: "Overlay main content" },
] satisfies { value: AppLayoutSideMode; label: string }[];
const collapseOptions = [
  { value: "icon", label: "Keep a compact rail" },
  { value: "offcanvas", label: "Hide completely" },
  { value: false, label: "Do not collapse" },
] satisfies { value: SidebarCollapsible; label: string }[];
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
    ...(showLeft.value
      ? ['const left = useSidebar(useTemplateRef<SidebarController>("leftSidebar"));']
      : []),
    ...(showRight.value
      ? ['const right = useSidebar(useTemplateRef<SidebarController>("rightSidebar"));']
      : []),
    `const layout = ${JSON.stringify(layout.value, null, 2)};`,
  ].join("\n");
  const toggle = (side: "left" | "right") =>
    `<button type="button"${(side === "left" ? leftCollapsible.value : rightCollapsible.value) === false ? ` :disabled="!${side}.isMobile.value"` : ""} :aria-expanded="${side}.isMobile.value ? ${side}.open.value : !${side}.collapsed.value" @click="${side}.toggle">${side === "left" ? "Navigation" : "Inspector"}</button>`;
  const collapseProp = (name: "left" | "right") => {
    const value = name === "left" ? leftCollapsible.value : rightCollapsible.value;
    return value === false ? ':collapsible="false"' : `collapsible="${value}"`;
  };
  const side = (name: "left" | "right") => `
      <template #${name}>
        <Sidebar ref="${name}Sidebar"${name === "right" ? ' side="right"' : ""}
          :default-size="${name === "left" ? leftSize.value : rightSize.value}" :min-size="128" :max-size="240"
          ${collapseProp(name)}${mobile.value === undefined ? "" : ` :mobile="${mobile.value}"`} resizable
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

<template>${!showHeader.value && hasSides ? `\n  ${[showLeft.value && toggle("left"), showRight.value && toggle("right")].filter(Boolean).join("\n  ")}` : ""}
  <div style="height: 24rem; overflow: auto; --akaza-app-layout-viewport-height: 24rem">
    <AppLayout :viewport="false" :layout="layout" scroll="${scroll.value}"${scroll.value === "page" && showHeader.value && stickyHeader.value ? " sticky-header" : ""}${scroll.value === "page" && showFooter.value && stickyFooter.value ? " sticky-footer" : ""}${scroll.value === "page" && showLeft.value && leftMode.value === "inline" && stickyLeft.value ? " sticky-left" : ""}${scroll.value === "page" && showRight.value && rightMode.value === "inline" && stickyRight.value ? " sticky-right" : ""}>${
        showHeader.value
          ? `
      <template #header>
        ${[showLeft.value && toggle("left"), "Workspace", showRight.value && toggle("right")].filter(Boolean).join("\n        ")}
      </template>`
          : ""
      }${showLeft.value ? side("left") : ""}
      <h1>Projects</h1>
      <p>Your application content goes here.</p>${showRight.value ? side("right") : ""}${showFooter.value ? "\n      <template #footer>All changes saved</template>" : ""}
    </AppLayout>
  </div>
</template>`;
});
function isArrangement(arrangement: (typeof arrangements)[number]) {
  return (
    showHeader.value &&
    showFooter.value &&
    showLeft.value &&
    showRight.value &&
    headerSpan.value === arrangement.header &&
    footerSpan.value === arrangement.footer &&
    leftMode.value === "inline" &&
    rightMode.value === "inline"
  );
}
</script>

<template>
  <div
    class="not-prose w-full min-w-0 space-y-6"
    data-layout-builder
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-base font-semibold text-highlighted">Configure your layout</h3>
      <UiButton
        color="secondary"
        variant="outline"
        size="sm"
        @click="reset"
      >
        Reset
      </UiButton>
    </div>
    <Fieldset legend="Try an arrangement">
      <div class="flex flex-wrap gap-2">
        <UiButton
          v-for="arrangement in arrangements"
          :key="arrangement.label"
          color="secondary"
          :variant="isArrangement(arrangement) ? 'solid' : 'outline'"
          :aria-pressed="isArrangement(arrangement)"
          @click="arrange(arrangement.header, arrangement.footer)"
        >
          {{ arrangement.label }}
        </UiButton>
      </div>
    </Fieldset>
    <section
      aria-label="Layout options"
      class="space-y-6 rounded-lg border border-border bg-background p-4 sm:p-5"
    >
      <div>
        <h4 class="text-sm font-semibold text-highlighted">Layout options</h4>
        <p class="mt-2 text-xs leading-5 text-muted-foreground">
          Choose which regions are visible, then decide how they share space. Colors match the
          preview.
        </p>
      </div>
      <div class="grid min-w-0 gap-6 sm:grid-cols-2">
        <section
          class="min-w-0 space-y-4 rounded-lg border border-border p-4"
          aria-label="Header options"
        >
          <div class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :class="regionColors.header.dot"
              aria-hidden="true"
            />
            <Switch
              v-model="showHeader"
              label="Header"
            />
          </div>
          <Fieldset
            :disabled="!showHeader"
            legend="Header settings"
            :ui="{ legend: 'sr-only' }"
            class="disabled:opacity-50"
          >
            <BuilderSelect
              v-model="headerSpan"
              label="Header width"
              :options="spans"
              :hint="spanHint(headerSpan, 'Header')"
            />
            <Checkbox
              v-if="scroll === 'page'"
              v-model="stickyHeader"
              label="Sticky header"
            />
          </Fieldset>
        </section>
        <section
          class="min-w-0 space-y-4 rounded-lg border border-border p-4"
          aria-label="Footer options"
        >
          <div class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :class="regionColors.footer.dot"
              aria-hidden="true"
            />
            <Switch
              v-model="showFooter"
              label="Footer"
            />
          </div>
          <Fieldset
            :disabled="!showFooter"
            legend="Footer settings"
            :ui="{ legend: 'sr-only' }"
            class="disabled:opacity-50"
          >
            <BuilderSelect
              v-model="footerSpan"
              label="Footer width"
              :options="footerSpans"
              :hint="spanHint(footerSpan, 'Footer')"
            />
            <Checkbox
              v-if="scroll === 'page'"
              v-model="stickyFooter"
              label="Sticky footer"
            />
          </Fieldset>
        </section>
        <section
          class="min-w-0 space-y-4 rounded-lg border border-border p-4"
          aria-label="Left sidebar options"
        >
          <div class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :class="regionColors.left.dot"
              aria-hidden="true"
            />
            <Switch
              v-model="showLeft"
              label="Left sidebar"
            />
          </div>
          <Fieldset
            :disabled="!showLeft"
            legend="Left sidebar settings"
            :ui="{ legend: 'sr-only' }"
            class="disabled:opacity-50"
          >
            <BuilderSelect
              v-model="leftMode"
              label="Left placement"
              :options="placementOptions"
              :hint="
                leftMode === 'inline'
                  ? 'Main becomes narrower. No content is covered.'
                  : 'The sidebar covers main without changing its width.'
              "
            />
            <Field :label="`Left width: ${leftSize} px`">
              <Slider
                v-model="leftSize"
                :min="128"
                :max="240"
                :step="8"
                aria-label="Left width"
              />
            </Field>
            <BuilderSelect
              v-model="leftCollapsible"
              label="Left collapse"
              :options="collapseOptions"
              hint="Use the Left sidebar button in the preview to try this."
            />
            <Checkbox
              v-if="scroll === 'page'"
              v-model="stickyLeft"
              :disabled="leftMode !== 'inline'"
              label="Sticky left sidebar"
            />
          </Fieldset>
        </section>
        <section
          class="min-w-0 space-y-4 rounded-lg border border-border p-4"
          aria-label="Right sidebar options"
        >
          <div class="flex items-center gap-2">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :class="regionColors.right.dot"
              aria-hidden="true"
            />
            <Switch
              v-model="showRight"
              label="Right sidebar"
            />
          </div>
          <Fieldset
            :disabled="!showRight"
            legend="Right sidebar settings"
            :ui="{ legend: 'sr-only' }"
            class="disabled:opacity-50"
          >
            <BuilderSelect
              v-model="rightMode"
              label="Right placement"
              :options="placementOptions"
              :hint="
                rightMode === 'inline'
                  ? 'Main becomes narrower. No content is covered.'
                  : 'The sidebar covers main without changing its width.'
              "
            />
            <Field :label="`Right width: ${rightSize} px`">
              <Slider
                v-model="rightSize"
                :min="128"
                :max="240"
                :step="8"
                aria-label="Right width"
              />
            </Field>
            <BuilderSelect
              v-model="rightCollapsible"
              label="Right collapse"
              :options="collapseOptions"
              hint="Use the Right sidebar button in the preview to try this."
            />
            <Checkbox
              v-if="scroll === 'page'"
              v-model="stickyRight"
              :disabled="rightMode !== 'inline'"
              label="Sticky right sidebar"
            />
          </Fieldset>
        </section>
      </div>
      <Fieldset
        legend="Main & behavior"
        :ui="{ content: 'grid min-w-0 gap-6 sm:grid-cols-2' }"
      >
        <template #legend>
          <span class="inline-flex items-center gap-2"><span
            class="size-2.5 rounded-full"
            :class="regionColors.main.dot"
            aria-hidden="true"
          />Main &amp; behavior</span>
        </template>
        <BuilderSelect
          v-model="scroll"
          label="Scrolling"
          :options="[
            { value: 'content', label: 'Scroll main only' },
            { value: 'page', label: 'Scroll whole layout' },
          ]"
          :hint="
            scroll === 'content'
              ? 'Header, footer, and sidebars stay visible. Only main scrolls.'
              : 'Regions move with the page. Enable Sticky to keep an individual region visible.'
          "
        />
        <Fieldset
          :disabled="!showLeft && !showRight"
          class="disabled:opacity-50"
        >
          <BuilderSelect
            v-model="previewMode"
            label="Responsive preview"
            :options="[
              { value: 'auto', label: 'Follow browser width' },
              { value: 'desktop', label: 'Desktop sidebars' },
              { value: 'mobile', label: 'Mobile dialogs' },
            ]"
            hint="Browser width uses the window, not the preview width. Mobile dialogs open using the sidebar buttons."
          />
        </Fieldset>
      </Fieldset>
    </section>
    <section
      aria-label="Layout preview"
      class="min-w-0 space-y-4"
    >
      <h3 class="text-sm font-semibold text-highlighted">Preview</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Try the sidebar controls and resize handles to see how your layout behaves.
      </p>
      <BuilderPreview
        :key="previewKey"
        v-model:left-size="leftSize"
        v-model:right-size="rightSize"
        :layout="layout"
        :scroll="scroll"
        :show-header="showHeader"
        :show-footer="showFooter"
        :show-left="showLeft"
        :show-right="showRight"
        :sticky-header="stickyHeader"
        :sticky-footer="stickyFooter"
        :sticky-left="stickyLeft"
        :sticky-right="stickyRight"
        :left-collapsible="leftCollapsible"
        :right-collapsible="rightCollapsible"
        :mobile="mobile"
      />
    </section>
    <section class="space-y-3">
      <h3 class="text-base font-semibold text-highlighted">Your layout code</h3>
      <p class="text-xs leading-5 text-muted-foreground">
        Props and slots match your settings. The generated example uses unstyled Akaza primitives;
        add your styles or use IPEX. Remove the height container to fill the viewport.
      </p>
      <ComponentCode>
        <DocsCode
          :code="code"
          language="vue"
          filename="AppLayout.vue"
          :pre-attrs="{ 'aria-label': 'Generated Vue layout code' }"
          class="my-0! rounded-none border-0"
        />
      </ComponentCode>
    </section>
  </div>
</template>
