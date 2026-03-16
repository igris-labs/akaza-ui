const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'details > summary:first-child',
].join(',')

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  ).filter((el) => {
    const style = window.getComputedStyle(el)
    return (
      !el.closest('[aria-hidden="true"]')
      && style.display !== 'none'
      && style.visibility !== 'hidden'
    )
  })
}
