/**
 * Passed as the second argument to all akaza-ui change emits.
 * Mirrors the Base UI event-details pattern adapted for Vue.
 *
 * @example
 * <Dialog @open-change="(open, details) => {
 *   if (details.reason === 'backdrop-click' && hasUnsavedChanges) details.cancel()
 * }" />
 */
export interface AkazaChangeEventDetails {
  /** Why the change was triggered. Component-specific values documented per-component. */
  reason: string;
  /** The originating DOM event, if any. Absent for programmatic changes. */
  event?: Event;
  /** Call to prevent the state change from happening. */
  cancel: () => void;
}
