import type { NavigationMenuItem } from ".";

export function getNavigationValue(item: NavigationMenuItem): string {
  return item.value ?? (typeof item.to === "string" ? item.to : item.href) ?? item.label;
}

export function hasNavigationDestination(item: NavigationMenuItem): boolean {
  return Boolean(item.as || item.to != null || item.href !== undefined);
}

export function getNavigationComponent(item: NavigationMenuItem) {
  if (item.as) return item.as;
  if (item.to != null) return "RouterLink";
  if (item.href !== undefined) return "a";
  return "button";
}

export function getNavigationDestinationProps(item: NavigationMenuItem): { to: unknown } | { href: string } | Record<string, never> {
  if (item.to != null) return { to: item.to };
  if (item.href !== undefined) return { href: item.href };
  return {};
}
