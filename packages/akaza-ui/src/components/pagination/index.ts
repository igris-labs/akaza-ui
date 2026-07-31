export { default as Pagination } from "./Pagination.vue";

export interface PaginationPageItem {
  type: "page";
  value: number;
  key: string;
}

export interface PaginationEllipsisItem {
  type: "ellipsis";
  side: "end" | "start";
  key: string;
}

export type PaginationItem = PaginationEllipsisItem | PaginationPageItem;

export interface PaginationUi {
  root?: string;
  list?: string;
  item?: string;
  first?: string;
  previous?: string;
  page?: string;
  ellipsis?: string;
  next?: string;
  last?: string;
}

export interface PaginationProps {
  total?: number;
  itemsPerPage?: number;
  siblingCount?: number;
  showEdges?: boolean;
  showFirstLast?: boolean;
  showPreviousNext?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  getPageHref?: (page: number) => string | undefined;
  ui?: PaginationUi;
}
