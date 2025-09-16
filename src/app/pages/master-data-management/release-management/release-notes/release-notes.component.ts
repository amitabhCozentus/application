import { Component, inject, OnInit, computed, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';
import { map, catchError, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RELEASE_NOTES_TABLE_HEADERS, TableHeaders, FilterOperation, PaginationState, ApiResponse } from '../../../../shared/lib/constants';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { CommonTableFilterComponent } from '../../../../shared/component/common-table-filter/common-table-filter.component';
import { UploadDownloadDialogComponent } from '../../../../shared/component/dialog/upload-download-dialog/upload-download-dialog.component';
import { UserManualComponent } from '../user-manual/user-manual.component';
import { ReleaseManagementService } from '../../../../shared/service/release-management/release-management.service';
import { Table, TablePageEvent } from 'primeng/table';
import { ToastComponent } from '../../../../shared/component/toast-component/toast.component';


interface ColumnFilter {
  columnName: string;
  filter: string;
  sort: string;
}

export interface ReleaseNoteData {
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
  selector: 'app-release-notes',
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, CommonTableSearchComponent, CommonTableFilterComponent, UploadDownloadDialogComponent, UserManualComponent, ToastComponent],
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent implements OnInit {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  // Inject the service
  private releaseManagementService: ReleaseManagementService = inject(ReleaseManagementService);

  // Raw signals for API data
  private rawReleaseNotesSignal = signal<any[]>([]);
  totalRecordsSignal = signal<number>(0);

  // Computed signal with formatted dates
  releaseNotesListSignal = computed(() => {
    return this.rawReleaseNotesSignal().map(item => ({
      ...item
    }));
  });

  cols: TableHeaders[] = RELEASE_NOTES_TABLE_HEADERS;
  showEditDialog: boolean = false;
  selectedReleaseNote: any = null;
  searchTerm: string = '';
  columnFilters: ColumnFilter[] = [];
  sortFields: any[] = [];
  // When true, the next onTableFilter (lazy) call will be ignored because
  // we already performed a manual load (used to avoid duplicate API calls)
  private skipNextLazyLoad: boolean = false;

  @ViewChild('releaseNotesTable') releaseNotesTable: Table | undefined;

  paginationState: PaginationState = {
    first: 0,
    rows: 10, // Default to 10 rows per page
    pageIndex: 0,
    pageCount: 0,
    totalRecords: 0
  };


  ngOnInit() {
    // Remove table state persistence for rows per page only here
    localStorage.removeItem('releaseNotesTableState');
    this.paginationState.rows = 10;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
  }

  loadReleaseNotesList(
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



    this.releaseManagementService.getNotes(requestBody, 'RELEASE_NOTE').pipe(
      map((response: ApiResponse<ReleaseNoteData>) => {
        const rawContent = response?.data?.content || [];
        const total = response?.data?.totalElements || 0;

        // Map DTO fields to table header field names
        const content = rawContent.map((item: any) => ({
          ...item,
          uploadedBy: item.updatedBy,
          releaseName: item.releaseUserManualName, // DTO -> Table
          releaseDate: item.dateOfReleaseNote,     // DTO -> Table
        }));

        this.rawReleaseNotesSignal.set(content);
        this.totalRecordsSignal.set(total);

        return { content, total };
      }),
      catchError(error => {
        this.rawReleaseNotesSignal.set([]);
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
      this.loadReleaseNotesList(0, this.paginationState.rows, trimmed, []);
    }
  }

  resetSearch() {
    this.searchTerm = '';
    this.columnFilters = [];

    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadReleaseNotesList(0, this.paginationState.rows, '', []);
  }

  refresh() {

    // Remove table state persistence for rows per page and filters on manual refresh
    localStorage.removeItem('releaseNotesTableState');
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
      if (this.releaseNotesTable) {
        this.releaseNotesTable.clear();
      }
      this.loadReleaseNotesList(0, 10, '', []);
    });
  }

  openAddDialog() {
    this.selectedReleaseNote = null;
    this.showEditDialog = true;
  }

  openAddRoleDialog() {
    // Open dialog for adding new release notes
    this.selectedReleaseNote = null;
    this.showEditDialog = true;
  }

  editReleaseNotes(rowData: any) {
    this.selectedReleaseNote = { ...rowData };
    this.showEditDialog = true;
  }



  onDialogClosed() {
    this.showEditDialog = false;
    this.selectedReleaseNote = null;

  }

  onReleaseNoteUpdated(updatedData: any) {
    const currentList = this.rawReleaseNotesSignal();

    if (this.selectedReleaseNote) {
      const index = currentList.findIndex(note =>
        note.id === this.selectedReleaseNote.id || note.releaseName === this.selectedReleaseNote.releaseName
      );
      if (index !== -1) {
        const updatedList = [...currentList];
        updatedList[index] = { ...updatedList[index], ...updatedData };
        this.rawReleaseNotesSignal.set(updatedList);
      }
    } else {
      // For new uploads, refresh the list from the server instead of inserting the item locally
      this.loadReleaseNotesList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, this.columnFilters);
    }

    this.showEditDialog = false;
    this.selectedReleaseNote = null;
  }

  onTabChange(event: any) {
    if (event.index === 1) {
      //this.loadUserManualData();
    } else if (event.index === 0) {
      this.loadReleaseNotesData();
    }
  }

  loadReleaseNotesData() {
    this.loadReleaseNotesList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, this.columnFilters);
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
      this.loadReleaseNotesList(this.paginationState.pageIndex, this.paginationState.rows, '', this.columnFilters);
    } else {
      this.loadReleaseNotesList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, []);
    }
  }

  onColumnFilterChange(columns: ColumnFilter[]) {
    this.columnFilters = columns;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    // Always pass both searchTerm and columns
    this.loadReleaseNotesList(0, this.paginationState.rows, this.searchTerm, columns);
  }

  // Map table header field names to backend DTO field names
  private mapTableFieldToDTO(tableField: string): string {
    const fieldMapping: { [key: string]: string } = {
      'releaseName': 'releaseUserManualName',
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


  downloadReleaseNotes(rowData: any, event: Event) {
    // event.preventDefault();
    if (rowData.id) {
      this.releaseManagementService.downloadDocument(rowData.id).subscribe((res: any) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = rowData.fileName ? rowData.fileName : 'ReleaseNote.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Show success toast using ToastComponent
        if (this.toastComponent) {
          this.toastComponent.showSuccess('Success!',
            'PDF File Downloaded successfully.'
          );
        }
      });
    }
  }

}