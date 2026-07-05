export type AkazaAction = (reasonOrEvent?: string | Event, event?: Event) => void;

export function resolveAction(reasonOrEvent?: string | Event, event?: Event) {
  if (typeof reasonOrEvent === "string") {
    return { reason: reasonOrEvent, event };
  }
  if (reasonOrEvent) {
    return { reason: "trigger", event: reasonOrEvent };
  }
  return { reason: "programmatic", event };
}
