import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionService } from 'src/app/shared/service/subscription/subscription.service';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;
  let subscriptionService: SubscriptionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        SubscriptionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    subscriptionService = TestBed.inject(SubscriptionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadSubscriptionList and update signals', () => {
    const mockResponse = {
      data: {
        content: [
          {
            customerName: 'Test',
            customerCode: '123',
            subscriptionTypeName: 'Premium',
            onboardedOn: '2024-01-01',
            onboardedSourceName: 'Web',
            updatedOn: '2024-01-02',
            updatedBy: 'Admin',
            featureIds: [1, 2]
          }
        ],
        totalElements: 1
      }
    };
    spyOn(subscriptionService, 'getCustomerSubscriptionList').and.returnValue(of(mockResponse));
    component.loadSubscriptionList();
    expect(component.subscriptionListSignal().length).toBe(1);
    expect(component.totalRecordsSignal()).toBe(1);
  });

  it('should open and close Subscription Tier dialog', () => {
    component.openSubscriptionTierDialog();
    expect(component.showSubscriptionTierDialog).toBeTrue();
    component.closeSubscriptionTierDialog();
    expect(component.showSubscriptionTierDialog).toBeFalse();
  });

  it('should handle selection change', () => {
    component.onSelectionChange([{ customerCode: '1' }]);
    expect(component.selectedUsers.length).toBe(1);
    expect(component.isSubscriptionTierButtonActive).toBeTrue();
    component.onSelectionChange([]);
    expect(component.isSubscriptionTierButtonActive).toBeFalse();
  });

  it('should reset search and clear filters', () => {
    spyOn(component, 'loadSubscriptionList');
    component.searchTerm = 'something';
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:Test', sort: '' }];
    component.resetSearch();
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, 10, '', []);
    expect(component.searchTerm).toBe('');
    expect(component.columnFilters).toEqual([]);
  });

  it('should refresh and reset pagination, filters, and search, and clear table filters', () => {
    spyOn(component, 'loadSubscriptionList');
    component.paginationState.rows = 50;
    component.searchTerm = 'abc';
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:Test', sort: '' }];
    // Mock the table clear method
    component.existingSubscriptionTable = { clear: jasmine.createSpy('clear') } as any;
    component.refresh();
    expect(component.paginationState.rows).toBe(10);
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(component.searchTerm).toBe('');
    expect(component.columnFilters).toEqual([]);
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, 10, '', []);
    // Wait for setTimeout to execute
    setTimeout(() => {
      expect(component.existingSubscriptionTable?.clear).toHaveBeenCalled();
    }, 0);
  });

  // ...add more tests as needed for other methods...
  it('should not call API when search text length is 1-2 after trim', () => {
    const spy = spyOn(subscriptionService, 'getCustomerSubscriptionList');
    component.loadSubscriptionList(0, 10, ' a ', []);
    expect(spy).not.toHaveBeenCalled();
  });

  it('onSearch should trigger API only for 0 or >=3 characters', () => {
    const spy = spyOn(subscriptionService, 'getCustomerSubscriptionList').and.returnValue(of({ data: { content: [], totalElements: 0 } } as any));
    component.searchTerm = 'ab';
    component.onSearch();
    expect(spy).not.toHaveBeenCalled();
    component.searchTerm = 'abc';
    component.onSearch();
    expect(spy).toHaveBeenCalled();
    component.searchTerm = '';
    component.onSearch();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('loadSubscriptionList should call API when search is spaces (trim -> empty)', () => {
    const spy = spyOn(subscriptionService, 'getCustomerSubscriptionList').and.returnValue(of({ data: { content: [], totalElements: 0 } } as any));
    component.loadSubscriptionList(0, 10, '   ', []);
    expect(spy).toHaveBeenCalled();
  });

  it('onPageChange should compute pageIndex and pass current filters', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:John', sort: '' }];
    component.totalRecords = 100 as any;
    component.onPageChange({ first: 20, rows: 10 } as any);
    expect(component.paginationState.pageIndex).toBe(2);
    expect(spy).toHaveBeenCalledWith(2, 10, '', component.columnFilters);
  });

  it('onPageChange without filters should reuse current searchTerm', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.columnFilters = [];
    component.searchTerm = 'john';
    component.totalRecords = 42 as any;
    component.onPageChange({ first: 30, rows: 10 } as any);
    expect(component.paginationState.pageIndex).toBe(3);
    expect(spy).toHaveBeenCalledWith(3, 10, 'john', []);
  });

  it('onPageChange updates rows when page size changes', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.columnFilters = [];
    component.searchTerm = '';
    component.totalRecords = 200 as any;
    // Change to 25 rows per page, first=25 -> pageIndex 1
    component.onPageChange({ first: 25, rows: 25 } as any);
    expect(component.paginationState.rows).toBe(25);
    expect(component.paginationState.pageIndex).toBe(1);
    expect(spy).toHaveBeenCalledWith(1, 25, '', []);
  });

  it('onTableFilter should map filters and sorts and call onColumnFilterChange', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        customerName: { value: 'John', matchMode: 'contains' },
        onboardedOn: { value: new Date('2024-01-02'), matchMode: 'dateBefore' }
      },
      sortField: 'customerName',
      sortOrder: 1
    };
    component.onTableFilter(event);
    expect(spy).toHaveBeenCalled();
    const cols = spy.calls.mostRecent().args[0];
    expect(cols.find((c: any) => c.columnName === 'customerName')!.filter.startsWith('cnt:')).toBeTrue();
    expect(cols.find((c: any) => c.columnName === 'onboardedOn')!.filter.startsWith('dlt:')).toBeTrue();
  });

  it('onTableFilter supports multiSortMeta and merges sort into existing columns', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        customerName: { value: 'Ann', matchMode: 'startsWith' }
      },
      multiSortMeta: [
        { field: 'customerName', order: 1 },
        { field: 'updatedOn', order: -1 }
      ]
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    const nameCol = cols.find((c: any) => c.columnName === 'customerName');
    const updatedCol = cols.find((c: any) => c.columnName === 'updatedOn');
    expect(nameCol.sort).toBe('asc');
    expect(updatedCol.sort).toBe('desc');
  });

  it('onTableFilter handles array filter metas including date between', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        onboardedOn: [
          { value: new Date('2024-01-01'), matchMode: 'dateAfterEquals' },
          { value: [new Date('2024-01-01'), new Date('2024-01-31')], matchMode: 'between' }
        ]
      },
      sortField: 'onboardedOn',
      sortOrder: 1
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    const dateCols = cols.filter((c: any) => c.columnName === 'onboardedOn');
    expect(dateCols.some((c: any) => c.filter.startsWith('dgte:'))).toBeTrue();
    expect(dateCols.some((c: any) => c.filter.startsWith('dbetween:'))).toBeTrue();
  });

  it('onTableFilter maps boolean/text filters and multi-sort without filters', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        onboardedSourceName: { value: 'Portal', matchMode: 'equals' },
      },
      multiSortMeta: [
        { field: 'customerName', order: 1 },
        { field: 'updatedOn', order: -1 }
      ]
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    expect(cols).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ columnName: 'onboardedSourceName', filter: jasmine.stringMatching(/^eq:/) }),
      jasmine.objectContaining({ columnName: 'customerName', sort: 'asc' }),
      jasmine.objectContaining({ columnName: 'updatedOn', sort: 'desc' })
    ]));
  });

  it('resetSearch clears column filters before calling API', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:Ann', sort: '' }];
    component.searchTerm = 'foo';
    component.resetSearch();
    const args = spy.calls.mostRecent().args;
    expect(args[3]).toEqual([]);
  });

  it('onTableFilter should support date between and set dbetween prefix', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        onboardedOn: { value: [new Date('2024-01-01'), new Date('2024-01-31')], matchMode: 'between' }
      },
      sortField: 'onboardedOn',
      sortOrder: 1
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    const between = cols.find((c: any) => c.columnName === 'onboardedOn');
    expect(between.filter.startsWith('dbetween:')).toBeTrue();
  });

  it('onTableFilter should send sort-only when no filters present', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {},
      sortField: 'updatedOn',
      sortOrder: -1
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    expect(cols.length).toBe(1);
    expect(cols[0]).toEqual({ columnName: 'updatedOn', filter: '', sort: 'desc' });
  });

  it('onTableFilter maps numeric filters and IN operator', () => {
    const spy = spyOn(component, 'onColumnFilterChange');
    const event: any = {
      filters: {
        customerCode: { value: 100, matchMode: 'gte' },
        subscriptionTypeName: { value: ['A','B'], matchMode: 'in' },
      },
      sortField: 'updatedOn',
      sortOrder: -1
    };
    component.onTableFilter(event);
    const cols = spy.calls.mostRecent().args[0];
    expect(cols).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ columnName: 'customerCode', filter: jasmine.stringMatching(/^gte:/) }),
      jasmine.objectContaining({ columnName: 'subscriptionTypeName', filter: 'in:A,B' }),
      jasmine.objectContaining({ columnName: 'updatedOn', sort: 'desc' }),
    ]));
  });

  it('loadSubscriptionList handles API error by clearing data', () => {
    spyOn(subscriptionService, 'getCustomerSubscriptionList').and.returnValue(throwError(() => new Error('fail')));
    component.subscriptionListSignal.set([{ customerName: 'x' } as any]);
    component.totalRecordsSignal.set(5);
    component.loadSubscriptionList(0,10,'',[]);
    expect(component.subscriptionListSignal().length).toBe(0);
    expect(component.totalRecordsSignal()).toBe(0);
  });

  it('onColumnFilterChange resets pagination and calls load with search + columns', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.paginationState.first = 40;
    component.paginationState.pageIndex = 4;
    component.searchTerm = 'acme';
    const cols = [{ columnName: 'customerName', filter: 'cnt:Acme', sort: '' }];
    component.onColumnFilterChange(cols as any);
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(spy).toHaveBeenCalledWith(0, 10, 'acme', cols as any);
  });

  it('handleSubscriptionTierSave refreshes list and clears selection and button', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    component.paginationState.first = 20;
    component.paginationState.pageIndex = 2;
    component.searchTerm = 'abc';
    component.columnFilters = [{ columnName: 'customerCode', filter: 'eq:123', sort: '' }];
    component.selectedUsers = [{ customerName: 'X' } as any];
    component.isSubscriptionTierButtonActive = true;
    component.handleSubscriptionTierSave();
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(spy).toHaveBeenCalled();
    expect(component.selectedUsers).toEqual([]);
    expect(component.isSubscriptionTierButtonActive).toBeFalse();
  });

  it('handleDialogClose should close and clear selectedSubscription', () => {
    component.isDialogOpen = true;
    component.selectedSubscription = { customerName: 'Y' } as any;
    component.handleDialogClose();
    expect(component.isDialogOpen).toBeFalse();
    expect(component.selectedSubscription).toBeNull();
  });

  it('handleCopy dialog flow should open, refresh, reset, and close', () => {
    const spy = spyOn(component, 'loadSubscriptionList');
    const sub: any = { customerCode: 'C1', customerName: 'Acme' };
    component.onCopyClick(sub);
    expect(component.showAssignDialog).toBeTrue();
    expect(component.selectedCopySubscription).toEqual(sub);
    component.handleCopyUpdateSuccess();
    expect(spy).toHaveBeenCalled();
    expect(component.selectedUsers).toEqual([]);
    expect(component.isSubscriptionTierButtonActive).toBeFalse();
    expect(component.showAssignDialog).toBeFalse();
    expect(component.selectedCopySubscription).toBeNull();
  });

  it('navigateToEditSubscription should set selection and open after timeout', fakeAsync(() => {
    const sub: any = { customerCode: 'C2', customerName: 'Beta' };
    component.isDialogOpen = true;
    component.navigateToEditSubscription(sub);
    expect(component.selectedSubscription).toEqual(sub);
    expect(component.isDialogOpen).toBeFalse();
    tick();
    expect(component.isDialogOpen).toBeTrue();
  }));
});
