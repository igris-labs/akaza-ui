import { afterAll, beforeAll } from "vitest";

const original = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");

beforeAll(() => {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    writable: true,
    value: () => [],
  });
});

afterAll(() => {
  if (original) Object.defineProperty(Element.prototype, "getAnimations", original);
  else Reflect.deleteProperty(Element.prototype, "getAnimations");
});
