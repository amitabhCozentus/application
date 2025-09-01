import { ColumnFilterDescriptor } from './constants';

export type DataTableLazyLoadEvent = {
  first: number;
  rows: number;
  filters: unknown;
};

/**
 * Central lazy-load handler for PrimeNG tables.
 */
export function handleLazyLoad(params: {
  event: DataTableLazyLoadEvent;
  suppressNextLazyLoad: boolean;
  setSuppressNextLazyLoad: (v: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  buildColumnFilters: (event: DataTableLazyLoadEvent) => ColumnFilterDescriptor[];
  searchTerm: string;
  loadPage: (page: number, size: number, searchTerm: string, columnFilters: ColumnFilterDescriptor[]) => void;
}): void {
  const {
    event,
    suppressNextLazyLoad,
    setSuppressNextLazyLoad,
    setCurrentPage,
    setPageSize,
    buildColumnFilters,
    searchTerm,
    loadPage
  } = params;

  if (suppressNextLazyLoad) {
    setSuppressNextLazyLoad(false);
    return;
  }

  const page = Math.floor(event.first / event.rows);
  setCurrentPage(page);
  setPageSize(event.rows);

  const columnFilters = buildColumnFilters(event);
  loadPage(page, event.rows, searchTerm.trim(), columnFilters);
}

/**
 * Central search handler (Enter, min length).
 */
export function handleSearch(params: {
  searchTerm: string;
  minLength?: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  setSuppressNextLazyLoad: (v: boolean) => void;
  clearTable: () => void;
  loadPage: (page: number, size: number, searchTerm: string, columnFilters: ColumnFilterDescriptor[]) => void;
}): void {
  const {
    searchTerm,
    minLength = 3,
    pageSize,
    setCurrentPage,
    clearFilters,
    setSuppressNextLazyLoad,
    clearTable,
    loadPage
  } = params;

  const trimmed = searchTerm.trim();
  if (trimmed.length >= minLength) {
    setCurrentPage(0);
    clearFilters();
    setSuppressNextLazyLoad(true);
    clearTable();
    loadPage(0, pageSize, trimmed, []);
  }
}

/**
 * Central refresh handler.
 */
export function handleRefresh(params: {
  setSearchTerm: (value: string) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  clearTable: () => void;
}): void {
  const { setSearchTerm, setCurrentPage, clearFilters, clearTable } = params;
  setSearchTerm('');
  setCurrentPage(0);
  clearFilters();
  clearTable();
}
