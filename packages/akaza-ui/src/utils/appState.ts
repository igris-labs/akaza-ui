import type { App } from "vue";
import { getCurrentInstance, ssrContextKey } from "vue";

/** Content-bearing defaults belong to a Vue app, never to the server process. */
export function createAppState<T>(create: () => T) {
  const apps = new WeakMap<App, T>();
  let client: T | undefined;
  return (): T => {
    const context = getCurrentInstance()?.appContext;
    const app = context?.app;
    const server = typeof window === "undefined" || Boolean(context && ssrContextKey in context.provides);
    if (!server) return client ??= create();
    if (app) {
      if (!apps.has(app)) apps.set(app, create());
      return apps.get(app)!;
    }
    throw new Error("Akaza state must be used in component setup during SSR, or passed explicitly.");
  };
}
