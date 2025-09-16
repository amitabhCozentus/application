import { Component, inject, OnInit, computed, ViewChild } from '@angular/core';
import { signal } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PrimengModule } from "../../../../shared/primeng/primeng.module";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { USER_MANUAL_TABLE_HEADERS, TableHeaders, FilterOperation, PaginationState, ApiResponse } from "../../../../shared/lib/constants";
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { CommonTableFilterComponent } from '../../../../shared/component/common-table-filter/common-table-filter.component';
import { UploadDownloadDialogComponent } from '../../../../shared/component/dialog/upload-download-dialog/upload-download-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReleaseManagementService } from '../../../../shared/service/release-management/release-management.service';
import { Table, TablePageEvent } from 'primeng/table';
import { TranslateService } from '@ngx-translate/core';

interface ColumnFilter {
  columnName: string;
  filter: string;
  sort: string;
}

export interface UserManualData {
  id: number;
  noteType: 'RELEASE_NOTE' | 'USER_MANUAL';
  fileName: string;
  releaseUserManualName: string;
  dateOfReleaseNote: string;
  uploadedOn: string;
  uploadedBy: string;
  updatedOn: string;
  updatedBy: string;
}

@Component({
  selector: 'app-user-manual',
  imports: [PrimengModule, CommonTableSearchComponent, CommonTableFilterComponent, UploadDownloadDialogComponent, FormsModule, ReactiveFormsModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './user-manual.component.html',
  styleUrl: './user-manual.component.scss'
})
export class UserManualComponent implements OnInit {

  // Inject the service
  private releaseManagementService: ReleaseManagementService = inject(ReleaseManagementService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);
  private translate: TranslateService = inject(TranslateService);

  // Raw signals for API data
  private rawUserManualSignal = signal<any[]>([]);
  totalRecordsSignal = signal<number>(0);

  // Computed signal with formatted dates
  userManualListSignal = computed(() => {
    return this.rawUserManualSignal().map(item => ({
      ...item
    }));
  });

  cols: TableHeaders[] = USER_MANUAL_TABLE_HEADERS;
  showEditDialog: boolean = false;
  selectedUserManual: any = null;
  searchTerm: string = '';
  columnFilters: ColumnFilter[] = [];
  sortFields: any[] = [];
  // When true, the next onTableFilter (lazy) call will be ignored because
  // we already performed a manual load (used to avoid duplicate API calls)
  private skipNextLazyLoad: boolean = false;

  @ViewChild('userManualTable') userManualTable: Table | undefined;

  paginationState: PaginationState = {
    first: 0,
    rows: 10, // Default to 10 rows per page
    pageIndex: 0,
    pageCount: 0,
    totalRecords: 0
  };

  dateTimeFormat = 'dd/MM/yyyy HH:mm:ss';

  ngOnInit() {
    // Remove table state persistence for rows per page only here
    localStorage.removeItem('userManualTableState');
    this.paginationState.rows = 10;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
  }

  loadUserManualList(
    page: number = 0,
    size: number = 10,
    searchText: string = '',
    columns: ColumnFilter[] = []
  ) {
    // Trim spaces from searchText before using in API call
    const trimmedSearchText = (searchText ?? '').trim();

    // Only fire API if search is empty or at least 3 characters
    if (trimmedSearchText && trimmedSearchText.length < 3) {
      // Optionally clear results if you want, or just return
      return;
    }

    const requestBody = {
      pagination: { page, size },
      searchFilter: {
        searchText: trimmedSearchText,
        columns: ["releaseUserManualName", "dateOfReleaseNote","updatedBy.email"]
      },
      columns: columns ?? []
    };

    this.releaseManagementService.getNotes(requestBody, 'USER_MANUAL').pipe(
      map((response: ApiResponse<UserManualData>) => {
        const rawContent = response?.data?.content || [];
        const total = response?.data?.totalElements || 0;

        // Map DTO fields to table header field names
        const content = rawContent.map((item: any) => ({
          ...item,
          uploadedBy: item.updatedBy,
          manualName: item.releaseUserManualName, // DTO -> Table
          releaseDate: item.dateOfReleaseNote,     // DTO -> Table
        }));

        this.rawUserManualSignal.set(content);
        this.totalRecordsSignal.set(total);

        return { content, total };
      }),
      catchError(error => {
        this.rawUserManualSignal.set([]);
        this.totalRecordsSignal.set(0);
        return of({ content: [], total: 0 });
      })
    ).subscribe({
      next: (result) => {
      },
      error: (error) => {
      }
    });
  }

  onSearch() {
    // Only trigger search if trimmed searchTerm is at least 3 characters or empty (reset)
    const trimmed = this.searchTerm.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      this.paginationState.first = 0;
      this.paginationState.pageIndex = 0;
      this.loadUserManualList(0, this.paginationState.rows, trimmed, []);
    }
  }

  resetSearch() {
    this.searchTerm = '';
    this.columnFilters = [];

    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadUserManualList(0, this.paginationState.rows, '', []);
  }

  refresh() {
    // Remove table state persistence for rows per page and filters on manual refresh
    localStorage.removeItem('userManualTableState');
    this.paginationState = {
      first: 0,
      rows: 10,
      pageIndex: 0,
      pageCount: 0,
      totalRecords: 0
    };
    this.searchTerm = '';
    this.columnFilters = [];

    // Clear PrimeNG table filters in the UI and perform a manual load.
    // Setting skipNextLazyLoad prevents the table's subsequent lazy event
    // from duplicating the API call.
    this.skipNextLazyLoad = true;
    setTimeout(() => {
      if (this.userManualTable) {
        this.userManualTable.clear();
      }
      this.loadUserManualList(0, 10, '', []);
    });
  }

  openAddDialog() {
    this.selectedUserManual = null;
    this.showEditDialog = true;
  }

  openAddRoleDialog() {
    // Keep for backward compatibility
    this.openAddDialog();
  }

  // editUserManual removed: editing user manuals is not supported; only delete and upload

  deleteManual(rowData: any) {
    if (!rowData?.id) {
      console.error('No id present on rowData for delete:', rowData);
      return;
    }
 
    const name = rowData.manualName || rowData.fileName || 'this document';
    const header = this.translate.instant('LBL.CONFIRM.DELETE_HEADER');
    const message = this.translate.instant('LBL.CONFIRM.DELETE_MESSAGE', { name });
    this.confirmationService.confirm({
      message,
      header,
      icon: 'pi pi-trash',
      acceptLabel: this.translate.instant('LBL.YES'),
      rejectLabel: this.translate.instant('LBL.NO'),
      accept: () => {
        this.releaseManagementService.deleteDocument(rowData.id, 'USER_MANUAL').subscribe({
          next: () => {
            // remove from local list/signal
            const current = this.rawUserManualSignal();
            const updated = current.filter((r: any) => r.id !== rowData.id);
            this.rawUserManualSignal.set(updated);
            // decrement total records if > 0
            const total = Math.max(0, this.totalRecordsSignal() - 1);
            this.totalRecordsSignal.set(total);
            console.log('User manual deleted:', rowData.id);
          },
          error: (err) => {
            console.error('Failed to delete user manual', err);
          }
        });
      }
      ,
      reject: () => {
        // User cancelled delete - no action required
        console.log('Delete cancelled for:', rowData.id);
      }
    });
  }

  onDialogClosed() {
    this.showEditDialog = false;
    this.selectedUserManual = null;
    console.log('Dialog closed');
  }

  onUserManualUpdated(updatedData: any) {
    const currentList = this.rawUserManualSignal();

    if (this.selectedUserManual) {
      const index = currentList.findIndex(manual =>
        manual.id === this.selectedUserManual.id || manual.manualName === this.selectedUserManual.manualName
      );
      if (index !== -1) {
        const updatedList = [...currentList];
        updatedList[index] = { ...updatedList[index], ...updatedData };
        this.rawUserManualSignal.set(updatedList);
      }
    } else {
      // For new uploads, refresh the list from the server instead of inserting the item locally  
      this.loadUserManualList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, this.columnFilters);
    }

    this.showEditDialog = false;
    this.selectedUserManual = null;
  }

  loadUserManualData() {
    this.loadUserManualList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, this.columnFilters);
  }

  onPageChange(event: TablePageEvent) {
    // event.page is the zero-based page index visited
    this.paginationState.first = event.first;
    // Only update rows if the user changes the page size
    if (event.rows !== this.paginationState.rows) {
      this.paginationState.rows = event.rows;
    }
    this.paginationState.pageIndex = Math.floor(event.first / this.paginationState.rows);
    this.paginationState.pageCount = Math.ceil(this.totalRecordsSignal() / this.paginationState.rows);
    this.paginationState.totalRecords = this.totalRecordsSignal();

    // Use current filters/search for paging
    if (this.columnFilters && this.columnFilters.length > 0) {
      this.loadUserManualList(this.paginationState.pageIndex, this.paginationState.rows, '', this.columnFilters);
    } else {
      this.loadUserManualList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, []);
    }
  }

  onColumnFilterChange(columns: ColumnFilter[]) {
    this.columnFilters = columns;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    // Always pass both searchTerm and columns
    this.loadUserManualList(0, this.paginationState.rows, this.searchTerm, columns);
  }

  // Map table header field names to backend DTO field names
  private mapTableFieldToDTO(tableField: string): string {
    const fieldMapping: { [key: string]: string } = {
      'manualName': 'releaseUserManualName',
      'releaseDate': 'dateOfReleaseNote',
      'uploadedBy': 'updatedBy.email',
      'uploadedOn': 'uploadedOn'
    };
    return fieldMapping[tableField] || tableField;
  }

  onTableFilter(event: any) {
    // If we recently performed a manual load (refresh/upload) then PrimeNG will
    // still fire a lazy load event; ignore the first one to avoid duplicate API calls.
    if (this.skipNextLazyLoad) {
      this.skipNextLazyLoad = false;
      return;
    }

    // Start with existing columns (preserve filters applied previously)
    const columnsMap = new Map<string, ColumnFilter>();
    (this.columnFilters || []).forEach(c => {
      if (c && c.columnName) columnsMap.set(c.columnName, { ...c });
    });

    // Determine if this event is a single-column sort (no multiSortMeta)
    const multiSortMeta = event?.multiSortMeta || event?.multisortmeta;
    const isSingleColumnSort = !!(event && event.sortField && event.sortOrder && !(multiSortMeta && Array.isArray(multiSortMeta)));
    if (isSingleColumnSort) {
      // Clear existing sort entries from previously stored column filters so
      // they don't get sent along with the new single-column sort.
      columnsMap.forEach((val, key) => {
        columnsMap.set(key, { ...val, sort: '' });
      });
    }

    // Build sort map from event (may be from onSort)
    const sortMap: { [key: string]: string } = {};
    if (event && multiSortMeta && Array.isArray(multiSortMeta)) {
      multiSortMeta.forEach((meta: any) => {
        const dtoField = this.mapTableFieldToDTO(meta.field);
        sortMap[dtoField] = meta.order === 1 ? 'asc' : meta.order === -1 ? 'desc' : '';
      });
    } else if (event && event.sortField && event.sortOrder) {
      // Single-column sort: ensure sortMap contains only this sort (clear previous)
      Object.keys(sortMap).forEach(k => delete sortMap[k]);
      const dtoField = this.mapTableFieldToDTO(event.sortField);
      sortMap[dtoField] = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : '';
    }

    // Add sort entries to columnsMap FIRST (even if no filters exist)
    Object.keys(sortMap).forEach(dtoField => {
      const existing = columnsMap.get(dtoField);
      columnsMap.set(dtoField, {
        columnName: dtoField,
        filter: existing?.filter || '',
        sort: sortMap[dtoField]
      });
    });

    // Process filters from event (if present) and merge into columnsMap
    if (event && event.filters) {
      Object.keys(event.filters).forEach((field) => {
        const filterMeta = event.filters[field];
        const dtoField = this.mapTableFieldToDTO(field);
        const isDate = this.cols.find(h => h.field === field)?.type === 'date';

        if (Array.isArray(filterMeta)) {
          // Check if all filter values are empty (cleared)
          const hasValidFilter = filterMeta.some(meta => 
            meta && meta.value !== undefined && meta.value !== null && meta.value !== ''
          );

          if (hasValidFilter) {
            filterMeta.forEach(meta => {
              if (meta && meta.value !== undefined && meta.value !== null && meta.value !== '') {
                let filterValue = meta.value;
                let type = '';
                if (isDate) {
                  if (meta.value instanceof Date) {
                    const localDate = new Date(meta.value.getFullYear(), meta.value.getMonth(), meta.value.getDate(), 0, 0, 0, 0);
                    const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0));
                    filterValue = utcDate.toISOString().slice(0, 19);
                  }
                  switch (meta.matchMode) {
                    case 'dateAfter': type = FilterOperation.DateGreaterThan; break;
                    case 'dateAfterEquals': type = FilterOperation.DateGreaterThanOrEqual; break;
                    case 'dateBefore': type = FilterOperation.DateLessThan; break;
                    case 'dateBeforeEquals': type = FilterOperation.DateLessThanOrEqual; break;
                    case 'dateIs': type = FilterOperation.DateEquals; break;
                    case 'dateIsNot': type = FilterOperation.DateNotEquals; break;
                    case 'between': type = FilterOperation.DateBetween; break;
                    default: type = '';
                  }
                } else {
                  switch (meta.matchMode) {
                    case 'startsWith': type = FilterOperation.StartsWith; break;
                    case 'contains': type = FilterOperation.Contains; break;
                    case 'notContains': type = FilterOperation.NotContains; break;
                    case 'endsWith': type = FilterOperation.EndsWith; break;
                    case 'equals': type = FilterOperation.Equals; break;
                    case 'notEquals': type = FilterOperation.NotEquals; break;
                    case 'gt': type = FilterOperation.GreaterThan; break;
                    case 'gte': type = FilterOperation.GreaterThanOrEqual; break;
                    case 'lt': type = FilterOperation.LessThan; break;
                    case 'lte': type = FilterOperation.LessThanOrEqual; break;
                    case 'in': type = FilterOperation.In; break;
                    default: type = '';
                  }
                }
                columnsMap.set(dtoField, {
                  columnName: dtoField,
                  filter: type + filterValue,
                  sort: sortMap[dtoField] || (columnsMap.get(dtoField)?.sort || '')
                });
              }
            });
          } else {
            // Filter is cleared - set empty filter to remove it from API call
            const existing = columnsMap.get(dtoField);
            columnsMap.set(dtoField, {
              columnName: dtoField,
              filter: '',
              sort: existing?.sort || sortMap[dtoField] || ''
            });
          }
        } else if (filterMeta) {
          // Handle single filter meta
          const hasValidValue = filterMeta.value !== undefined && filterMeta.value !== null && filterMeta.value !== '';
          
          if (hasValidValue) {
            let filterValue = filterMeta.value;
            let type = '';
            if (isDate) {
              if (filterMeta.value instanceof Date) {
                const localDate = new Date(filterMeta.value.getFullYear(), filterMeta.value.getMonth(), filterMeta.value.getDate(), 0, 0, 0, 0);
                const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0));
                filterValue = utcDate.toISOString().slice(0, 19);
              }
              switch (filterMeta.matchMode) {
                case 'dateAfter': type = FilterOperation.DateGreaterThan; break;
                case 'dateAfterEquals': type = FilterOperation.DateGreaterThanOrEqual; break;
                case 'dateBefore': type = FilterOperation.DateLessThan; break;
                case 'dateBeforeEquals': type = FilterOperation.DateLessThanOrEqual; break;
                case 'dateIs': type = FilterOperation.DateEquals; break;
                case 'dateIsNot': type = FilterOperation.DateNotEquals; break;
                case 'between': type = FilterOperation.DateBetween; break;
                default: type = '';
              }
            } else {
              switch (filterMeta.matchMode) {
                case 'startsWith': type = FilterOperation.StartsWith; break;
                case 'contains': type = FilterOperation.Contains; break;
                case 'notContains': type = FilterOperation.NotContains; break;
                case 'endsWith': type = FilterOperation.EndsWith; break;
                case 'equals': type = FilterOperation.Equals; break;
                case 'notEquals': type = FilterOperation.NotEquals; break;
                case 'gt': type = FilterOperation.GreaterThan; break;
                case 'gte': type = FilterOperation.GreaterThanOrEqual; break;
                case 'lt': type = FilterOperation.LessThan; break;
                case 'lte': type = FilterOperation.LessThanOrEqual; break;
                case 'in': type = FilterOperation.In; break;
                default: type = '';
              }
            }
            columnsMap.set(dtoField, {
              columnName: dtoField,
              filter: type + filterValue,
              sort: sortMap[dtoField] || (columnsMap.get(dtoField)?.sort || '')
            });
          } else {
            // Filter is cleared - set empty filter to remove it from API call
            const existing = columnsMap.get(dtoField);
            columnsMap.set(dtoField, {
              columnName: dtoField,
              filter: '',
              sort: existing?.sort || sortMap[dtoField] || ''
            });
          }
        }
      });
    }

    // Final columns array - exclude columns with empty filters and sorts
    const finalColumns: ColumnFilter[] = Array.from(columnsMap.values()).filter(col => 
      col.filter !== '' || col.sort !== ''
    );

    this.onColumnFilterChange(finalColumns);
  }

  downloadUserManual(rowData: any) {
    // Add logic to download the user manual file
    if (rowData.id) {
      this.releaseManagementService.downloadDocument(rowData.id).subscribe({
        next: (response) => {
          // Handle download response

          window.open(response.data, '_blank', 'noopener,noreferrer');
        },
        error: (error) => {
        }
      });
    }
  }

}
