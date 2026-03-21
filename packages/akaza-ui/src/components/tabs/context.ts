import type { createSharedComposable } from "@vueuse/core";
import type { InjectionKey, Ref } from "vue";

export interface TabsContextState {
  activeTab: Ref<string>;
  orientation: Ref<"horizontal" | "vertical">;
  setTab: (value: string) => void;
}

// The provided value is a shared composable factory, not raw state.
// Each Tabs instance calls createSharedComposable() in its own setup(),
// creating an isolated factory for that component tree.
export type TabsContextFactory = ReturnType<typeof createSharedComposable<() => TabsContextState>>;

export const TABS_CONTEXT_KEY: InjectionKey<TabsContextFactory> = Symbol("TabsContext");
