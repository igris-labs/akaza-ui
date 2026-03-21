import type { Ref } from "vue";
import { ref } from "vue";

export interface UseTabsOptions {
  defaultTab?: string;
}
export interface UseTabsReturn {
  activeTab: Ref<string>;
  setTab: (value: string) => void;
}

export function useTabs(modelRef?: Ref<string>, options: UseTabsOptions = {}): UseTabsReturn {
  const activeTab = modelRef ?? ref(options.defaultTab ?? "");
  function setTab(value: string) {
    activeTab.value = value;
  }
  return { activeTab, setTab };
}
