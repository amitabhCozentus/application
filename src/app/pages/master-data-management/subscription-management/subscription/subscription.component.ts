
import { toSignal } from '@angular/core/rxjs-interop';
import { computed, inject, OnInit, ViewChild } from '@angular/core';
import { map, catchError, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TablePageEvent } from 'primeng/table';
import { FilterOperation, SUBSCRIPTION_TABLE_HEADERS } from '../../../../shared/lib/constants';
import { Table } from 'primeng/table';

import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, output } from '@angular/core';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { SubscriptionDialogComponent } from '../../../../shared/component/dialog/subscription-dialog/subscription-dialog.component';
import { CommonService } from '../../../../shared/service/common/common.service';
import { AppRoutes } from '../../../../shared/lib/api-constant';
import { SubscriptionService } from '../../../../shared/service/subscription/subscription.service';
import { SubscriptionCopyDialogComponent } from '../../../../shared/component/dialog/subscription-copy-dialog/subscription-copy-dialog.component';
import { SubscriptionTierDialogComponent } from '../../../../shared/component/dialog/subscription-tier-dialog/subscription-tier-dialog.component';
import { DATE_TIME_FORMAT } from '../../../../shared/lib/constants';

interface Header{
  field: string;
  header: string;
  filterType?: string;
  type?: 'text' | 'numeric' | 'date' | 'boolean' | 'select';
}

interface Subscription {
  customerName: string;
  customerCode: string;
  subscriptionType: string;
  onBoardedOn: string;
  onBoardedSource: string;
  updatedOn?: string;
  updatedBy?: string;
  featureIds?: number[];
}
interface PaginationState {
  first: number;
  rows: number;
  pageIndex: number;
  pageCount: number;
  totalRecords: number;
}

interface SearchFilter {
  searchText: string;
  columns?: string[];
}

interface ColumnFilter {
  columnName: string;
  filter: string;
  sort: string;
}

@Component({
  selector: 'app-subscription',
  imports: [PrimengModule, CommonTableSearchComponent, SubscriptionDialogComponent,SubscriptionCopyDialogComponent, SubscriptionTierDialogComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})


export class SubscriptionComponent implements OnInit {
  @Output() enableSubscriptionDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  showAssignDialog:boolean = false;
  isDialogOpen: boolean = false;
  selectedSubscription: Subscription | null = null;
  selectedCopySubscription: Subscription | null = null;
  subscription:any[];
  subscriptionTableHeader: Header[] = SUBSCRIPTION_TABLE_HEADERS;
  subscriptionList:Subscription[] = [];
  selectedUsers: Subscription[] = [];

  commonService=inject(CommonService);
  subscriptionService=inject(SubscriptionService);
  changeDetectorRef=inject(ChangeDetectorRef);

  private configMasterSignal = toSignal(
    this.subscriptionService.getConfigMaster().pipe(
      map(response => Array.isArray(response?.data) ? response.data : []),
      catchError(err => {
        console.error('API Error:', err);
        return of([]);
      }),
      startWith([])
    )
  );

  features = computed(() =>
    this.configMasterSignal()?.filter((item: any) => item.configType === 'FEATURE_TOGGLE')
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        configType: item.configType
      }))
  );

  subscriptionTier = computed(() =>
    this.configMasterSignal()?.filter((item: any) => item.configType === 'SUBSCRIPTION_TYPE')
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        configType: item.configType
      }))
  );

  isSubscriptionTierButtonActive: boolean = false;
  showSubscriptionTierDialog: boolean = false;
  searchTerm: string = '';
  columnFilters: ColumnFilter[] = [];
  sortFields: any[] = [];

  // Only initialize signals once in the class, not in both property and loadSubscriptionList.
  subscriptionListSignal = signal<Subscription[]>([]);
  totalRecordsSignal = signal<number>(0);

  @ViewChild('existingSubscriptionTable') existingSubscriptionTable: Table | undefined;
  dateTimeFormat = DATE_TIME_FORMAT;

  onSelectionChange(event: any) {
    // event is the array of selected assignments
    this.selectedUsers = event || [];
    this.isSubscriptionTierButtonActive = this.selectedUsers.length > 0;
  }

  openSubscriptionTierDialog() {
    this.showSubscriptionTierDialog = true;
  }

  closeSubscriptionTierDialog() {
    this.showSubscriptionTierDialog = false;
  }

  totalRecords: number ;

   paginationState: PaginationState = {
    first: 0,
    rows: 10, // Always default to 10 rows per page
    pageIndex: 0,
    pageCount: 0,
    totalRecords: 0
  };


  loadSubscriptionList(
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
      searchFilter: { searchText: trimmedSearchText },
      columns: columns ?? []
    };

    // Only call the API once per invocation
    this.subscriptionService.getCustomerSubscriptionList(requestBody).pipe(
      map((response: { data: { content: Array<any>, totalElements: number } }) => {
        const content = response?.data?.content || [];
        const total = response?.data?.totalElements || 0;
        this.subscriptionListSignal.set(content);
        this.totalRecordsSignal.set(total);
      }),
      catchError(error => {
        console.error('Error fetching subscription list', error);
        this.subscriptionListSignal.set([]);
        this.totalRecordsSignal.set(0);
        return of();
      })
    ).subscribe();
  }

  ngOnInit() {
    // Remove table state persistence for rows per page only here
    localStorage.removeItem('existingUserTableState');
    this.paginationState.rows = 10;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadSubscriptionList(0, 10, this.searchTerm, this.columnFilters);
  }

  refresh() {
    // Remove table state persistence for rows per page and filters on manual refresh
    localStorage.removeItem('existingUserTableState');
    this.paginationState = {
      first: 0,
      rows: 10,
      pageIndex: 0,
      pageCount: 0,
      totalRecords: 0
    };
    this.searchTerm = '';
    this.columnFilters = [];

    // Clear PrimeNG table filters in the UI
    setTimeout(() => {
      if (this.existingSubscriptionTable) {
        this.existingSubscriptionTable.clear();
      }
    });

    this.loadSubscriptionList(0, 10, '', []);
  }

  onCopyClick(subscription: Subscription) {
    this.selectedCopySubscription = subscription;
    this.showAssignDialog = true;
  }

  handleCopyDialogClose() {
    this.showAssignDialog = false;
    this.selectedCopySubscription = null;
  }

  handleCopyUpdateSuccess() {
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadSubscriptionList(0, this.paginationState.rows, this.searchTerm, this.columnFilters);
    this.handleCopyDialogClose();
  }

    navigateToEditSubscription(subscription: Subscription) {
        // Always assign a new object reference to trigger change detection
        this.selectedSubscription = { ...subscription };
        this.isDialogOpen = false;
        setTimeout(() => {
          this.isDialogOpen = true;
        }, 0);
    }
  onPageChange(event: TablePageEvent) {
    // event.page is the zero-based page index visited
    this.paginationState.first = event.first;
    // Only update rows if the user changes the page size
    if (event.rows !== this.paginationState.rows) {
      this.paginationState.rows = event.rows;
    }
    this.paginationState.pageIndex = Math.floor(event.first / this.paginationState.rows);
    this.paginationState.pageCount = Math.ceil(this.totalRecords / this.paginationState.rows);
    this.paginationState.totalRecords = this.totalRecords;

    // Use current filters/search for paging
    if (this.columnFilters && this.columnFilters.length > 0) {
      this.loadSubscriptionList(this.paginationState.pageIndex, this.paginationState.rows, '', this.columnFilters);
    } else {
      this.loadSubscriptionList(this.paginationState.pageIndex, this.paginationState.rows, this.searchTerm, []);
    }
  }

  handleSubscriptionTierSave() {
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadSubscriptionList(0, this.paginationState.rows, this.searchTerm, this.columnFilters);
    this.selectedUsers = [];
    this.isSubscriptionTierButtonActive = false;
  }

  handleDialogClose() {
    this.isDialogOpen = false;
    this.selectedSubscription = null;
  }

  onSearch() {
    // Only trigger search if trimmed searchTerm is at least 3 characters or empty (reset)
    const trimmed = this.searchTerm.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      this.paginationState.first = 0;
      this.paginationState.pageIndex = 0;
      this.loadSubscriptionList(0, this.paginationState.rows, trimmed, []);
    }
  }

  resetSearch() {
    this.searchTerm = '';
  // Clear any applied column filters when resetting search
  this.columnFilters = [];
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    this.loadSubscriptionList(0, this.paginationState.rows, '', []);
  }

  onColumnFilterChange(columns: ColumnFilter[]) {
    this.columnFilters = columns;
    this.paginationState.first = 0;
    this.paginationState.pageIndex = 0;
    // Always pass both searchTerm and columns
    this.loadSubscriptionList(0, this.paginationState.rows, this.searchTerm, columns);
  }

  onTableFilter(event: any) {
    const columns: ColumnFilter[] = [];
    const sortMap: { [key: string]: string } = {};

    if (event && event.multiSortMeta && Array.isArray(event.multiSortMeta)) {
      event.multiSortMeta.forEach((meta: any) => {
        sortMap[meta.field] = meta.order === 1 ? 'asc' : meta.order === -1 ? 'desc' : '';
      });
    } else if (event && event.sortField && event.sortOrder) {
      sortMap[event.sortField] = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : '';
    }

  if (event && event.filters) {
      Object.keys(event.filters).forEach((field) => {
        const filterMeta = event.filters[field];
    const isDate = this.subscriptionTableHeader.find(h => h.field === field)?.type === 'date';
        if (Array.isArray(filterMeta)) {
          filterMeta.forEach(meta => {
            if (meta && meta.value !== undefined && meta.value !== null && meta.value !== '') {
              let filterValue = meta.value;
              let filterType = '';
              if (isDate) {
                // Convert to UTC date at midnight and format as yyyy-MM-ddTHH:mm:ss
                if (meta.value instanceof Date) {
                  const localDate = new Date(meta.value.getFullYear(), meta.value.getMonth(), meta.value.getDate(), 0, 0, 0, 0);
                  const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0));
                  filterValue = utcDate.toISOString().slice(0, 19);
                }
                switch (meta.matchMode) {
                  case 'dateAfter': filterType = FilterOperation.DateGreaterThan; break;
                  case 'dateAfterEquals': filterType = FilterOperation.DateGreaterThanOrEqual; break;
                  case 'dateBefore': filterType = FilterOperation.DateLessThan; break;
                  case 'dateBeforeEquals': filterType = FilterOperation.DateLessThanOrEqual; break;
                  case 'dateIs': filterType = FilterOperation.DateEquals; break;
                  case 'dateIsNot': filterType = FilterOperation.DateNotEquals; break;
                  case 'between': filterType = FilterOperation.DateBetween; break;
                  default: filterType = '';
                }
              } else {
                switch (meta.matchMode) {
                  case 'startsWith': filterType = FilterOperation.StartsWith; break;
                  case 'contains': filterType = FilterOperation.Contains; break;
                  case 'notContains': filterType = FilterOperation.NotContains; break;
                  case 'endsWith': filterType = FilterOperation.EndsWith; break;
                  case 'equals': filterType = FilterOperation.Equals; break;
                  case 'notEquals': filterType = FilterOperation.NotEquals; break;
                  case 'gt': filterType = FilterOperation.GreaterThan; break;
                  case 'gte': filterType = FilterOperation.GreaterThanOrEqual; break;
                  case 'lt': filterType = FilterOperation.LessThan; break;
                  case 'lte': filterType = FilterOperation.LessThanOrEqual; break;
                  case 'in': filterType = FilterOperation.In; break;
                  default: filterType = '';
                }
              }
              columns.push({
                columnName: field,
                filter: filterType + filterValue,
                sort: sortMap[field] || ''
              });
            }
          });
        } else if (filterMeta && filterMeta.value !== undefined && filterMeta.value !== null && filterMeta.value !== '') {
          let filterValue = filterMeta.value;
          let filterType = '';
          if (isDate) {
            if (filterMeta.value instanceof Date) {
              const localDate = new Date(filterMeta.value.getFullYear(), filterMeta.value.getMonth(), filterMeta.value.getDate(), 0, 0, 0, 0);
              const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0));
              filterValue = utcDate.toISOString().slice(0, 19);
            }
            switch (filterMeta.matchMode) {
              case 'dateAfter': filterType = FilterOperation.DateGreaterThan; break;
              case 'dateAfterEquals': filterType = FilterOperation.DateGreaterThanOrEqual; break;
              case 'dateBefore': filterType = FilterOperation.DateLessThan; break;
              case 'dateBeforeEquals': filterType = FilterOperation.DateLessThanOrEqual; break;
              case 'dateIs': filterType = FilterOperation.DateEquals; break;
              case 'dateIsNot': filterType = FilterOperation.DateNotEquals; break;
              case 'between': filterType = FilterOperation.DateBetween; break;
              default: filterType = '';
            }
          } else {
            switch (filterMeta.matchMode) {
              case 'startsWith': filterType = FilterOperation.StartsWith; break;
              case 'contains': filterType = FilterOperation.Contains; break;
              case 'notContains': filterType = FilterOperation.NotContains; break;
              case 'endsWith': filterType = FilterOperation.EndsWith; break;
              case 'equals': filterType = FilterOperation.Equals; break;
              case 'notEquals': filterType = FilterOperation.NotEquals; break;
              case 'gt': filterType = FilterOperation.GreaterThan; break;
              case 'gte': filterType = FilterOperation.GreaterThanOrEqual; break;
              case 'lt': filterType = FilterOperation.LessThan; break;
              case 'lte': filterType = FilterOperation.LessThanOrEqual; break;
              case 'in': filterType = FilterOperation.In; break;
              default: filterType = '';
            }
          }
          columns.push({
            columnName: field,
            filter: filterType + filterValue,
            sort: sortMap[field] || ''
          });
        }
      });
    }

    // Merge sort info: ensure a sort column exists for each sorted field
    if (Object.keys(sortMap).length > 0) {
      Object.keys(sortMap).forEach(field => {
        const existing = columns.find(c => c.columnName === field);
        if (existing) {
          existing.sort = sortMap[field];
        } else {
          columns.push({
            columnName: field,
            filter: '',
            sort: sortMap[field]
          });
        }
      });
    }
    this.onColumnFilterChange(columns);
  }
}
