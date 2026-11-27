import assert from "node:assert/strict";
import { createPopup, definePrimitive, popupSlots, popupState } from "@ui-sdk/core";
import { dialogPreset } from "@ui-sdk/core/dialog";

const popup = definePrimitive({
  name: "batch13-node-popup",
  options: { defaultOpen: "boolean" },
  state: options => popupState(options),
  api: context => createPopup(context, { preset: dialogPreset }),
  slots: slot => popupSlots(slot),
});
for (let index = 0; index < 20; index++) {
  const instance = popup({ id: "stable", defaultOpen: true });
  try {
    assert.equal(instance.get().open, true);
    assert.equal(instance.get().mounted, true);
  } finally {
    instance.destroy();
  }
}
process.stdout.write("batch13-esm-ssr-ok\n");
