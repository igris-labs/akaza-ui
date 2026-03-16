import { type Ref, onUnmounted } from 'vue'
import { getFocusableElements } from './focusable'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null = null

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !containerRef.value) return

    const focusable = getFocusableElements(containerRef.value)
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (event.shiftKey) {
      if (document.activeElement === first || document.activeElement === containerRef.value) {
        event.preventDefault()
        last.focus()
      }
    }
    else {
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  function activate() {
    previouslyFocused = document.activeElement as HTMLElement
    if (containerRef.value) {
      const focusable = getFocusableElements(containerRef.value)
      const target = focusable[0] ?? containerRef.value
      target.focus()
    }
    document.addEventListener('keydown', handleKeydown)
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused?.focus()
    previouslyFocused = null
  }

  onUnmounted(deactivate)

  return { activate, deactivate }
}
