<script setup lang="ts">
import { ref } from "vue";
import { useOverlay } from "akaza-ui";
import OverlayDialog from "./OverlayDialog.vue";
import {
  buttonPrimary,
  canvasCol,
  canvasRow,
  codePill,
  eventEntry,
  eventLog as eventLogClass,
  exampleBlock,
  exampleLabel,
  exampleLabelDescription,
  exampleLabelTitle,
  sectionDescription,
  sectionTitle,
} from "../styles";

const overlay = useOverlay();
const basicModal = overlay.create(OverlayDialog);
const returnModal = overlay.create(OverlayDialog);
const lastResult = ref<string>("(none)");
const destroyLog = ref<string[]>([]);

async function openReturnModal() {
  const { result } = returnModal.open({
    title: "Confirm action",
    message: "Click Confirm or Cancel. You can also press Escape or click the backdrop.",
  });
  const value = await result;
  lastResult.value = value === true ? "confirmed" : value === false ? "canceled" : "dismissed";
}

async function openDestroyModal() {
  const modal = overlay.create(OverlayDialog, { destroyOnClose: true });
  destroyLog.value = ["created", ...destroyLog.value].slice(0, 5);
  const { result } = modal.open({
    title: "Destroy on close",
    message: "This overlay is removed from the DOM when closed.",
  });
  await result;
  destroyLog.value = ["destroyed", ...destroyLog.value].slice(0, 5);
}
</script>

<template>
  <section id="overlay">
    <h2 :class="sectionTitle">Overlay (programmatic)</h2>
    <p :class="sectionDescription">
      Open dialogs, drawers, and other overlays imperatively via <code>useOverlay</code>.
      Mount <code>&lt;OverlayProvider /&gt;</code> at your app root.
    </p>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Basic programmatic open</span>
        <span :class="exampleLabelDescription">
          <code>overlay.create(Component)</code> returns an instance. Call
          <code>instance.open()</code> to show it.
        </span>
      </div>
      <div :class="canvasRow">
        <button
          :class="buttonPrimary"
          @click="basicModal.open({ title: 'Hello!', message: 'Opened programmatically. Press Escape, click the backdrop, or use the buttons to close.' })"
        >
          Open dialog
        </button>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">Await return value</span>
        <span :class="exampleLabelDescription">
          <code>open()</code> returns <code>{ result: Promise }</code>. The promise resolves when
          the component emits <code>close</code>.
        </span>
      </div>
      <div :class="canvasCol">
        <button :class="buttonPrimary" @click="openReturnModal">Open &amp; await</button>
        <code :class="codePill">result: {{ lastResult }}</code>
      </div>
    </div>

    <div :class="exampleBlock">
      <div :class="exampleLabel">
        <span :class="exampleLabelTitle">destroyOnClose</span>
        <span :class="exampleLabelDescription">
          Pass <code>destroyOnClose: true</code> to remove the component from the DOM when closed.
        </span>
      </div>
      <div :class="canvasCol">
        <button :class="buttonPrimary" @click="openDestroyModal">Open (destroy on close)</button>
        <div v-if="destroyLog.length" :class="eventLogClass">
          <code v-for="(entry, i) in destroyLog" :key="i" :class="eventEntry">{{ entry }}</code>
        </div>
      </div>
    </div>
  </section>
</template>
