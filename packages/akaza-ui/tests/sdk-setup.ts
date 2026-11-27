declare global {
  // eslint-disable-next-line vars-on-top -- Global augmentation requires var, not a runtime declaration.
  var __UI_SDK_STRICT__: boolean | undefined;
}

globalThis.__UI_SDK_STRICT__ = true;

// jsdom has no native popover or animation lifecycle; native behavior is tested in Playwright.
if (typeof HTMLElement !== "undefined") {
  if (!HTMLElement.prototype.showPopover) {
    const openPopovers = new WeakSet<Element>();
    const matches = Element.prototype.matches;
    HTMLElement.prototype.showPopover = function () { openPopovers.add(this); };
    HTMLElement.prototype.hidePopover = function () { openPopovers.delete(this); };
    Element.prototype.matches = function (selector: string) {
      return selector === ":popover-open" ? openPopovers.has(this) : matches.call(this, selector);
    };
  }
  Element.prototype.getAnimations ??= () => [];
}

export {};
