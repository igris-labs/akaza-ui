import type { AkazaChangeEventDetails } from "../types";

export type AkazaAction = (reasonOrEvent?: string | Event, event?: Event) => void;

export function createChangeDetails(reason: string, event?: Event) {
  let canceled = false;
  const details: AkazaChangeEventDetails = {
    reason,
    ...(event && { event }),
    cancel: () => { canceled = true; },
  };
  return { details, canceled: () => canceled };
}

export function resolveAction(reasonOrEvent?: string | Event, event?: Event) {
  if (typeof reasonOrEvent === "string") {
    return { reason: reasonOrEvent, event };
  }
  if (reasonOrEvent) {
    return { reason: "trigger", event: reasonOrEvent };
  }
  return { reason: "programmatic", event };
}
