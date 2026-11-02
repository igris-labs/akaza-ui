export function useDocsNavigation() {
  return useAsyncData("docs-navigation", () =>
    queryCollectionNavigation("docs", ["navigation", "description"]),
  );
}
