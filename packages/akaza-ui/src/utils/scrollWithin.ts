// Unlike scrollIntoView, never scroll unrelated ancestors or the document.
export function scrollWithin(element: HTMLElement | null | undefined, container: HTMLElement | null | undefined) {
  if (!element || !container || !container.contains(element)) return;
  const item = element.getBoundingClientRect();
  const viewport = container.getBoundingClientRect();
  const top = viewport.top + container.clientTop;
  const left = viewport.left + container.clientLeft;
  if (item.top < top) container.scrollTop += item.top - top;
  else if (item.bottom > top + container.clientHeight) container.scrollTop += item.bottom - top - container.clientHeight;
  if (item.left < left) container.scrollLeft += item.left - left;
  else if (item.right > left + container.clientWidth) container.scrollLeft += item.right - left - container.clientWidth;
}
