<script setup lang="ts">
import { ref } from "vue";
import { Drawer } from "akaza-ui";
import type { AkazaChangeEventDetails } from "akaza-ui";
import {
  buttonGhost,
  buttonPrimary,
  canvasCol,
  canvasRow,
  dialogBodyText,
  drawerHandle,
  drawerOverlay,
  drawerOverlayReactive,
  drawerPanelBottom,
  drawerPanelLeft,
  drawerPanelRight,
  drawerPanelTop,
  eventEntry,
  eventLog as eventLogClass,
  exampleBlock,
  exampleLabel,
  exampleLabelDescription,
  exampleLabelTitle,
  footerActions,
  inlineCode,
  sectionDescriptionTight,
  sectionTitle,
} from "../styles";

const openRight = ref(false);
const openLeft = ref(false);
const openBottom = ref(false);
const openTop = ref(false);
const openInset = ref(false);
const openReactive = ref(false);
const openCustomHeader = ref(false);
const openNoSwipe = ref(false);
const openEvents = ref(false);
const drawerLog = ref<string[]>([]);

const rightUi = { overlay: drawerOverlay, content: drawerPanelRight };
const leftUi = { overlay: drawerOverlay, content: drawerPanelLeft };
const bottomUi = { overlay: drawerOverlay, content: drawerPanelBottom };
const topUi = { overlay: drawerOverlay, content: drawerPanelTop };
const reactiveUi = { overlay: drawerOverlayReactive, content: drawerPanelRight };
const fullGhostButton = `${buttonGhost} w-full`;

function onDrawerChange(open: boolean, details: AkazaChangeEventDetails) {
  drawerLog.value = [`${open ? "open" : "close"} - reason: ${details.reason}`, ...drawerLog.value].slice(0, 5);
}
</script>

<template>
  <section id="drawer">
    <h2 :class="sectionTitle">Drawer</h2>
    <p :class="sectionDescriptionTight">
      A side panel with focus trap, backdrop, and swipe-to-dismiss gestures. Swipe in the dismiss
      direction to close.
    </p>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Right (default)</span>
        <span :class="exampleLabelDescription">Default side, title and description props.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openRight"
          title="Right Drawer"
          description="Swipe right or press Escape to close."
          :ui="rightUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open right</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Left</span>
        <span :class="exampleLabelDescription">Mirrors placement and swipe direction.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openLeft"
          side="left"
          title="Left Drawer"
          description="Swipe left or press Escape to close."
          :ui="leftUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open left</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Bottom sheet</span>
        <span :class="exampleLabelDescription">Uses the <code>#handle</code> slot and footer actions.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openBottom"
          side="bottom"
          title="Bottom Sheet"
          description="Swipe down or press Escape to close."
          :ui="bottomUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open bottom</button>
          </template>
          <template #handle>
            <div :class="drawerHandle" />
          </template>
          <template #footer="{ close }">
            <div :class="footerActions">
              <button :class="buttonGhost" @click="close()">Cancel</button>
              <button :class="buttonPrimary" @click="close()">Confirm</button>
            </div>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Top</span>
        <span :class="exampleLabelDescription">Top edge placement with matching rounded bottom corners.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openTop"
          side="top"
          title="Top Drawer"
          description="Swipe up or press Escape to close."
          :ui="topUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open top</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Inset</span>
        <span :class="exampleLabelDescription">Pass <code>:inset="12"</code> for a floating panel.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openInset"
          side="right"
          :inset="12"
          title="Inset Drawer"
          description="12px inset from all edges with rounded corners."
          :ui="rightUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open inset</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Overlay reacts to swipe progress</span>
        <span :class="exampleLabelDescription">
          <code>--drawer-swipe-progress</code> drives backdrop opacity while dragging.
        </span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openReactive"
          title="Swipe me"
          description="The backdrop fades as you drag."
          :ui="reactiveUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Custom #header slot</span>
        <span :class="exampleLabelDescription">Manual header layout receives <code>close</code> and <code>titleId</code>.</span>
      </div>
      <div :class="canvasRow">
        <Drawer v-model="openCustomHeader" :ui="rightUi">
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open</button>
          </template>
          <template #header="{ close, titleId }">
            <div class="flex items-center justify-between gap-4">
              <h2 :id="titleId" class="m-0 text-base font-semibold text-foreground">Custom header layout</h2>
              <button
                class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
                @click="close()"
              >
                x
              </button>
            </div>
          </template>
          <template #body>
            <p :class="dialogBodyText">
              Full control over the header via the <code :class="inlineCode">#header</code> slot.
            </p>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">swipeToClose: false</span>
        <span :class="exampleLabelDescription">Disable gesture dismissal while keeping Escape and buttons.</span>
      </div>
      <div :class="canvasRow">
        <Drawer
          v-model="openNoSwipe"
          title="No swipe gestures"
          description="Swipe gestures are disabled. Use the button or press Escape."
          :swipe-to-close="false"
          :ui="rightUi"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">@open-change event details</span>
        <span :class="exampleLabelDescription">
          Close via backdrop, Escape, swipe, or button. Each reports a different reason.
        </span>
      </div>
      <div :class="canvasCol">
        <Drawer
          v-model="openEvents"
          title="Event details demo"
          description="Close via backdrop, Escape, swipe, or the button."
          :ui="rightUi"
          @open-change="onDrawerChange"
        >
          <template #trigger="{ toggle }">
            <button :class="buttonPrimary" @click="toggle()">Open</button>
          </template>
          <template #footer="{ close }">
            <button :class="fullGhostButton" @click="close()">Close</button>
          </template>
        </Drawer>
        <div v-if="drawerLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in drawerLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
