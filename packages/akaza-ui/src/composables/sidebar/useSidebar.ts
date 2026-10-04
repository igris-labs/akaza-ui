import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import { useMediaQuery, useMounted } from "@vueuse/core";
import { computed, getCurrentInstance, isRef, ref, toValue } from "vue";

export type SidebarState = "closed" | "collapsed" | "expanded" | "open";

export interface UseSidebarOptions {
  open?: Ref<boolean>;
  collapsed?: Ref<boolean>;
  breakpoint?: MaybeRefOrGetter<string>;
  /** Overrides the media query when responsive state is owned by the application. */
  mobile?: MaybeRefOrGetter<boolean | undefined>;
}

export type SidebarControllerAction = (reasonOrEvent?: string | Event, event?: Event) => void;

export interface SidebarController {
  openValue: MaybeRefOrGetter<boolean>;
  collapsedValue: MaybeRefOrGetter<boolean>;
  sizeValue: MaybeRefOrGetter<number>;
  isMobile: MaybeRefOrGetter<boolean>;
  state: MaybeRefOrGetter<SidebarState>;
  open: SidebarControllerAction;
  close: SidebarControllerAction;
  toggle: SidebarControllerAction;
  openMobile: SidebarControllerAction;
  closeMobile: SidebarControllerAction;
  toggleMobile: SidebarControllerAction;
  expand: SidebarControllerAction;
  collapse: SidebarControllerAction;
  toggleCollapsed: SidebarControllerAction;
  resetSize: SidebarControllerAction;
}

export type SidebarTarget = Readonly<Ref<SidebarController | null | undefined>>;

export interface UseSidebarReturn {
  open: Ref<boolean>;
  collapsed: Ref<boolean>;
  isMobile: ComputedRef<boolean>;
  state: ComputedRef<SidebarState>;
  openMobile: SidebarControllerAction;
  closeMobile: SidebarControllerAction;
  toggleMobile: SidebarControllerAction;
  expand: SidebarControllerAction;
  collapse: SidebarControllerAction;
  toggleCollapsed: SidebarControllerAction;
  /** Toggles mobile visibility or desktop collapse based on the current responsive state. */
  toggle: SidebarControllerAction;
}

export interface UseSidebarTargetReturn extends UseSidebarReturn {
  size: ComputedRef<number>;
  resetSize: SidebarControllerAction;
}

function useSidebarTarget(target: SidebarTarget): UseSidebarTargetReturn {
  const controller = computed(() => target.value);
  const open = computed({
    get: () => toValue(controller.value?.openValue) ?? false,
    set: value => value ? controller.value?.openMobile() : controller.value?.closeMobile(),
  });
  const collapsed = computed({
    get: () => toValue(controller.value?.collapsedValue) ?? false,
    set: value => value ? controller.value?.collapse() : controller.value?.expand(),
  });
  const size = computed(() => toValue(controller.value?.sizeValue) ?? 0);
  const isMobile = computed(() => toValue(controller.value?.isMobile) ?? false);
  const state = computed<SidebarState>(() => toValue(controller.value?.state) ?? "expanded");

  return {
    open,
    collapsed,
    size,
    isMobile,
    state,
    openMobile: (reasonOrEvent, event) => controller.value?.openMobile(reasonOrEvent, event),
    closeMobile: (reasonOrEvent, event) => controller.value?.closeMobile(reasonOrEvent, event),
    toggleMobile: (reasonOrEvent, event) => controller.value?.toggleMobile(reasonOrEvent, event),
    expand: (reasonOrEvent, event) => controller.value?.expand(reasonOrEvent, event),
    collapse: (reasonOrEvent, event) => controller.value?.collapse(reasonOrEvent, event),
    toggleCollapsed: (reasonOrEvent, event) => controller.value?.toggleCollapsed(reasonOrEvent, event),
    toggle: (reasonOrEvent, event) => controller.value?.toggle(reasonOrEvent, event),
    resetSize: (reasonOrEvent, event) => controller.value?.resetSize(reasonOrEvent, event),
  };
}

function useSidebarState(options: UseSidebarOptions): UseSidebarReturn {
  const open = options.open ?? ref(false);
  const collapsed = options.collapsed ?? ref(false);
  const inComponent = !!getCurrentInstance();
  const mounted = useMounted();
  const mediaMatches = useMediaQuery(options.breakpoint ?? "(max-width: 767px)");
  // Match server markup until hydration finishes; explicit overrides remain deterministic.
  const isMobile = computed(() => toValue(options.mobile) ?? ((!inComponent || mounted.value) && mediaMatches.value));
  const state = computed<SidebarState>(() => {
    if (isMobile.value) return open.value ? "open" : "closed";
    return collapsed.value ? "collapsed" : "expanded";
  });

  function openMobile() {
    open.value = true;
  }

  function closeMobile() {
    open.value = false;
  }

  function toggleMobile() {
    open.value = !open.value;
  }

  function expand() {
    collapsed.value = false;
  }

  function collapse() {
    collapsed.value = true;
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  function toggle() {
    if (isMobile.value) toggleMobile();
    else toggleCollapsed();
  }

  return {
    open,
    collapsed,
    isMobile,
    state,
    openMobile,
    closeMobile,
    toggleMobile,
    expand,
    collapse,
    toggleCollapsed,
    toggle,
  };
}

export function useSidebar(target: SidebarTarget): UseSidebarTargetReturn;
export function useSidebar(options?: UseSidebarOptions): UseSidebarReturn;
export function useSidebar(targetOrOptions: SidebarTarget | UseSidebarOptions = {}): UseSidebarReturn | UseSidebarTargetReturn {
  return isRef(targetOrOptions)
    ? useSidebarTarget(targetOrOptions)
    : useSidebarState(targetOrOptions);
}
