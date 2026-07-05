export const sectionTitle = "text-lg font-semibold mb-1";
export const sectionDescription = "text-sm mb-8 text-muted-foreground";
export const sectionDescriptionTight = "text-sm mb-6 text-muted-foreground";
export const exampleStack = "space-y-10";
export const exampleTitle = "text-sm font-medium mb-3";
export const exampleBlock = "mb-8";
export const exampleLabel = "mb-3";
export const exampleLabelTitle = "block text-sm font-medium text-foreground";
export const exampleLabelDescription = "text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground";
export const canvas = "rounded-lg border border-border bg-accent p-6";
export const canvasRow = "rounded-lg border border-border bg-accent p-6 flex flex-wrap items-center gap-4";
export const canvasCol = "rounded-lg border border-border bg-accent p-6 space-y-4";
export const canvasGrid = "rounded-lg border border-border bg-accent p-6 grid gap-4";

export const buttonPrimary = "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground no-underline transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50 data-[akaza-loading]:cursor-wait data-[akaza-loading]:opacity-75";
export const buttonGhost = "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50 data-[akaza-loading]:cursor-wait data-[akaza-loading]:opacity-75";
export const buttonDestructive = "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-destructive px-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50 data-[akaza-loading]:cursor-wait data-[akaza-loading]:opacity-75";
export const buttonLink = "inline-flex h-9 items-center justify-center gap-2 rounded-md px-0 text-sm font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50 data-[akaza-loading]:cursor-wait data-[akaza-loading]:opacity-75";
export const codePill = "inline-flex w-max max-w-full items-center rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground";
export const eventLog = "flex flex-col gap-1";
export const eventEntry = "w-max max-w-full rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground";
export const inlineCode = "rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground";
export const footerActions = "flex flex-wrap justify-end gap-2";

export const inputControl = "block h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive data-[akaza-invalid]:border-destructive";
export const fieldLabel = "text-sm font-semibold text-foreground";
export const fieldDescription = "text-xs text-muted-foreground";
export const fieldError = "text-xs text-destructive";
export const fieldRow = "flex flex-wrap items-center gap-2";
export const stateRow = "mt-3 flex flex-wrap items-center gap-2";

export const fieldsetRoot = "min-w-0 rounded-lg border border-border p-4 data-[invalid]:border-destructive data-[akaza-invalid]:border-destructive data-[disabled]:opacity-60 data-[akaza-disabled]:opacity-60";
export const fieldsetLegend = "px-1 text-sm font-semibold text-foreground";
export const fieldsetDescription = "mb-4 text-xs text-muted-foreground";
export const fieldsetContent = "grid gap-4";

export const checkboxUi = {
  wrapper: "gap-3",
  root: "mt-0.5 size-4 rounded border border-border bg-background text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=checked]:border-primary data-[akaza-state=checked]:bg-primary data-[akaza-state=indeterminate]:border-primary data-[akaza-state=indeterminate]:bg-primary data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50",
  indicator: "grid place-items-center text-primary-foreground",
  label: "text-sm font-medium leading-none text-foreground",
  description: "mt-1 block text-xs leading-relaxed text-muted-foreground",
};
export const checkboxLabelBold = "text-sm font-semibold leading-none text-foreground";
export const checkboxLabelMuted = "text-sm font-medium leading-none text-muted-foreground";
export const linkInline = "font-medium text-primary underline underline-offset-2";
export const checkboxCustomUi = {
  wrapper: "gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2",
  root: "mt-0.5 size-5 rounded-md border-2 border-primary bg-background text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=checked]:bg-primary data-[akaza-state=indeterminate]:bg-primary",
  indicator: "grid place-items-center text-primary-foreground",
  label: "text-sm font-semibold text-primary",
  description: "mt-1 block text-xs text-muted-foreground",
};

export const checkboxGroupUi = {
  root: "grid max-w-md gap-3",
  legend: "text-sm font-semibold text-foreground",
  parentItem: "border-b border-border pb-3",
  item: "rounded-md transition-colors data-[akaza-disabled]:opacity-50",
  checkbox: checkboxUi,
};

export const radioItem = "group inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=checked]:text-primary data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50";
export const radioCard = "group flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=checked]:border-primary data-[akaza-state=checked]:bg-primary/5 data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50";
export const radioDot = "size-4 rounded-full border-2 border-border bg-background shadow-[inset_0_0_0_3px_var(--background)] group-data-[akaza-state=checked]:border-primary group-data-[akaza-state=checked]:bg-primary";
export const radioChip = "inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=checked]:border-primary data-[akaza-state=checked]:bg-primary data-[akaza-state=checked]:text-primary-foreground";

export const switchUi = {
  wrapper: "gap-3",
  root: "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=checked]:bg-primary data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50",
  thumb: "grid size-5 translate-x-0.5 place-items-center rounded-full bg-background text-[10px] shadow-sm transition-transform data-[akaza-state=checked]:translate-x-5",
  label: fieldLabel,
  description: fieldDescription,
};

export const switchUiWide = {
  ...switchUi,
  root: "relative inline-flex h-7 w-14 shrink-0 items-center rounded-full bg-muted-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=checked]:bg-primary data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50",
  thumb: "grid size-6 translate-x-0.5 place-items-center rounded-full bg-background text-[11px] shadow-sm transition-transform data-[akaza-state=checked]:translate-x-7",
};

export const toggleRoot = "inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=on]:border-primary data-[akaza-state=on]:bg-primary data-[akaza-state=on]:text-primary-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50";
export const toggleIcon = "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background p-0 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=on]:border-primary data-[akaza-state=on]:bg-primary data-[akaza-state=on]:text-primary-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50";
export const toggleSubtle = "inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[akaza-state=on]:border-primary data-[akaza-state=on]:bg-accent data-[akaza-state=on]:text-accent-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50";

export const progressTrack = "h-2 w-full overflow-hidden rounded-full bg-muted";
export const progressBar = "!h-full !w-[var(--akaza-progress-percentage,0%)] rounded-full bg-primary transition-[width,height] duration-200";
export const progressTrackVertical = "h-32 w-2 overflow-hidden rounded-full bg-muted";
export const progressBarVertical = "!h-[var(--akaza-progress-percentage,0%)] !w-full rounded-full bg-primary transition-[width,height] duration-200";

export const tabsUi = {
  list: "flex border-b border-border",
  tab: "px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:text-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40",
  indicator: "bg-primary",
  panels: "mt-4",
  panel: "text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
};

export const tabsPillUi = {
  list: "inline-flex gap-1 rounded-lg bg-muted p-1",
  tab: "relative rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:text-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40",
  indicator: "hidden",
  panels: "mt-4",
  panel: "text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
};

export const tabsVerticalUi = {
  root: "flex gap-6",
  list: "flex w-40 shrink-0 flex-col border-r border-border",
  tab: "px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[akaza-state=active]:text-foreground data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40",
  indicator: "bg-primary",
  panels: "flex-1",
  panel: "pt-1 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
};

export const tooltipContent = "rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md [&_.akaza-tooltip-arrow]:bg-foreground";
export const popoverContent = "min-w-[200px] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg";
export const menuUi = {
  content: "min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
  submenuContent: "min-w-40 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
  item: "flex w-full cursor-pointer items-center gap-2 rounded-md bg-transparent px-2.5 py-1.5 text-left text-sm text-popover-foreground outline-none transition-colors hover:bg-accent focus:bg-accent data-[akaza-highlighted]:bg-accent data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-40",
  separator: "my-1 h-px bg-border",
  label: "px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
};

export const dialogOverlay = "fixed inset-0 bg-black/50 backdrop-blur-[2px]";
export const dialogOverlayInner = "fixed inset-0 bg-black/40 backdrop-blur-[1px]";
export const dialogContent = "flex max-h-[90dvh] w-[min(90vw,480px)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl [&_.akaza-dialog-body]:flex-1 [&_.akaza-dialog-body]:overflow-y-auto [&_.akaza-dialog-body]:p-5 [&_.akaza-dialog-description]:mb-3 [&_.akaza-dialog-description]:text-sm [&_.akaza-dialog-description]:text-muted-foreground [&_.akaza-dialog-footer]:border-t [&_.akaza-dialog-footer]:border-border [&_.akaza-dialog-footer]:p-4 [&_.akaza-dialog-header]:border-b [&_.akaza-dialog-header]:border-border [&_.akaza-dialog-header]:p-4 [&_.akaza-dialog-title]:text-base [&_.akaza-dialog-title]:font-semibold [&_.akaza-dialog-title]:text-foreground";
export const dialogContentInner = `${dialogContent} z-[400]`;
export const dialogContentFullscreen = `${dialogContent} h-[100dvh] w-screen max-w-none rounded-none border-0`;
export const alertDialogContent = "flex w-[min(90vw,440px)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl [&_.akaza-alert-dialog-body]:px-5 [&_.akaza-alert-dialog-body]:pb-5 [&_.akaza-alert-dialog-body]:pt-3 [&_.akaza-alert-dialog-description]:m-0 [&_.akaza-alert-dialog-description]:text-sm [&_.akaza-alert-dialog-description]:leading-relaxed [&_.akaza-alert-dialog-description]:text-muted-foreground [&_.akaza-alert-dialog-footer]:border-t [&_.akaza-alert-dialog-footer]:border-border [&_.akaza-alert-dialog-footer]:bg-muted [&_.akaza-alert-dialog-footer]:p-4 [&_.akaza-alert-dialog-header]:px-5 [&_.akaza-alert-dialog-header]:pt-5 [&_.akaza-alert-dialog-title]:text-base [&_.akaza-alert-dialog-title]:font-semibold [&_.akaza-alert-dialog-title]:text-foreground";
export const alertDialogCompactContent = `${alertDialogContent} w-[min(90vw,340px)]`;
export const dialogBodyText = "m-0 text-sm leading-relaxed text-muted-foreground";

export const drawerOverlay = "fixed inset-0 bg-black/50 backdrop-blur-[2px]";
export const drawerOverlayReactive = `${drawerOverlay} opacity-[calc(1-var(--drawer-swipe-progress,0))]`;
export const drawerPanel = "z-[200] overflow-hidden border border-border bg-card text-card-foreground shadow-2xl [&_.akaza-drawer-body]:flex-1 [&_.akaza-drawer-body]:overflow-y-auto [&_.akaza-drawer-body]:p-5 [&_.akaza-drawer-description]:text-sm [&_.akaza-drawer-description]:text-muted-foreground [&_.akaza-drawer-footer]:shrink-0 [&_.akaza-drawer-footer]:border-t [&_.akaza-drawer-footer]:border-border [&_.akaza-drawer-footer]:p-4 [&_.akaza-drawer-header]:shrink-0 [&_.akaza-drawer-header]:border-b [&_.akaza-drawer-header]:border-border [&_.akaza-drawer-header]:p-4 [&_.akaza-drawer-title]:text-base [&_.akaza-drawer-title]:font-semibold [&_.akaza-drawer-title]:text-foreground";
export const drawerPanelRight = `${drawerPanel} w-[min(90vw,360px)] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]`;
export const drawerPanelLeft = `${drawerPanel} w-[min(90vw,360px)] shadow-[4px_0_24px_rgba(0,0,0,0.15)]`;
export const drawerPanelBottom = `${drawerPanel} max-h-[60dvh] rounded-t-xl border-b-0`;
export const drawerPanelTop = `${drawerPanel} max-h-[60dvh] rounded-b-xl border-t-0`;
export const drawerHandle = "mx-auto mb-1 mt-3 h-1 w-12 rounded-full bg-muted-foreground/40";

export const avatarRoot = "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground";
export const avatarImage = "block size-full object-cover";
export const avatarFallback = "flex size-full select-none items-center justify-center text-sm font-semibold";
export const avatarPrimary = `${avatarRoot} bg-primary text-primary-foreground`;
export const avatarMuted = `${avatarRoot} bg-muted text-muted-foreground`;

export const collapsibleUi = {
  root: "w-full max-w-md overflow-hidden rounded-lg border border-border bg-background",
  trigger: "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50 [&_.akaza-collapsible-icon]:text-muted-foreground",
  content: "border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground",
};

export const collapsibleCustomUi = {
  root: "w-full max-w-md overflow-hidden rounded-lg border-2 border-primary bg-primary/5",
  trigger: "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
  content: "border-t border-primary/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground",
};

export const accordionRoot = "w-full max-w-md overflow-hidden rounded-lg border border-border bg-background";
export const accordionUi = {
  item: "border-b border-border last:border-b-0",
  trigger: "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[akaza-state=open]:bg-muted data-[akaza-disabled]:cursor-not-allowed data-[akaza-disabled]:opacity-50",
  icon: "text-muted-foreground",
  content: "px-4 pb-4 pt-1 text-sm leading-relaxed text-muted-foreground",
};
export const accordionCustomUi = {
  item: "mb-2 overflow-hidden rounded-md border border-border last:mb-0",
  trigger: "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  icon: "text-primary",
  content: "px-3.5 pb-3 text-sm leading-relaxed text-muted-foreground",
};
