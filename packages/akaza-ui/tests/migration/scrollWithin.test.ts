import { describe, expect, it, vi } from "vitest";
import { scrollWithin } from "../../src/utils/scrollWithin";

describe("bounded option scrolling", () => {
  it("scrolls only the owning viewport when an option is below it", () => {
    const container = document.createElement("div");
    const option = document.createElement("div");
    container.append(option);
    Object.defineProperties(container, { clientHeight: { value: 100 }, clientWidth: { value: 200 } });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ x: 20, y: 100, width: 200, height: 100 }));
    vi.spyOn(option, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ x: 20, y: 220, width: 200, height: 30 }));
    const scrollIntoView = vi.fn();
    option.scrollIntoView = scrollIntoView;
    scrollWithin(option, container);
    expect(container.scrollTop).toBe(50);
    expect(container.scrollLeft).toBe(0);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("accounts for borders and does not scroll already visible options", () => {
    const container = document.createElement("div");
    const option = document.createElement("div");
    container.append(option);
    container.scrollTop = 40;
    Object.defineProperties(container, {
      clientHeight: { value: 100 }, clientWidth: { value: 200 }, clientTop: { value: 2 }, clientLeft: { value: 2 },
    });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ x: 20, y: 100, width: 204, height: 104 }));
    const rect = vi.spyOn(option, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ x: 22, y: 110, width: 100, height: 30 }));
    scrollWithin(option, container);
    expect(container.scrollTop).toBe(40);
    rect.mockReturnValue(DOMRect.fromRect({ x: 22, y: 90, width: 100, height: 30 }));
    scrollWithin(option, container);
    expect(container.scrollTop).toBe(28);
    scrollWithin(document.createElement("div"), container);
    scrollWithin(undefined, container);
    expect(container.scrollTop).toBe(28);
  });
});
